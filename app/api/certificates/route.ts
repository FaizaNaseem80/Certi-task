import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (session.role === "COMPANY") {
      // Return all certificates issued under this company's name (FR-C9)
      const certificates = await prisma.certificate.findMany({
        where: { companyId: session.userId },
        include: {
          project: {
            select: { title: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ certificates });
    } else {
      // Return student's certificates (matched by email)
      const certificates = await prisma.certificate.findMany({
        where: { studentEmail: session.email },
        include: {
          company: {
            select: { name: true, logoUrl: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ certificates });
    }
  } catch (error) {
    console.error("Fetch certificates error:", error);
    return NextResponse.json({ error: "Failed to fetch certificates" }, { status: 500 });
  }
}
