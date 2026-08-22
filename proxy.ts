import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_NAME, verifyToken } from "@/lib/auth";

function matchesPath(pathname: string, basePath: string) {
  return pathname === basePath || pathname.startsWith(`${basePath}/`);
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublicRoute = [
    "/auth/login",
    "/auth/signup",
    "/auth/forgot-password",
    "/auth/reset-password",
  ].some((path) => matchesPath(pathname, path));

  const isCompanyRoute = matchesPath(pathname, "/company");
  const isStudentRoute = matchesPath(pathname, "/student");
  const isAdminRoute = matchesPath(pathname, "/admin") && !matchesPath(pathname, "/admin/login");

  // Bypass proxy for static/api routes if they somehow match, but config.matcher handles this
  // Not strictly needed here, but safe to keep checking if desired.

  const token = req.cookies.get(COOKIE_NAME)?.value;
  let sessionPayload: Awaited<ReturnType<typeof verifyToken>> = null;

  if (token) {
    sessionPayload = await verifyToken(token);
  }

  /* 1. Not logged in & accessing protected route -> redirect to login */
  if (!sessionPayload) {
    if (isAdminRoute) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    if (isCompanyRoute || isStudentRoute) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  }

  /* 2. Logged in & visiting auth page -> redirect to appropriate dashboard */
  if (sessionPayload && isPublicRoute) {
    if (sessionPayload.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
    const dest =
      sessionPayload.role === "STUDENT"
        ? "/student/dashboard"
        : "/company/dashboard";
    return NextResponse.redirect(new URL(dest, req.url));
  }

  /* 3. Role protection guard */
  if (sessionPayload) {
    const role = sessionPayload.role;

    if (isCompanyRoute && role !== "COMPANY") {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
    if (isStudentRoute && role !== "STUDENT") {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
    if (isAdminRoute && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
