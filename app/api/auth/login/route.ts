import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createToken, setAuthCookie } from "@/lib/auth";

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
      const adminPass = process.env.SUPER_ADMIN_PASSWORD;

      if (adminEmail && adminPass && cleanEmail === adminEmail && password === adminPass) {
        const token = await createToken({
          userId: "super-admin-id",
          email: cleanEmail,
          name: "Super Admin",
          role: "ADMIN" as any,
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
