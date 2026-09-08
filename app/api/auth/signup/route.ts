import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createToken, setAuthCookie } from "@/lib/auth";
import { isEmail, isString } from "@/lib/validation";
import { isRateLimited } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const clientKey = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (await isRateLimited(`signup:${clientKey}`, 5, 60 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many signup attempts. Try again later." }, { status: 429 });
    }

    const { email, password, fullName, role } = await req.json();

    if (!isEmail(email) || !isString(password, 128) || password.length < 8 || !isString(fullName, 120)) {
      return NextResponse.json(
        { error: "Enter a valid email, a password of 8-128 characters, and a name of 1-120 characters." },
        { status: 400 }
      );
    }

    if (role !== "student" && role !== "company") {
      return NextResponse.json({ error: "A valid account role is required." }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user exists in Neon DB
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email address already exists. Please sign in instead." },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const dbRole = role === "student" ? "STUDENT" : "COMPANY";

    // Create user in Neon PostgreSQL DB
    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        name: fullName.trim(),
        password: hashedPassword,
        role: dbRole,
      },
    });

    // Generate JWT token
    const token = await createToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as "COMPANY" | "STUDENT",
    });

    // Set HTTP-Only Cookie
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
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}
