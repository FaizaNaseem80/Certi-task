import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const company = await prisma.user.findUnique({
      where: { id, role: "COMPANY" },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        domain: true,
        website: true,
        logoUrl: true,
        phone: true,
        location: true,
        companySize: true,
        industry: true,
        foundedYear: true,
        companyDescription: true,
        companyWebsite: true,
        linkedinUrl: true,
        createdAt: true,
        _count: {
          select: { projects: true },
        },
        projects: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            deadline: true,
            _count: {
              select: { applications: true, submissions: true },
            },
          },
          take: 5,
        },
      },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ company });
  } catch (error) {
    console.error("Company detail error:", error);
    return NextResponse.json(
      { error: "Failed to fetch company details" },
      { status: 500 }
    );
  }
}
