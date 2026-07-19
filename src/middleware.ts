import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "resume_ats_session";

const protectedPages = ["/builder", "/generate-ai", "/templates", "/ats-checker", "/pricing", "/dashboard"];
const protectedApis = ["/api/ats", "/api/upload", "/api/resumes", "/api/voice-resume"];

function isProtectedPath(pathname: string) {
  return [...protectedPages, ...protectedApis].some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE_NAME)?.value);

  if (hasSession) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Please sign up or log in before using this feature." }, { status: 401 });
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/builder/:path*",
    "/generate-ai/:path*",
    "/templates/:path*",
    "/ats-checker/:path*",
    "/pricing/:path*",
    "/dashboard/:path*",
    "/api/ats/:path*",
    "/api/upload/:path*",
    "/api/resumes/:path*",
    "/api/voice-resume/:path*"
  ]
};
