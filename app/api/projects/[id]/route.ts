import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "COMPANY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { status, deadline, title, description, requiredSkills, deliverables, teamCap } = body;

    // Check project ownership
    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project || project.companyId !== session.userId) {
      return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });
    }

    if (status !== undefined && !["Active", "Paused", "Closed"].includes(status)) {
      return NextResponse.json({ error: "Invalid project status" }, { status: 400 });
    }

    const parsedTeamCap = teamCap === undefined ? undefined : Number(teamCap);
    if (parsedTeamCap !== undefined && (!Number.isInteger(parsedTeamCap) || parsedTeamCap < 1 || parsedTeamCap > 1000)) {
      return NextResponse.json({ error: "Team capacity must be an integer from 1 to 1000" }, { status: 400 });
    }

    const updated = await prisma.project.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(deadline && { deadline }),
        ...(title && { title }),
        ...(description && { description }),
        ...(requiredSkills && { requiredSkills }),
        ...(deliverables && { deliverables }),
        ...(parsedTeamCap !== undefined && { teamCap: parsedTeamCap }),
      },
    });

    return NextResponse.json({ success: true, project: updated });
  } catch (error) {
    console.error("Update project error:", error);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}
