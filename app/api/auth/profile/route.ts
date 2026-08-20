import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const payload = await req.json();
    const allowed: any = {};
    const fields = ['name', 'bio', 'website', 'logoUrl', 'domain'];
    for (const f of fields) if (payload[f] !== undefined) allowed[f] = payload[f];

    const updated = await prisma.user.update({
      where: { id: session.userId },
      data: allowed,
    });

    return NextResponse.json({ success: true, user: { id: updated.id, name: updated.name, email: updated.email, bio: updated.bio, website: updated.website, domain: updated.domain, logoUrl: updated.logoUrl } });
  } catch (err) {
    console.error('Update profile error:', err);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
