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
      // Fetch submissions for company's projects
      const submissions = await prisma.submission.findMany({
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
      return NextResponse.json({ submissions });
    } else {
      // Fetch student's own submissions
      const submissions = await prisma.submission.findMany({
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
      return NextResponse.json({ submissions });
    }
  } catch (error) {
    console.error("Fetch submissions error:", error);
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { projectId, teamName, submissionUrl, notes } = await req.json();

    if (!projectId || !teamName || !submissionUrl) {
      return NextResponse.json({ error: "Project, team name, and URL are required" }, { status: 400 });
    }

    const submission = await prisma.submission.create({
      data: {
        projectId,
        teamName,
        submissionUrl,
        notes,
        studentId: session.userId,
      },
    });

    return NextResponse.json({ success: true, submission });
  } catch (error) {
    console.error("Submit deliverables error:", error);
    return NextResponse.json({ error: "Failed to submit deliverables" }, { status: 500 });
  }
}
