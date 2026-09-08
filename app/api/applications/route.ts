import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { isString } from "@/lib/validation";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (session.role === "COMPANY") {
      // Return applications for company's projects
      const applications = await prisma.application.findMany({
        where: {
          project: {
            companyId: session.userId,
          },
        },
        include: {
          project: {
            select: { title: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ applications });
    } else {
      // Return student's own applications
      const applications = await prisma.application.findMany({
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
      });
      return NextResponse.json({ applications });
    }
  } catch (error) {
    console.error("Fetch applications error:", error);
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { projectId, teamName, members, pitch } = await req.json();

    if (!isString(projectId, 100) || !isString(teamName, 200) || !isString(members, 4000) || !isString(pitch, 10000)) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const project = await prisma.project.findFirst({
      where: { id: projectId, status: "Active" },
      select: { id: true },
    });
    if (!project) {
      return NextResponse.json({ error: "Project is not available" }, { status: 404 });
    }

    const application = await prisma.application.create({
      data: {
        projectId,
        teamName,
        members,
        pitch,
        studentId: session.userId,
      },
    });

    return NextResponse.json({ success: true, application });
  } catch (error) {
    console.error("Submit application error:", error);
    return NextResponse.json({ error: "Failed to submit application" }, { status: 500 });
  }
}
