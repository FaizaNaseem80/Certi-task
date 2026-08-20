import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const companies = await prisma.user.count({ where: { role: 'COMPANY' } });
    const students = await prisma.user.count({ where: { role: 'STUDENT' } });
    const projects = await prisma.project.count();
    const applications = await prisma.application.count();

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const submissionsThisWeek = await prisma.submission.count({ where: { createdAt: { gte: oneWeekAgo } } });
    const certificatesIssued = await prisma.certificate.count({ where: { status: 'Verified' } });
    const certificatesRevoked = await prisma.certificate.count({ where: { status: 'Revoked' } });
    const unreadMessages = await prisma.contactMessage.count({ where: { isRead: false } });
    const totalMessages = await prisma.contactMessage.count();

    return NextResponse.json({
      counts: {
        companies,
        students,
        projects,
        applications,
        submissionsThisWeek,
        certificatesIssued,
        certificatesRevoked,
        unreadMessages,
        totalMessages,
      },
    });
  } catch (err) {
    console.error('Admin overview error:', err);
    return NextResponse.json({ error: 'Failed to fetch admin overview' }, { status: 500 });
  }
}
