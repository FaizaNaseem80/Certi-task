import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

/** GET /api/notifications — latest 30 for the signed-in user + unread count. */
export async function GET() {
  const auth = await requireRole("CLIENT", "TALENT");
  if (auth instanceof NextResponse) return auth;

  const [notifications, unread] = await Promise.all([
    prisma.notification.findMany({ where: { userId: auth.userId }, orderBy: { createdAt: "desc" }, take: 30 }),
    prisma.notification.count({ where: { userId: auth.userId, readAt: null } }),
  ]);
  return NextResponse.json({ notifications, unread });
}

/** PATCH /api/notifications — mark all as read. */
export async function PATCH() {
  const auth = await requireRole("CLIENT", "TALENT");
  if (auth instanceof NextResponse) return auth;

  await prisma.notification.updateMany({ where: { userId: auth.userId, readAt: null }, data: { readAt: new Date() } });
  return NextResponse.json({ success: true });
}
