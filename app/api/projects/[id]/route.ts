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

    const updated = await prisma.project.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(deadline && { deadline }),
        ...(title && { title }),
        ...(description && { description }),
        ...(requiredSkills && { requiredSkills }),
        ...(deliverables && { deliverables }),
        ...(teamCap && { teamCap: parseInt(teamCap) }),
      },
    });

    return NextResponse.json({ success: true, project: updated });
  } catch (error) {
    console.error("Update project error:", error);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}
