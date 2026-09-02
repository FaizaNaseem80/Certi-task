import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_NAME, verifyToken } from "@/lib/auth";

function matchesPath(pathname: string, basePath: string) {
  return pathname === basePath || pathname.startsWith(`${basePath}/`);
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublicAuthRoute = [
    "/auth/login",
    "/auth/signup",
    "/auth/forgot-password",
    "/auth/reset-password",
  ].some((path) => matchesPath(pathname, path));

  const isCompanyRoute = matchesPath(pathname, "/company");
  const isStudentRoute = matchesPath(pathname, "/student");
  const isAdminRoute = matchesPath(pathname, "/admin") && !matchesPath(pathname, "/admin/login");

  const token = req.cookies.get(COOKIE_NAME)?.value;
  let sessionPayload: Awaited<ReturnType<typeof verifyToken>> = null;

  if (token) {
    sessionPayload = await verifyToken(token);
  }

  /* 1. Unauthenticated user trying to access protected routes */
  if (!sessionPayload) {
    if (isAdminRoute) {
      const response = NextResponse.redirect(new URL("/admin/login", req.url));
      response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      return response;
    }
    if (isCompanyRoute || isStudentRoute) {
      const response = NextResponse.redirect(new URL("/auth/login", req.url));
      response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      return response;
    }
  }

  /* 2. Authenticated user visiting auth pages -> redirect to proper dashboard */
  if (sessionPayload && isPublicAuthRoute) {
    let dest = "/student/dashboard";
    if (sessionPayload.role === "ADMIN") dest = "/admin/dashboard";
    else if (sessionPayload.role === "COMPANY") dest = "/company/dashboard";

    const response = NextResponse.redirect(new URL(dest, req.url));
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    return response;
  }

  /* 3. Role enforcement & cross-role isolation */
  if (sessionPayload) {
    const role = sessionPayload.role;

    if (isCompanyRoute && role !== "COMPANY") {
      const dest = role === "STUDENT" ? "/student/dashboard" : "/admin/dashboard";
      const response = NextResponse.redirect(new URL(dest, req.url));
      response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      return response;
    }

    if (isStudentRoute && role !== "STUDENT") {
      const dest = role === "COMPANY" ? "/company/dashboard" : "/admin/dashboard";
      const response = NextResponse.redirect(new URL(dest, req.url));
      response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      return response;
    }

    if (isAdminRoute && role !== "ADMIN") {
      const dest = role === "STUDENT" ? "/student/dashboard" : "/company/dashboard";
      const response = NextResponse.redirect(new URL(dest, req.url));
      response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      return response;
    }
  }

  /* 4. Attach no-store anti-caching headers to prevent back-button caching of protected pages */
  const response = NextResponse.next();
  if (isCompanyRoute || isStudentRoute || isAdminRoute) {
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
  }

  return response;
}

export default proxy;

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
