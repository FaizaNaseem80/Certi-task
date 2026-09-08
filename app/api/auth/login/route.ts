import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createToken, setAuthCookie } from "@/lib/auth";
import { isRateLimited } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const clientKey = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (await isRateLimited(`login:${clientKey}`, 10, 15 * 60 * 1000)) {
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

    // Try fetching user from database
    let user = null;
    try {
      user = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });
    } catch (dbErr) {
      console.error("Database connection error during login lookup:", dbErr);
    }

    if (!user) {
      // Check for super admin credentials from env
      const adminEmail = process.env.SUPER_ADMIN_EMAIL?.toLowerCase().trim();
      const adminPassHash = process.env.SUPER_ADMIN_PASSWORD_HASH;
      const adminPasswordMatches = Boolean(
        adminPassHash && await verifyPassword(password, adminPassHash)
      );

      if (adminEmail && cleanEmail === adminEmail && adminPasswordMatches) {
        const token = await createToken({
          userId: "super-admin",
          email: cleanEmail,
          name: "Super Admin",
          role: "ADMIN",
        });
        await setAuthCookie(token);
        return NextResponse.json({
          success: true,
          user: {
            id: "super-admin-id",
            name: "Super Admin",
            email: cleanEmail,
            role: "admin",
          },
        });
      }

      return NextResponse.json(
        { error: "Invalid email or password. Please check your credentials." },
        { status: 401 }
      );
    }

    // Verify bcrypt password
    let isMatch = false;
    try {
      isMatch = await verifyPassword(password, user.password);
    } catch (passErr) {
      console.error("Password verification error:", passErr);
    }

    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid email or password. Please check your credentials." },
        { status: 401 }
      );
    }

    if (!user.isVerified) {
      return NextResponse.json(
        { error: "This account has not been verified." },
        { status: 403 }
      );
    }

    // Create session token
    const token = await createToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as "COMPANY" | "STUDENT",
    });

    // Set cookie
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.toLowerCase(),
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
