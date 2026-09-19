import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { isString } from "@/lib/validation";
import { applicationInclude } from "@/lib/queries";
import { audit } from "@/lib/audit";

/**
 * GET /api/applications
 * - Client: applications to their projects.
 * - Talent: applications from any team they belong to.
 */
export async function GET() {
  const auth = await requireRole("CLIENT", "TALENT");
  if (auth instanceof NextResponse) return auth;

  try {
    const where =
      auth.role === "CLIENT"
        ? { project: { clientId: auth.userId } }
        : { team: { members: { some: { userId: auth.userId, status: "ACCEPTED" as const } } } };

    const applications = await prisma.application.findMany({
      where,
      include: applicationInclude,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ applications });
  } catch (error) {
    console.error("Fetch applications error:", error);
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
  }
}

/**
 * POST /api/applications — talent applies to a project.
 * Phase 1: creates a solo team (the applicant as LEAD) and the application in
 * one transaction. Phase 3 adds inviting other members before applying.
 */
export async function POST(req: Request) {
  const auth = await requireRole("TALENT");
  if (auth instanceof NextResponse) return auth;

  try {
    const me = await prisma.user.findUnique({ where: { id: auth.userId }, select: { emailVerifiedAt: true } });
    if (!me?.emailVerifiedAt) {
      return NextResponse.json({ error: "Confirm your email address before applying" }, { status: 403 });
    }

    const { projectId, teamName, pitch } = await req.json();

    if (!isString(projectId, 100) || !isString(teamName, 100) || !isString(pitch, 10000)) {
      return NextResponse.json({ error: "Project, team name and pitch are required" }, { status: 400 });
    }

    const project = await prisma.project.findFirst({
      where: { id: projectId, status: "ACTIVE", deadline: { gte: new Date() } },
      select: { id: true, title: true, clientId: true },
    });
    if (!project) {
      return NextResponse.json({ error: "This project is not accepting applications" }, { status: 404 });
    }

    const existing = await prisma.application.findFirst({
      where: {
        projectId,
        status: { not: "WITHDRAWN" },
        team: { members: { some: { userId: auth.userId, status: { in: ["ACCEPTED", "INVITED"] } } } },
      },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json({ error: "You have already applied to this project" }, { status: 409 });
    }

    const application = await prisma.$transaction(async (tx) => {
      const team = await tx.team.create({
        data: {
          name: teamName.trim(),
          projectId,
          leadId: auth.userId,
          members: {
            create: { userId: auth.userId, role: "LEAD", status: "ACCEPTED", respondedAt: new Date() },
          },
        },
      });
      const app = await tx.application.create({
        data: { projectId, teamId: team.id, pitch: pitch.trim() },
        include: applicationInclude,
      });
      await audit(auth, "application.submitted", "application", app.id, { projectId, teamId: team.id }, tx);
      return app;
    }, { maxWait: 10_000, timeout: 30_000 });

    return NextResponse.json({ success: true, application });
  } catch (error) {
    console.error("Submit application error:", error);
    return NextResponse.json({ error: "Failed to submit application" }, { status: 500 });
  }
}
