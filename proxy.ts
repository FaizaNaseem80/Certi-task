import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_NAME } from "@/lib/auth-constants";
import { verifyToken } from "@/lib/auth-token";
import { isSameOrigin } from "@/lib/origin";

function matchesPath(pathname: string, basePath: string) {
  return pathname === basePath || pathname.startsWith(`${basePath}/`);
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/api/") &&
    ["POST", "PUT", "PATCH", "DELETE"].includes(req.method) &&
    !isSameOrigin(req)
  ) {
    return NextResponse.json({ error: "Cross-site request blocked" }, { status: 403 });
  }

  if (pathname === "/admin/signup") {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  const isLoginRoute = matchesPath(pathname, "/auth/login");

  const isCompanyRoute = matchesPath(pathname, "/company");
  const isStudentRoute = matchesPath(pathname, "/student");
  const isAdminRoute = matchesPath(pathname, "/admin") && !matchesPath(pathname, "/admin/login");

  // Redirect exactly /admin to /admin/dashboard to avoid 404s
  if (pathname === "/admin") {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

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
  if (sessionPayload && isLoginRoute) {
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
    "/api/:path*",
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
