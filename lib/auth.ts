import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) throw new Error("JWT_SECRET is not configured");
const JWT_SECRET = new TextEncoder().encode(jwtSecret);

export const COOKIE_NAME = "certitask_session";

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: "COMPANY" | "STUDENT" | "ADMIN";
}

/* ── Password hashing ── */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/* ── JWT Token management ── */
export async function createToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/* ── Session & Cookies ── */
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: "/",
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireAdmin(): Promise<SessionPayload | NextResponse> {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  if (session.role !== "ADMIN") {
    return NextResponse.json({ error: "Administrator access required" }, { status: 403 });
  }

  return session;
}
