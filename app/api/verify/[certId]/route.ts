import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ certId: string }> }
) {
  try {
    const { certId } = await params;
    
    const certificate = await prisma.certificate.findUnique({
      where: { certId },
      include: {
        company: true,
        project: true
      }
    });

    if (!certificate) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }

    return NextResponse.json({ certificate });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
