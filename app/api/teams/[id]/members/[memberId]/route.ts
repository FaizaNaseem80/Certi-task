import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { TeamError, removeOrLeave, respondToInvite } from "@/lib/teams";

type Params = { params: Promise<{ id: string; memberId: string }> };

/**
 * PATCH /api/teams/[id]/members/[memberId] { action }
 *  - ACCEPT | DECLINE: the invited member responds
 *  - REMOVE: the lead removes a member; LEAVE: a member leaves (before applying)
 */
export async function PATCH(req: Request, { params }: Params) {
  const auth = await requireRole("TALENT");
  if (auth instanceof NextResponse) return auth;
  try {
    const { memberId } = await params;
    const { action } = await req.json();
    let member;
    if (action === "ACCEPT" || action === "DECLINE") member = await respondToInvite(auth, memberId, action === "ACCEPT");
    else if (action === "REMOVE" || action === "LEAVE") member = await removeOrLeave(auth, memberId);
    else return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    return NextResponse.json({ success: true, member });
  } catch (e) {
    if (e instanceof TeamError) return NextResponse.json({ error: e.message }, { status: e.status });
    console.error("Team member action error:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
