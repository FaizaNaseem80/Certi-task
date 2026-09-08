import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isRateLimited } from "@/lib/rate-limit";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ certId: string }> }
) {
  try {
    const clientKey = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (await isRateLimited(`verify:${clientKey}`, 30, 60 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many verification requests. Try again later." }, { status: 429 });
    }

    const { certId } = await params;
    
    const certificate = await prisma.certificate.findUnique({
      where: { certId },
      select: {
        id: true,
        certId: true,
        title: true,
        studentName: true,
        issueDate: true,
        expiryDate: true,
        status: true,
        company: { select: { id: true, name: true, logoUrl: true, website: true } },
        project: { select: { id: true, title: true, description: true } },
      },
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
