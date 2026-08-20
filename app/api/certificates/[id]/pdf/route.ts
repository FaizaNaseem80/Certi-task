import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { generateCertificatePdf } from "@/lib/pdf";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Find certificate
  const certificate = await prisma.certificate.findUnique({
    where: { id },
    include: { company: true }
  });

  if (!certificate) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Authorize: Only student who earned it, or company who issued it can download
  if (session.role === "STUDENT" && certificate.studentEmail !== session.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.role === "COMPANY" && certificate.companyId !== session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const pdfBuffer = await generateCertificatePdf({
      certId: certificate.certId,
      title: certificate.title,
      studentName: certificate.studentName,
      studentEmail: certificate.studentEmail,
      issueDate: certificate.issueDate,
      expiryDate: certificate.expiryDate,
      companyName: certificate.company.name,
    });

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${certificate.certId}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
