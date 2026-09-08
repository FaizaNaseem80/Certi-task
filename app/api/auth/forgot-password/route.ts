import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isSmtpConfigured, sendPasswordResetEmail } from "@/lib/email";
import { isRateLimited } from "@/lib/rate-limit";
import { isEmail } from "@/lib/validation";

const GENERIC_RESPONSE = { success: true };

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function POST(req: Request) {
  const clientKey = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (
    await isRateLimited(`password-reset:${clientKey}`, 5, 60 * 60 * 1000)
  ) {
    return NextResponse.json({ error: "Too many reset requests. Try again later." }, { status: 429 });
  }

  try {
    const body: unknown = await req.json();
    const email = body && typeof body === "object" && "email" in body ? body.email : undefined;
    if (!isEmail(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    if (!isSmtpConfigured() || !process.env.APP_URL) {
      return NextResponse.json({ error: "Password reset is temporarily unavailable." }, { status: 503 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true, email: true },
    });

    if (user) {
      const rawToken = randomBytes(32).toString("hex");
      const token = await prisma.passwordResetToken.create({
        data: {
          tokenHash: hashToken(rawToken),
          userId: user.id,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        },
      });

      await prisma.passwordResetToken.deleteMany({
        where: { userId: user.id, id: { not: token.id } },
      });

      try {
        const appUrl = new URL(process.env.APP_URL);
        if (process.env.NODE_ENV === "production" && appUrl.protocol !== "https:") {
          throw new Error("APP_URL must use HTTPS in production");
        }
        await sendPasswordResetEmail(
          user.email,
          `${appUrl.origin}/auth/reset-password?token=${rawToken}`
        );
      } catch {
        await prisma.passwordResetToken.delete({ where: { id: token.id } });
        return NextResponse.json({ error: "Password reset is temporarily unavailable." }, { status: 503 });
      }
    }

    return NextResponse.json(GENERIC_RESPONSE);
  } catch {
    return NextResponse.json({ error: "Password reset is temporarily unavailable." }, { status: 503 });
  }
}