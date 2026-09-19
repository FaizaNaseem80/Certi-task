import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { audit } from "@/lib/audit";

type Params = { params: Promise<{ id: string }> };

/** PATCH /api/admin/users/[id] — rename or suspend/unsuspend an account. */
export async function PATCH(request: Request, { params }: Params) {
  const authorization = await requireAdmin();
  if (authorization instanceof NextResponse) return authorization;

  try {
    const { id } = await params;
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    const { suspended, name } = body as { suspended?: unknown; name?: unknown };

    const data: { name?: string; suspendedAt?: Date | null } = {};
    if (typeof suspended === "boolean") data.suspendedAt = suspended ? new Date() : null;
    if (typeof name === "string" && name.trim().length > 0) data.name = name.trim();
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const target = await prisma.user.findUnique({ where: { id }, select: { id: true } });
    if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (data.suspendedAt) {
      await prisma.session.updateMany({ where: { userId: id, revokedAt: null }, data: { revokedAt: new Date() } });
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, role: true, suspendedAt: true, verificationStatus: true },
    });
    const action = typeof suspended === "boolean" ? (suspended ? "user.suspended" : "user.unsuspended") : "user.renamed";
    await audit(authorization, action, "user", id, { fields: Object.keys(data) });

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

/** DELETE /api/admin/users/[id] — permanently delete an account that holds no certificates. */
export async function DELETE(_request: Request, { params }: Params) {
  const authorization = await requireAdmin();
  if (authorization instanceof NextResponse) return authorization;

  try {
    const { id } = await params;
    const target = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true, _count: { select: { certificatesEarned: true, certificatesIssued: true } } },
    });
    if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (target._count.certificatesEarned > 0 || target._count.certificatesIssued > 0) {
      return NextResponse.json(
        { error: "This account is referenced by issued certificates and cannot be deleted. Suspend it instead." },
        { status: 409 }
      );
    }

    await prisma.session.deleteMany({ where: { userId: id } });
    await prisma.user.delete({ where: { id } });
    await audit(authorization, "user.deleted", "user", id, { email: target.email, role: target.role });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
