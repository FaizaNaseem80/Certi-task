import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

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

    if (!title || !description || !requiredSkills || !deliverables || !deadline) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        title,
        description,
        requiredSkills,
        deliverables,
        deadline,
        teamCap: parseInt(teamCap) || 20,
        companyId: session.userId,
      },
    });

    return NextResponse.json({ success: true, project });
  } catch (error) {
    console.error("Create project error:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
