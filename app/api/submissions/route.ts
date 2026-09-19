import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { isHttpUrl, isString } from "@/lib/validation";
import { submissionInclude } from "@/lib/queries";
import { audit } from "@/lib/audit";

/**
 * GET /api/submissions
 * - Client: submissions to their projects.
 * - Talent: submissions from teams they belong to.
 */
export async function GET() {
  const auth = await requireRole("CLIENT", "TALENT");
  if (auth instanceof NextResponse) return auth;

  try {
    const where =
      auth.role === "CLIENT"
        ? { project: { clientId: auth.userId } }
        : { team: { members: { some: { userId: auth.userId, status: "ACCEPTED" as const } } } };

    const submissions = await prisma.submission.findMany({
      where,
      include: submissionInclude,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ submissions });
  } catch (error) {
    console.error("Fetch submissions error:", error);
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 });
  }
}

/**
 * POST /api/submissions — team lead submits (or re-submits after changes were
 * requested) the deliverables for a project their team was SELECTED for.
 */
export async function POST(req: Request) {
  const auth = await requireRole("TALENT");
  if (auth instanceof NextResponse) return auth;

  try {
    const { projectId, submissionUrl, notes } = await req.json();

    if (!isString(projectId, 100) || !isHttpUrl(submissionUrl) ||
        (notes !== undefined && notes !== null && notes !== "" && !isString(notes, 10000))) {
      return NextResponse.json({ error: "A valid submission URL is required" }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, status: true, deadline: true },
    });
    if (!project || !["ACTIVE", "PAUSED"].includes(project.status)) {
      return NextResponse.json({ error: "This project is not accepting submissions" }, { status: 404 });
    }
    if (project.deadline < new Date()) {
      return NextResponse.json({ error: "The deadline for this project has passed" }, { status: 409 });
    }

    // The caller must lead a team whose application to this project was SELECTED.
    const application = await prisma.application.findFirst({
      where: { projectId, status: "SELECTED", team: { leadId: auth.userId } },
      select: { teamId: true },
    });
    if (!application) {
      return NextResponse.json({ error: "Only the lead of a selected team can submit for this project" }, { status: 403 });
    }

    const existing = await prisma.submission.findUnique({ where: { teamId: application.teamId }, select: { id: true, status: true } });
    if (existing && existing.status === "APPROVED") {
      return NextResponse.json({ error: "This submission has already been approved" }, { status: 409 });
    }

    const data = {
      submissionUrl,
      notes: notes ? String(notes).trim() : null,
      status: "SUBMITTED" as const,
      feedback: null,
      reviewedAt: null,
      submittedById: auth.userId,
    };

    const submission = existing
      ? await prisma.submission.update({ where: { id: existing.id }, data, include: submissionInclude })
      : await prisma.submission.create({ data: { ...data, projectId, teamId: application.teamId }, include: submissionInclude });

    await audit(auth, existing ? "submission.resubmitted" : "submission.created", "submission", submission.id, { projectId, teamId: application.teamId });

    return NextResponse.json({ success: true, submission });
  } catch (error) {
    console.error("Submit deliverables error:", error);
    return NextResponse.json({ error: "Failed to submit deliverables" }, { status: 500 });
  }
}
