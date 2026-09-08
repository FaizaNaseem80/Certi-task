import { jwtVerify, SignJWT } from "jose";

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) throw new Error("JWT_SECRET is not configured");
const JWT_SECRET = new TextEncoder().encode(jwtSecret);

export const SESSION_TTL_SECONDS = 30 * 60;

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: "COMPANY" | "STUDENT" | "ADMIN";
}

export async function signToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, { algorithms: ["HS256"] });
    if (
      typeof payload.userId !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.name !== "string" ||
      !["COMPANY", "STUDENT", "ADMIN"].includes(String(payload.role))
    ) {
      return null;
    }

    return {
      userId: payload.userId,
      email: payload.email,
      name: payload.name,
      role: payload.role as SessionPayload["role"],
    };
  } catch {
    return null;
  }
}