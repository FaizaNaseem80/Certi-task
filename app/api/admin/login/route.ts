import { NextResponse } from "next/server";
import { createToken, setAuthCookie, verifyPassword } from "@/lib/auth";
import { isRateLimited } from "@/lib/rate-limit";

const ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL?.toLowerCase();
const ADMIN_PASSWORD_HASH = process.env.SUPER_ADMIN_PASSWORD_HASH;

export async function POST(req: Request) {
  try {
    const clientKey = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (await isRateLimited(`admin-login:${clientKey}`, 5, 15 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many login attempts. Try again later." }, { status: 429 });
    }

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    const passwordMatches = Boolean(
      ADMIN_PASSWORD_HASH && await verifyPassword(password, ADMIN_PASSWORD_HASH)
    );

    if (ADMIN_EMAIL && cleanEmail === ADMIN_EMAIL && passwordMatches) {
      const token = await createToken({
        userId: "super-admin",
        email: ADMIN_EMAIL,
        name: "Super Admin",
        role: "ADMIN",
      });

      await setAuthCookie(token);

      return NextResponse.json({
        success: true,
        user: {
          id: "super-admin",
          name: "Super Admin",
          email: ADMIN_EMAIL,
          role: "admin",
        },
      });
    }

    return NextResponse.json(
      { error: "Invalid admin credentials." },
      { status: 401 }
    );
  } catch (error) {
    console.error("Admin Login error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
