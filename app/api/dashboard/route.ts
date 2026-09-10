import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const profile = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        website: true,
        logoUrl: true,
        domain: true,
        phone: true,
        location: true,
        role: true,
        companySize: true,
        industry: true,
        foundedYear: true,
        companyDescription: true,
        companyWebsite: true,
        linkedinUrl: true,
        cnicNumber: true,
        cnicVerified: true,
        dateOfBirth: true,
        gender: true,
        universityName: true,
        degreeProgram: true,
        currentSemester: true,
        gpa: true,
        skillsArray: true,
        portfolioUrl: true,
        resumeUrl: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (session.role === "COMPANY") {
      const [projects, applications, submissions, certificates] = await Promise.all([
        prisma.project.findMany({
          where: { companyId: session.userId },
          include: {
            applications: true,
            submissions: true,
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.application.findMany({
          where: { project: { companyId: session.userId } },
          include: {
            project: { select: { title: true } },
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.submission.findMany({
          where: { project: { companyId: session.userId } },
          include: {
            project: { select: { title: true } },
            student: { select: { name: true, email: true } },
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.certificate.findMany({
          where: { companyId: session.userId },
          include: {
            project: { select: { title: true } },
          },
          orderBy: { createdAt: "desc" },
        }),
      ]);

      return NextResponse.json({
        user: {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          role: profile.role,
        },
        profile,
        projects,
        applications,
        submissions,
        certificates,
      });
    }

    const [projects, applications, submissions, certificates] = await Promise.all([
      prisma.project.findMany({
        where: { status: "Active" },
        include: {
          company: {
            select: { name: true, domain: true, logoUrl: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.application.findMany({
        where: { studentId: session.userId },
        include: {
          project: {
            select: {
              title: true,
              company: { select: { name: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.submission.findMany({
        where: { studentId: session.userId },
        include: {
          project: {
            select: {
              title: true,
              company: { select: { name: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.certificate.findMany({
        where: { studentEmail: session.email },
        include: {
          company: {
            select: { name: true, logoUrl: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      user: {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role,
      },
      profile,
      projects,
      applications,
      submissions,
      certificates,
    });
  } catch (error) {
    console.error("Dashboard load error:", error);
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
  }
}
