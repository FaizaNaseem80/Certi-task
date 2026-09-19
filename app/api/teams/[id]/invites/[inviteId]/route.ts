import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

type Params = { params: Promise<{ id: string; inviteId: string }> };

/** DELETE — lead cancels an email invitation that hasn't been claimed. */
export async function DELETE(_req: Request, { params }: Params) {
  const auth = await requireRole("TALENT");
  if (auth instanceof NextResponse) return auth;
  const { id, inviteId } = await params;
  const inv = await prisma.teamInvite.findUnique({ where: { id: inviteId }, include: { team: { select: { leadId: true, application: { select: { id: true } } } } } });
  if (!inv || inv.teamId !== id || inv.team.leadId !== auth.userId) return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
  if (inv.team.application) return NextResponse.json({ error: "This team has already applied" }, { status: 409 });
  await prisma.teamInvite.delete({ where: { id: inviteId } });
  return NextResponse.json({ success: true });
}
