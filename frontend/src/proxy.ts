import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE = "accessToken";

const AUTH_PAGES = new Set([
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
]);

const PROTECTED_PREFIXES = ["/chat", "/search", "/account"];

function hasAuth(request: NextRequest) {
  return Boolean(request.cookies.get(AUTH_COOKIE)?.value);
}

function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authed = hasAuth(request);

  if (authed && AUTH_PAGES.has(pathname)) {
    return NextResponse.redirect(new URL("/chat", request.url));
  }

  if (!authed && isProtectedPath(pathname)) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
