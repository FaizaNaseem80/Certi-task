import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { certificateInclude } from "@/lib/queries";

/** GET /api/certificates — client: issued by them; talent: earned by them. */
export async function GET() {
  const auth = await requireRole("CLIENT", "TALENT");
  if (auth instanceof NextResponse) return auth;

  try {
    const certificates = await prisma.certificate.findMany({
      where: auth.role === "CLIENT" ? { clientId: auth.userId } : { talentId: auth.userId },
      include: certificateInclude,
      orderBy: { issuedAt: "desc" },
    });
    return NextResponse.json({ certificates });
  } catch (error) {
    console.error("Fetch certificates error:", error);
    return NextResponse.json({ error: "Failed to fetch certificates" }, { status: 500 });
  }
}
