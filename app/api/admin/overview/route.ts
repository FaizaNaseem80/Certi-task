import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const authorization = await requireAdmin();
  if (authorization instanceof NextResponse) return authorization;

  try {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [
      clients, talents, projects, activeProjects, applications, submissionsThisWeek,
      certificatesIssued, certificatesRevoked, pendingVerifications, unreadMessages, totalMessages,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "CLIENT" } }),
      prisma.user.count({ where: { role: "TALENT" } }),
      prisma.project.count(),
      prisma.project.count({ where: { status: "ACTIVE" } }),
      prisma.application.count(),
      prisma.submission.count({ where: { createdAt: { gte: oneWeekAgo } } }),
      prisma.certificate.count({ where: { status: "VERIFIED" } }),
      prisma.certificate.count({ where: { status: "REVOKED" } }),
      prisma.verificationRequest.count({ where: { status: "PENDING_REVIEW" } }),
      prisma.contactMessage.count({ where: { isRead: false } }),
      prisma.contactMessage.count(),
    ]);

    return NextResponse.json({
      counts: {
        clients, talents, projects, activeProjects, applications, submissionsThisWeek,
        certificatesIssued, certificatesRevoked, pendingVerifications, unreadMessages, totalMessages,
      },
    });
  } catch (err) {
    console.error("Admin overview error:", err);
    return NextResponse.json({ error: "Failed to fetch admin overview" }, { status: 500 });
  }
}
