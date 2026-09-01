import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const companies = await prisma.user.findMany({
      where: { role: "COMPANY" },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        domain: true,
        website: true,
        logoUrl: true,
        location: true,
        companySize: true,
        industry: true,
        foundedYear: true,
        companyDescription: true,
        companyWebsite: true,
        linkedinUrl: true,
        createdAt: true,
        _count: {
          select: { projects: { where: { status: "Active" } } }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ companies });
  } catch (error) {
    console.error("Fetch companies error:", error);
    return NextResponse.json({ error: "Failed to fetch companies" }, { status: 500 });
  }
}
