import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

/** PATCH /api/notifications/[id] — mark one as read. */
export async function PATCH(_req: Request, { params }: Params) {
  const auth = await requireRole("CLIENT", "TALENT");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const r = await prisma.notification.updateMany({ where: { id, userId: auth.userId, readAt: null }, data: { readAt: new Date() } });
  return NextResponse.json({ success: true, updated: r.count });
}
