import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const authorization = await requireAdmin();
  if (authorization instanceof NextResponse) return authorization;

  try {
    const projects = await prisma.project.findMany({
      include: {
        company: {
          select: { name: true, email: true }
        },
        _count: {
          select: { applications: true, submissions: true, certificates: true }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Admin projects error:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}
