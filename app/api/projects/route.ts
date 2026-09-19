import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, requireRole } from "@/lib/auth";
import { isString } from "@/lib/validation";
import { PROJECT_CATEGORIES, TEAM_CAP_MAX, TEAM_CAP_MIN, TEAM_CAP_DEFAULT, isOneOf } from "@/lib/enums";
import { projectListInclude } from "@/lib/queries";
import { audit } from "@/lib/audit";
import { parseDeadline, parseSkills } from "@/lib/projects";

/**
 * GET /api/projects
 * - Client: their own projects (all statuses).
 * - Anyone else (talent or public): ACTIVE projects with an open deadline.
 */
export async function GET() {
  const session = await getSession();

  try {
    if (session?.role === "CLIENT") {
      const projects = await prisma.project.findMany({
        where: { clientId: session.userId },
        include: projectListInclude,
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ projects });
    }

    const projects = await prisma.project.findMany({
      where: { status: "ACTIVE", deadline: { gte: new Date() } },
      include: projectListInclude,
      orderBy: { publishedAt: "desc" },
    });
    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Fetch projects error:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

/**
 * POST /api/projects — client creates a project.
 * Phase 1: the project goes ACTIVE immediately. Phase 3 adds the draft/publish
 * step and Phase 4 inserts the listing-fee payment before activation.
 */
export async function POST(req: Request) {
  const auth = await requireRole("CLIENT");
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { title, description, category, requiredSkills, deliverables, deadline, teamCap } = body;

    if (!isString(title, 200) || !isString(description, 10000) || !isString(deliverables, 10000)) {
      return NextResponse.json({ error: "Title, description and deliverables are required" }, { status: 400 });
    }
    if (!isOneOf(PROJECT_CATEGORIES, category)) {
      return NextResponse.json({ error: "Choose a project category" }, { status: 400 });
    }
    const skills = parseSkills(requiredSkills);
    if (skills.length === 0) {
      return NextResponse.json({ error: "Add at least one required skill" }, { status: 400 });
    }
    const deadlineDate = parseDeadline(deadline);
    if (!deadlineDate || deadlineDate <= new Date()) {
      return NextResponse.json({ error: "Deadline must be a date in the future" }, { status: 400 });
    }
    const cap = teamCap === undefined || teamCap === "" ? TEAM_CAP_DEFAULT : Number(teamCap);
    if (!Number.isInteger(cap) || cap < TEAM_CAP_MIN || cap > TEAM_CAP_MAX) {
      return NextResponse.json({ error: `Team size must be between ${TEAM_CAP_MIN} and ${TEAM_CAP_MAX}` }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        clientId: auth.userId,
        title: title.trim(),
        description: description.trim(),
        category,
        requiredSkills: skills,
        deliverables: deliverables.trim(),
        deadline: deadlineDate,
        teamCap: cap,
        status: "ACTIVE",
        publishedAt: new Date(),
      },
      include: projectListInclude,
    });

    await audit(auth, "project.created", "project", project.id, { title: project.title, status: project.status });

    return NextResponse.json({ success: true, project });
  } catch (error) {
    console.error("Create project error:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
