import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require login
const PROTECTED_PATHS = [
  "/post/new",
  "/profile/edit",
  "/notifications",
  "/recipes/new",
];

// "/" is the landing page — guests stay there, logged-in users see feed

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("session_token")?.value;

  // Block protected routes for guests
  if (!token && PROTECTED_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Already logged in — skip auth pages
  if (token && (pathname === "/auth/login" || pathname === "/auth/register")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
