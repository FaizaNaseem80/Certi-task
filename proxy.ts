import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "certitask_secret_key_neon_db_2026_super_secure"
);

const COOKIE_NAME = "certitask_session";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublicRoute =
    pathname.startsWith("/auth/login") ||
    pathname.startsWith("/auth/signup") ||
    pathname.startsWith("/auth/forgot-password") ||
    pathname.startsWith("/auth/reset-password");

  const isCompanyRoute = pathname.startsWith("/company");
  const isStudentRoute = pathname.startsWith("/student");

  const token = req.cookies.get(COOKIE_NAME)?.value;
  let sessionPayload: { userId: string; role: string; name: string } | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      sessionPayload = payload as unknown as {
        userId: string;
        role: string;
        name: string;
      };
    } catch {
      sessionPayload = null;
    }
  }

  /* 1. Not logged in & accessing protected dashboard route -> redirect to login */
  if (!sessionPayload && (isCompanyRoute || isStudentRoute)) {
    const loginUrl = new URL("/auth/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  /* 2. Logged in & visiting auth page -> redirect to appropriate dashboard */
  if (sessionPayload && isPublicRoute) {
    const dest =
      sessionPayload.role === "STUDENT"
        ? "/student/dashboard"
        : "/company/dashboard";
    return NextResponse.redirect(new URL(dest, req.url));
  }

  /* 3. Role protection guard */
  if (sessionPayload) {
    if (isCompanyRoute && sessionPayload.role !== "COMPANY") {
      return NextResponse.redirect(new URL("/student/dashboard", req.url));
    }
    if (isStudentRoute && sessionPayload.role !== "STUDENT") {
      return NextResponse.redirect(new URL("/company/dashboard", req.url));
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
