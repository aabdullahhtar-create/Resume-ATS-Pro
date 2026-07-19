import { NextResponse } from "next/server";
import { createOAuthState, getAuthorizationUrl, sanitizeNextPath, toProviderEnum, type SupportedOAuthProvider } from "@/lib/oauth";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ provider: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { provider } = await context.params;
  const providerEnum = toProviderEnum(provider);

  if (!providerEnum) {
    return NextResponse.json({ error: "Unsupported login provider." }, { status: 400 });
  }

  try {
    const url = new URL(request.url);
    const nextPath = sanitizeNextPath(url.searchParams.get("next"));
    const state = await createOAuthState(provider as SupportedOAuthProvider, nextPath);
    const authorizationUrl = getAuthorizationUrl(provider as SupportedOAuthProvider, state, request.url);

    const response = NextResponse.redirect(authorizationUrl);
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "OAuth login could not be started.";
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", message);
    return NextResponse.redirect(loginUrl);
  }
}
