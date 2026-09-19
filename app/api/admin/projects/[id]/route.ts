import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { PROJECT_STATUSES, isOneOf } from "@/lib/enums";
import { audit } from "@/lib/audit";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const authorization = await requireAdmin();
  if (authorization instanceof NextResponse) return authorization;

  try {
    const { id } = await params;
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    const { title, status } = body as { title?: unknown; status?: unknown };

    const data: { title?: string; status?: (typeof PROJECT_STATUSES)[number]; closedAt?: Date } = {};
    if (typeof title === "string" && title.trim().length > 0) data.title = title.trim();
    if (isOneOf(PROJECT_STATUSES, status)) {
      data.status = status;
      if (status === "CLOSED") data.closedAt = new Date();
    }
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const target = await prisma.project.findUnique({ where: { id }, select: { id: true, status: true } });
    if (!target) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const updated = await prisma.project.update({ where: { id }, data });
    await audit(authorization, "project.admin_updated", "project", id, { from: target.status, to: updated.status, fields: Object.keys(data) });

    return NextResponse.json({ success: true, project: updated });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const authorization = await requireAdmin();
  if (authorization instanceof NextResponse) return authorization;

  try {
    const { id } = await params;
    const target = await prisma.project.findUnique({
      where: { id },
      select: { id: true, title: true, _count: { select: { certificates: true } } },
    });
    if (!target) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    if (target._count.certificates > 0) {
      return NextResponse.json({ error: "Certificates were issued for this project; close it instead of deleting." }, { status: 409 });
    }

    await prisma.project.delete({ where: { id } });
    await audit(authorization, "project.deleted", "project", id, { title: target.title });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
