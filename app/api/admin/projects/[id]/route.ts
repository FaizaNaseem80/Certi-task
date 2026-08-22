import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authorization = await requireAdmin();
  if (authorization instanceof NextResponse) return authorization;

  try {
    const { id } = await params;
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    
    const { title, status } = body as { title?: unknown; status?: unknown };
    
    const updateData: { title?: string; status?: string } = {};
    if (typeof title === "string" && title.trim().length > 0) updateData.title = title.trim();
    if (typeof status === "string" && ["Active", "Paused", "Closed"].includes(status)) updateData.status = status;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const targetProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!targetProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, project: updatedProject });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authorization = await requireAdmin();
  if (authorization instanceof NextResponse) return authorization;

  try {
    const { id } = await params;

    const targetProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!targetProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
