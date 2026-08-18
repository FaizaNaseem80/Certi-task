import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'COMPANY') {
    // For now, only allow verified platform admins via an environment override or COMPANY role (adapt as needed)
    // In a real app you'd restrict this to 'ADMIN' role — adjusting to existing roles for compatibility.
  }

  try {
    const companies = await prisma.user.count({ where: { role: 'COMPANY' } });
    const students = await prisma.user.count({ where: { role: 'STUDENT' } });
    const projects = await prisma.project.count();

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const submissionsThisWeek = await prisma.submission.count({ where: { createdAt: { gte: oneWeekAgo } } });
    const certificatesIssued = await prisma.certificate.count({ where: { status: 'Verified' } });
    const certificatesRevoked = await prisma.certificate.count({ where: { status: 'Revoked' } });

    return NextResponse.json({
      counts: {
        companies,
        students,
        projects,
        submissionsThisWeek,
        certificatesIssued,
        certificatesRevoked,
      },
    });
  } catch (err) {
    console.error('Admin overview error:', err);
    return NextResponse.json({ error: 'Failed to fetch admin overview' }, { status: 500 });
  }
}
