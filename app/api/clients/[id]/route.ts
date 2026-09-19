import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

/** GET /api/clients/[id] — public client profile with their active projects. */
export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const client = await prisma.user.findFirst({
      where: { id, role: "CLIENT", suspendedAt: null },
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
        _count: { select: { projectsPosted: true, certificatesIssued: true } },
        projectsPosted: {
          where: { status: { in: ["ACTIVE", "COMPLETED", "CLOSED"] } },
          select: {
            id: true, title: true, description: true, category: true, requiredSkills: true,
            status: true, deadline: true, teamCap: true,
            _count: { select: { applications: true, submissions: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });
    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });
    return NextResponse.json({ client });
  } catch (error) {
    console.error("Client detail error:", error);
    return NextResponse.json({ error: "Failed to fetch client" }, { status: 500 });
  }
}
