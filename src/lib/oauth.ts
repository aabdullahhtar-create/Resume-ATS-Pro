import { cookies } from "next/headers";
import { OAuthProvider } from "@prisma/client";
import { SignJWT, createRemoteJWKSet, importPKCS8, jwtVerify } from "jose";
import { assertProviderConfigured } from "@/lib/auth-config";
import { createSession, normalizeEmail, toSafeUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type SupportedOAuthProvider = "google" | "apple";

type OAuthProfile = {
  provider: OAuthProvider;
  providerUserId: string;
  email: string | null;
  name: string | null;
};

const OAUTH_STATE_COOKIE = "resume_ats_oauth_state";
const STATE_MAX_AGE_SECONDS = 10 * 60;

function base64UrlEncode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function isPlaceholderUrl(value: string) {
  const lowered = value.toLowerCase();
  return lowered.includes("your-site") || lowered.includes("example") || lowered.includes("localhost:xxxx");
}

export function getBaseUrl(requestUrl?: string) {
  if (requestUrl) {
    const url = new URL(requestUrl);
    return url.origin;
  }

  const explicitUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || process.env.NEXTAUTH_URL;
  if (explicitUrl && !isPlaceholderUrl(explicitUrl)) return explicitUrl.replace(/\/$/, "");

  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (process.env.URL && !isPlaceholderUrl(process.env.URL)) return process.env.URL.replace(/\/$/, "");
  return "http://localhost:3000";
}

export function sanitizeNextPath(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  if (value.startsWith("/api/")) return "/dashboard";
  if (value === "/login" || value === "/signup") return "/dashboard";
  return value;
}

export function toProviderEnum(provider: string): OAuthProvider | null {
  if (provider === "google") return OAuthProvider.GOOGLE;
  if (provider === "apple") return OAuthProvider.APPLE;
  return null;
}

function stateCookieOptions(provider: SupportedOAuthProvider) {
  const useCrossSitePostCookie = provider === "apple" && process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    sameSite: useCrossSitePostCookie ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: STATE_MAX_AGE_SECONDS
  } as const;
}

export async function createOAuthState(provider: SupportedOAuthProvider, nextPath: string) {
  const random = crypto.randomUUID();
  const value = [provider, random, base64UrlEncode(nextPath)].join(".");
  const cookieStore = await cookies();

  cookieStore.set(OAUTH_STATE_COOKIE, value, stateCookieOptions(provider));
  return random;
}

export async function readAndClearOAuthState(provider: SupportedOAuthProvider, incomingState: string | null) {
  const cookieStore = await cookies();
  const stored = cookieStore.get(OAUTH_STATE_COOKIE)?.value;

  cookieStore.set(OAUTH_STATE_COOKIE, "", {
    ...stateCookieOptions(provider),
    maxAge: 0
  });

  if (!stored || !incomingState) {
    throw new Error("Login session expired. Please click the login button again. If this happens once, retrying should not be required after this update.");
  }

  const [storedProvider, storedState, encodedNextPath] = stored.split(".");
  if (storedProvider !== provider || storedState !== incomingState) {
    throw new Error("Login security check failed. Please try again from the login page.");
  }

  return sanitizeNextPath(base64UrlDecode(encodedNextPath || ""));
}

export function getAuthorizationUrl(provider: SupportedOAuthProvider, state: string, requestUrl?: string) {
  assertProviderConfigured(provider);

  const baseUrl = getBaseUrl(requestUrl);
  const redirectUri = `${baseUrl}/api/auth/oauth/${provider}/callback`;

  if (provider === "google") {
    const clientId = process.env.GOOGLE_CLIENT_ID || "";

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      state,
      prompt: "select_account",
      include_granted_scopes: "true"
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  const clientId = process.env.APPLE_CLIENT_ID || "";
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    response_mode: "form_post",
    scope: "name email",
    state
  });

  return `https://appleid.apple.com/auth/authorize?${params.toString()}`;
}

function oauthTokenError(provider: "Google" | "Apple", data: Record<string, unknown>, fallback: string) {
  const raw = String(data.error_description || data.error || fallback);
  const message = raw.toLowerCase();

  if (message.includes("redirect_uri_mismatch") || message.includes("redirect_uri")) {
    return `${provider} login redirect URL is not configured correctly. Add this exact callback URL in the ${provider} developer console, then try again.`;
  }

  if (message.includes("invalid_client") || message.includes("unauthorized_client")) {
    return `${provider} login client ID or secret is invalid. Check the ${provider} OAuth environment variables.`;
  }

  if (message.includes("invalid_grant")) {
    return `${provider} login session expired or the callback URL changed during login. Start again from the login page.`;
  }

  return raw;
}

async function exchangeGoogleCode(code: string, requestUrl?: string) {
  const baseUrl = getBaseUrl(requestUrl);
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirect_uri: `${baseUrl}/api/auth/oauth/google/callback`,
      grant_type: "authorization_code"
    })
  });

  const tokenData = await tokenResponse.json();
  if (!tokenResponse.ok || !tokenData.access_token) {
    throw new Error(oauthTokenError("Google", tokenData, "Google login failed while requesting access token."));
  }

  const profileResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` }
  });

  const profile = await profileResponse.json();
  if (!profileResponse.ok || !profile.sub || !profile.email) {
    throw new Error("Google profile could not be loaded. Please try another Google account or use email signup.");
  }

  return {
    provider: OAuthProvider.GOOGLE,
    providerUserId: profile.sub as string,
    email: normalizeEmail(profile.email as string),
    name: typeof profile.name === "string" ? profile.name : null
  } satisfies OAuthProfile;
}

async function createAppleClientSecret() {
  const teamId = process.env.APPLE_TEAM_ID;
  const clientId = process.env.APPLE_CLIENT_ID;
  const keyId = process.env.APPLE_KEY_ID;
  const privateKey = process.env.APPLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!teamId || !clientId || !keyId || !privateKey) {
    throw new Error("Apple login is not configured yet. Add APPLE_CLIENT_ID, APPLE_TEAM_ID, APPLE_KEY_ID, and APPLE_PRIVATE_KEY.");
  }

  const key = await importPKCS8(privateKey, "ES256");

  return new SignJWT({})
    .setProtectedHeader({ alg: "ES256", kid: keyId })
    .setIssuer(teamId)
    .setAudience("https://appleid.apple.com")
    .setSubject(clientId)
    .setIssuedAt()
    .setExpirationTime("180d")
    .sign(key);
}

function parseAppleUser(rawUser?: string | null) {
  if (!rawUser) return { name: null as string | null, email: null as string | null };

  try {
    const userInfo = JSON.parse(rawUser) as {
      email?: string;
      name?: { firstName?: string; lastName?: string };
    };

    return {
      name: [userInfo.name?.firstName, userInfo.name?.lastName].filter(Boolean).join(" ") || null,
      email: typeof userInfo.email === "string" ? normalizeEmail(userInfo.email) : null
    };
  } catch {
    return { name: null, email: null };
  }
}

async function exchangeAppleCode(code: string, rawUser?: string | null, requestUrl?: string) {
  const baseUrl = getBaseUrl(requestUrl);
  const clientSecret = await createAppleClientSecret();

  const tokenResponse = await fetch("https://appleid.apple.com/auth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.APPLE_CLIENT_ID || "",
      client_secret: clientSecret,
      redirect_uri: `${baseUrl}/api/auth/oauth/apple/callback`,
      grant_type: "authorization_code"
    })
  });

  const tokenData = await tokenResponse.json();
  if (!tokenResponse.ok || !tokenData.id_token) {
    throw new Error(oauthTokenError("Apple", tokenData, "Apple login failed while requesting identity token."));
  }

  const appleJwks = createRemoteJWKSet(new URL("https://appleid.apple.com/auth/keys"));
  const { payload } = await jwtVerify(tokenData.id_token, appleJwks, {
    issuer: "https://appleid.apple.com",
    audience: process.env.APPLE_CLIENT_ID || ""
  });

  const appleUser = parseAppleUser(rawUser);
  const email = typeof payload.email === "string" ? normalizeEmail(payload.email) : appleUser.email;
  const sub = typeof payload.sub === "string" ? payload.sub : null;

  if (!sub) {
    throw new Error("Apple did not return a valid user id. Check your Apple Service ID and callback URL.");
  }

  return {
    provider: OAuthProvider.APPLE,
    providerUserId: sub,
    email,
    name: appleUser.name
  } satisfies OAuthProfile;
}

export async function exchangeOAuthCode(provider: SupportedOAuthProvider, code: string, rawAppleUser?: string | null, requestUrl?: string) {
  if (provider === "google") return exchangeGoogleCode(code, requestUrl);
  return exchangeAppleCode(code, rawAppleUser, requestUrl);
}

export async function findOrCreateOAuthUser(profile: OAuthProfile) {
  const existingAccount = await prisma.oAuthAccount.findUnique({
    where: {
      provider_providerUserId: {
        provider: profile.provider,
        providerUserId: profile.providerUserId
      }
    },
    include: { user: true }
  });

  if (existingAccount) {
    return existingAccount.user;
  }

  if (!profile.email) {
    throw new Error(
      "Apple did not share an email for this first login. Use email signup, or remove this app from your Apple ID settings and try Continue with Apple again."
    );
  }

  const user = await prisma.user.upsert({
    where: { email: profile.email },
    update: {
      name: profile.name || undefined,
      accounts: {
        create: {
          provider: profile.provider,
          providerUserId: profile.providerUserId,
          email: profile.email
        }
      }
    },
    create: {
      email: profile.email,
      name: profile.name,
      passwordHash: null,
      accounts: {
        create: {
          provider: profile.provider,
          providerUserId: profile.providerUserId,
          email: profile.email
        }
      }
    }
  });

  return user;
}

export async function completeOAuthSignIn(profile: OAuthProfile) {
  const user = await findOrCreateOAuthUser(profile);
  await createSession(user.id);
  return toSafeUser(user);
}
