import { NextResponse } from "next/server";
import { completeOAuthSignIn, exchangeOAuthCode, readAndClearOAuthState, toProviderEnum, type SupportedOAuthProvider } from "@/lib/oauth";
import { getReadableError } from "@/lib/api-errors";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ provider: string }>;
};

function providerErrorMessage(provider: string, error: string) {
  const lowered = error.toLowerCase();
  const label = provider === "google" ? "Google" : "Apple";

  if (lowered.includes("access_denied")) {
    return `${label} login was cancelled or blocked. Please try again.`;
  }

  if (lowered.includes("invalid_request") || lowered.includes("invalid_client") || lowered.includes("unauthorized_client")) {
    return `${label} login is not configured correctly. Check client ID, secret/key, and callback URL.`;
  }

  return error;
}

async function handleCallback(request: Request, context: RouteContext, formData?: FormData) {
  const { provider } = await context.params;
  const providerEnum = toProviderEnum(provider);

  if (!providerEnum) {
    return NextResponse.json({ error: "Unsupported login provider." }, { status: 400 });
  }

  const url = new URL(request.url);
  const code = (formData?.get("code") as string | null) || url.searchParams.get("code");
  const state = (formData?.get("state") as string | null) || url.searchParams.get("state");
  const error = (formData?.get("error") as string | null) || url.searchParams.get("error");
  const rawAppleUser = formData?.get("user") as string | null;

  try {
    if (error) throw new Error(providerErrorMessage(provider, error));
    if (!code) throw new Error("OAuth code was not returned. Please try again.");

    const nextPath = await readAndClearOAuthState(provider as SupportedOAuthProvider, state);
    const profile = await exchangeOAuthCode(provider as SupportedOAuthProvider, code, rawAppleUser, request.url);
    await completeOAuthSignIn(profile);

    const response = NextResponse.redirect(new URL(nextPath, request.url));
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return response;
  } catch (err) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", getReadableError(err, "Login failed. Please try again."));
    const response = NextResponse.redirect(loginUrl);
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return response;
  }
}

export async function GET(request: Request, context: RouteContext) {
  return handleCallback(request, context);
}

export async function POST(request: Request, context: RouteContext) {
  const formData = await request.formData();
  return handleCallback(request, context, formData);
}
