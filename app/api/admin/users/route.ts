import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const authorization = await requireAdmin();
  if (authorization instanceof NextResponse) return authorization;

  try {
    const companies = await prisma.user.findMany({
      where: { role: "COMPANY" },
      select: {
        id: true,
        name: true,
        email: true,
        domain: true,
        website: true,
        isVerified: true,
        createdAt: true,
        _count: { select: { projects: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        isVerified: true,
        createdAt: true,
        _count: { select: { applications: true, submissions: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ companies, students });
  } catch (error) {
    console.error("Admin users error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
