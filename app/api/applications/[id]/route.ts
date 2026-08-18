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
    const { status } = await req.json();

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    // Verify application belongs to one of company's projects
    const application = await prisma.application.findFirst({
      where: {
        id,
        project: {
          companyId: session.userId,
        },
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found or unauthorized" }, { status: 404 });
    }

    const updated = await prisma.application.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, application: updated });
  } catch (error) {
    console.error("Update application status error:", error);
    return NextResponse.json({ error: "Failed to update application status" }, { status: 500 });
  }
}
