import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { isString } from "@/lib/validation";
import { audit } from "@/lib/audit";
import { isFrozen, teamInclude } from "@/lib/teams";

type Params = { params: Promise<{ id: string }> };

/** GET /api/teams/[id] — team detail for a member (or the project's client). */
export async function GET(_req: Request, { params }: Params) {
  const auth = await requireRole("TALENT", "CLIENT", "ADMIN");
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const team = await prisma.team.findUnique({ where: { id }, include: teamInclude });
  if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });
  const allowed = auth.role === "ADMIN" || team.project.client.id === auth.userId || team.members.some((m) => m.user.id === auth.userId);
  if (!allowed) return NextResponse.json({ error: "Team not found" }, { status: 404 });
  return NextResponse.json({ team });
}

/** PATCH /api/teams/[id] { name } — lead renames the team (before applying). */
export async function PATCH(req: Request, { params }: Params) {
  const auth = await requireRole("TALENT");
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const { name } = await req.json();
  if (!isString(name, 100)) return NextResponse.json({ error: "Team name is required" }, { status: 400 });
  const team = await prisma.team.findUnique({ where: { id }, include: teamInclude });
  if (!team || team.leadId !== auth.userId) return NextResponse.json({ error: "Team not found" }, { status: 404 });
  if (isFrozen(team)) return NextResponse.json({ error: "This team has already applied; the roster and name are frozen." }, { status: 409 });
  const updated = await prisma.team.update({ where: { id }, data: { name: name.trim() }, include: teamInclude });
  return NextResponse.json({ success: true, team: updated });
}

/** DELETE /api/teams/[id] — lead disbands a team that has not applied. */
export async function DELETE(_req: Request, { params }: Params) {
  const auth = await requireRole("TALENT");
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const team = await prisma.team.findUnique({ where: { id }, include: teamInclude });
  if (!team || team.leadId !== auth.userId) return NextResponse.json({ error: "Team not found" }, { status: 404 });
  if (isFrozen(team)) return NextResponse.json({ error: "Withdraw the application before disbanding the team." }, { status: 409 });
  await prisma.team.delete({ where: { id } });
  await audit(auth, "team.disbanded", "team", id, { name: team.name });
  return NextResponse.json({ success: true });
}
