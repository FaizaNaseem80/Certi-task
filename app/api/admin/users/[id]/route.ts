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
    
    // Only allow updating specific fields
    const { isVerified, name } = body as { isVerified?: unknown; name?: unknown };
    
    const updateData: { name?: string; isVerified?: boolean } = {};
    if (typeof isVerified === "boolean") updateData.isVerified = isVerified;
    if (typeof name === "string" && name.trim().length > 0) updateData.name = name.trim();

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    // Verify the user exists and isn't another admin
    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (id === authorization.userId || (targetUser.role !== "COMPANY" && targetUser.role !== "STUDENT")) {
      return NextResponse.json({ error: "This user cannot be modified" }, { status: 403 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, name: true, isVerified: true, role: true }
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
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

    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (id === authorization.userId || (targetUser.role !== "COMPANY" && targetUser.role !== "STUDENT")) {
      return NextResponse.json({ error: "This user cannot be deleted" }, { status: 403 });
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
