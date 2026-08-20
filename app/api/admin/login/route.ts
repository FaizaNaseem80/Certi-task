import { NextResponse } from "next/server";
import { createToken, setAuthCookie } from "@/lib/auth";

const ADMIN_EMAIL = (process.env.SUPER_ADMIN_EMAIL || "admin@certitask.com").toLowerCase();
const ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || "CertiAdmin@2026";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    if (cleanEmail === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
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
