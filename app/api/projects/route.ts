import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { isString } from "@/lib/validation";

export async function GET() {
  const session = await getSession();

  try {
    if (session?.role === "COMPANY") {
      // Return company's own projects
      const projects = await prisma.project.findMany({
        where: { companyId: session.userId },
        include: {
          applications: true,
          submissions: true,
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ projects });
    } else {
      // Return all active projects for students
      const projects = await prisma.project.findMany({
        where: { status: "Active" },
        include: {
          company: {
            select: { name: true, domain: true, logoUrl: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ projects });
    }
  } catch (error) {
    console.error("Fetch projects error:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "COMPANY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, description, requiredSkills, deliverables, deadline, teamCap } = await req.json();

    if (!isString(title, 200) || !isString(description, 10000) || !isString(requiredSkills, 4000) ||
        !isString(deliverables, 10000) || !isString(deadline, 100)) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const parsedTeamCap = Number(teamCap ?? 20);
    if (!Number.isInteger(parsedTeamCap) || parsedTeamCap < 1 || parsedTeamCap > 1000) {
      return NextResponse.json({ error: "Team capacity must be an integer from 1 to 1000" }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        title,
        description,
        requiredSkills,
        deliverables,
        deadline,
        teamCap: parsedTeamCap,
        companyId: session.userId,
      },
    });

    return NextResponse.json({ success: true, project });
  } catch (error) {
    console.error("Create project error:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
