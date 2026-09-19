import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const authorization = await requireAdmin();
  if (authorization instanceof NextResponse) return authorization;

  try {
    const [clients, talents] = await Promise.all([
      prisma.user.findMany({
        where: { role: "CLIENT" },
        select: {
          id: true, name: true, email: true, clientType: true, verificationStatus: true, emailVerifiedAt: true,
          suspendedAt: true, website: true, createdAt: true,
          _count: { select: { projectsPosted: true, certificatesIssued: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.findMany({
        where: { role: "TALENT" },
        select: {
          id: true, name: true, email: true, verificationStatus: true, emailVerifiedAt: true, suspendedAt: true,
          universityName: true, createdAt: true,
          _count: { select: { teamMemberships: true, certificatesEarned: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);
    return NextResponse.json({ clients, talents });
  } catch (error) {
    console.error("Admin users error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
