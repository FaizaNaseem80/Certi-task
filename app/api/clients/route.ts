import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** GET /api/clients — public directory of clients that have at least one project. */
export async function GET() {
  try {
    const clients = await prisma.user.findMany({
      where: { role: "CLIENT", suspendedAt: null, projectsPosted: { some: {} } },
      select: {
        id: true,
        name: true,
        clientType: true,
        verificationStatus: true,
        bio: true,
        website: true,
        avatarUrl: true,
        location: true,
        industry: true,
        organizationSize: true,
        foundedYear: true,
        linkedinUrl: true,
        createdAt: true,
        _count: { select: { projectsPosted: { where: { status: "ACTIVE" } }, certificatesIssued: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ clients });
  } catch (error) {
    console.error("Fetch clients error:", error);
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
  }
}
