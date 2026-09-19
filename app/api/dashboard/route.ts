import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { applicationInclude, certificateInclude, profileSelect, projectListInclude, submissionInclude } from "@/lib/queries";

/** GET /api/dashboard — everything a client or talent dashboard needs in one call. */
export async function GET() {
  const auth = await requireRole("CLIENT", "TALENT");
  if (auth instanceof NextResponse) return auth;

  try {
    const profile = await prisma.user.findUnique({ where: { id: auth.userId }, select: profileSelect });
    if (!profile) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const isClient = auth.role === "CLIENT";
    const memberOf = { team: { members: { some: { userId: auth.userId, status: "ACCEPTED" as const } } } };

    const [projects, applications, submissions, certificates, certificateHolds] = await Promise.all([
      prisma.project.findMany({
        where: isClient ? { clientId: auth.userId } : { status: "ACTIVE", deadline: { gte: new Date() } },
        include: projectListInclude,
        orderBy: isClient ? { createdAt: "desc" } : { publishedAt: "desc" },
      }),
      prisma.application.findMany({
        where: isClient ? { project: { clientId: auth.userId } } : memberOf,
        include: applicationInclude,
        orderBy: { createdAt: "desc" },
      }),
      prisma.submission.findMany({
        where: isClient ? { project: { clientId: auth.userId } } : memberOf,
        include: submissionInclude,
        orderBy: { createdAt: "desc" },
      }),
      prisma.certificate.findMany({
        where: isClient ? { clientId: auth.userId } : { talentId: auth.userId },
        include: certificateInclude,
        orderBy: { issuedAt: "desc" },
      }),
      isClient
        ? Promise.resolve([])
        : prisma.certificateHold.findMany({
            where: { talentId: auth.userId },
            select: { id: true, createdAt: true, project: { select: { id: true, title: true, client: { select: { name: true } } } } },
            orderBy: { createdAt: "desc" },
          }),
    ]);

    return NextResponse.json({
      user: { id: profile.id, email: profile.email, name: profile.name, role: profile.role.toLowerCase() },
      profile,
      projects,
      applications,
      submissions,
      certificates,
      certificateHolds,
    });
  } catch (error) {
    console.error("Dashboard load error:", error);
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
  }
}
