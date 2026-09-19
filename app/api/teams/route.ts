import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { isString } from "@/lib/validation";
import { audit } from "@/lib/audit";
import { isOnAnotherTeam, teamInclude } from "@/lib/teams";

/** GET /api/teams — every team the signed-in talent leads, belongs to, or is invited to. */
export async function GET() {
  const auth = await requireRole("TALENT");
  if (auth instanceof NextResponse) return auth;

  const teams = await prisma.team.findMany({
    where: { members: { some: { userId: auth.userId, status: { in: ["ACCEPTED", "INVITED"] } } } },
    include: teamInclude,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ teams });
}

/**
 * POST /api/teams { projectId, name } — talent creates a team for a project
 * and becomes its lead. Invite members next; apply when the roster is ready.
 */
export async function POST(req: Request) {
  const auth = await requireRole("TALENT");
  if (auth instanceof NextResponse) return auth;

  try {
    const me = await prisma.user.findUnique({ where: { id: auth.userId }, select: { emailVerifiedAt: true } });
    if (!me?.emailVerifiedAt) return NextResponse.json({ error: "Confirm your email address before creating a team" }, { status: 403 });

    const { projectId, name } = await req.json();
    if (!isString(projectId, 100) || !isString(name, 100)) return NextResponse.json({ error: "Project and team name are required" }, { status: 400 });

    const project = await prisma.project.findFirst({ where: { id: projectId, status: "ACTIVE", deadline: { gte: new Date() } }, select: { id: true, teamCap: true, title: true } });
    if (!project) return NextResponse.json({ error: "This project is not accepting applications" }, { status: 404 });
    if (project.teamCap < 2) return NextResponse.json({ error: "This project is for individuals only. Apply solo instead." }, { status: 400 });
    if (await isOnAnotherTeam(auth.userId, projectId)) return NextResponse.json({ error: "You are already on a team for this project" }, { status: 409 });

    const team = await prisma.team.create({
      data: {
        name: name.trim(), projectId, leadId: auth.userId,
        members: { create: { userId: auth.userId, role: "LEAD", status: "ACCEPTED", respondedAt: new Date() } },
      },
      include: teamInclude,
    });
    await audit(auth, "team.created", "team", team.id, { projectId, name: team.name });
    return NextResponse.json({ success: true, team });
  } catch (error) {
    console.error("Create team error:", error);
    return NextResponse.json({ error: "Failed to create team" }, { status: 500 });
  }
}
