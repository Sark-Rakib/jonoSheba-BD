import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/auth/session";
import { SESSION_COOKIE } from "@/lib/constants/site";

/**
 * Optimistic, cookie-only auth redirects (Node runtime).
 * Real authorization (roles, ownership, suspensions) is always re-checked in
 * server components, server actions and route handlers via the DAL.
 */

const PROTECTED_PREFIXES = ["/dashboard", "/business", "/admin"];
const AUTH_PAGES = new Set(["/login", "/register"]);

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (isProtected && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (
    pathname === "/admin" ||
    pathname.startsWith("/admin/")
  ) {
    if (session && session.role !== "admin" && session.role !== "moderator") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  if (AUTH_PAGES.has(pathname) && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/business/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
