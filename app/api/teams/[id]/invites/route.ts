import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { isEmail } from "@/lib/validation";
import { TeamError, inviteToTeam } from "@/lib/teams";

type Params = { params: Promise<{ id: string }> };

/** POST /api/teams/[id]/invites { email } — lead invites someone by email. */
export async function POST(req: Request, { params }: Params) {
  const auth = await requireRole("TALENT");
  if (auth instanceof NextResponse) return auth;
  try {
    const { id } = await params;
    const { email } = await req.json();
    if (!isEmail(email)) return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
    const result = await inviteToTeam(auth, id, email);
    return NextResponse.json({ success: true, ...result });
  } catch (e) {
    if (e instanceof TeamError) return NextResponse.json({ error: e.message }, { status: e.status });
    console.error("Invite error:", e);
    return NextResponse.json({ error: "Failed to send invitation" }, { status: 500 });
  }
}
