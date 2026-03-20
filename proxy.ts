import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

const AUTH_PATHS = ["/login", "/register"];
const PROTECTED_PATHS = ["/dashboard", "/content", "/profile", "/payment"];
const ADMIN_PATHS = ["/admin"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip static files and API routes (API routes handle their own auth)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/webhooks") ||
    pathname.startsWith("/uploads") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("auth_token")?.value;
  const payload = token ? verifyToken(token) : null;

  // Redirect logged-in users away from auth pages
  if (payload && AUTH_PATHS.some((p) => pathname.startsWith(p))) {
    const redirectTo = payload.role === "ADMIN" ? "/admin" : "/dashboard";
    return NextResponse.redirect(new URL(redirectTo, req.url));
  }

  // Protect admin routes
  if (ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
    if (!payload) {
      return NextResponse.redirect(new URL("/login?redirect=/admin", req.url));
    }
    if (payload.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // Protect user routes
  if (PROTECTED_PATHS.some((p) => pathname.startsWith(p))) {
    if (!payload) {
      return NextResponse.redirect(
        new URL(`/login?redirect=${pathname}`, req.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
