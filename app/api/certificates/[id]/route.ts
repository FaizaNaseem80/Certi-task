import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "COMPANY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { status } = await req.json(); // e.g. "Revoked" or "Disputed"

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    // Verify certificate was issued by this company
    const certificate = await prisma.certificate.findFirst({
      where: {
        id,
        companyId: session.userId,
      },
    });

    if (!certificate) {
      return NextResponse.json({ error: "Certificate not found or unauthorized" }, { status: 404 });
    }

    const updated = await prisma.certificate.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, certificate: updated });
  } catch (error) {
    console.error("Update certificate status error:", error);
    return NextResponse.json({ error: "Failed to update certificate status" }, { status: 500 });
  }
}
