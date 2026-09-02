import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const student = await prisma.user.findFirst({
      where: {
        role: "STUDENT",
        OR: [
          { id },
          { email: id },
          { email: { startsWith: `${id}@` } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        dateOfBirth: true,
        gender: true,
        universityName: true,
        degreeProgram: true,
        currentSemester: true,
        gpa: true,
        skillsArray: true,
        portfolioUrl: true,
        resumeUrl: true,
        cnicNumber: true,
        cnicVerified: true,
        location: true,
        createdAt: true,
        _count: {
          select: {
            applications: true,
            submissions: true,
            issuedCertificates: true,
          },
        },
        applications: {
          select: {
            id: true,
            status: true,
            project: {
              select: {
                id: true,
                title: true,
              },
            },
          },
          take: 5,
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ student });
  } catch (error) {
    console.error("Student detail error:", error);
    return NextResponse.json(
      { error: "Failed to fetch student details" },
      { status: 500 }
    );
  }
}
