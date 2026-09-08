import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET: Load the authenticated user's full profile
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({
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
        // Company-specific
        companySize: true,
        industry: true,
        foundedYear: true,
        companyDescription: true,
        companyWebsite: true,
        linkedinUrl: true,
        // Student-specific
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

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json({ success: true, user });
  } catch (err) {
    console.error('Fetch profile error:', err);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

// PATCH: Update the authenticated user's profile
export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const payload = await req.json();
    const allowed: Record<string, unknown> = {};

    // Common fields all users can edit
    const commonFields = ['name', 'bio', 'website', 'logoUrl', 'domain', 'phone', 'location'];
    for (const f of commonFields) {
      if (payload[f] !== undefined) allowed[f] = String(payload[f]).trim();
    }

    const role = (session.role || '').toUpperCase();

    // Company-specific fields
    if (role === 'COMPANY') {
      const companyFields = ['companySize', 'industry', 'companyDescription', 'companyWebsite', 'linkedinUrl'];
      for (const f of companyFields) {
        if (payload[f] !== undefined) allowed[f] = String(payload[f]).trim();
      }
      if (payload.cnicNumber !== undefined) {
        const cnic = String(payload.cnicNumber).trim();
        if (/^\d{5}-\d{7}-\d{1}$/.test(cnic)) {
          allowed.cnicNumber = cnic;
        } else if (cnic.length > 0) {
          const digits = cnic.replace(/\D/g, '');
          if (digits.length === 13) {
            allowed.cnicNumber = `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
          }
        }
      }
      if (payload.foundedYear !== undefined && payload.foundedYear !== null && payload.foundedYear !== '') {
        const yr = parseInt(String(payload.foundedYear));
        if (!isNaN(yr) && yr >= 1800 && yr <= new Date().getFullYear()) {
          allowed.foundedYear = yr;
        }
      }
    }

    // Student-specific fields
    if (role === 'STUDENT') {
      const studentStringFields = [
        'dateOfBirth', 'gender', 'universityName', 'degreeProgram',
        'currentSemester', 'portfolioUrl', 'resumeUrl',
      ];
      for (const f of studentStringFields) {
        if (payload[f] !== undefined) allowed[f] = String(payload[f]).trim();
      }

      // Handle both skills and skillsArray
      const skillsInput = payload.skillsArray !== undefined ? payload.skillsArray : payload.skills;
      if (skillsInput !== undefined) {
        allowed.skillsArray = String(skillsInput).trim();
      }

      if (payload.gpa !== undefined && payload.gpa !== null && payload.gpa !== '') {
        const g = parseFloat(String(payload.gpa));
        if (!isNaN(g) && g >= 0 && g <= 4) {
          allowed.gpa = g;
        }
      }
      // CNIC number submission — once submitted it marks cnicVerified as true
      if (payload.cnicNumber !== undefined) {
        const cnic = String(payload.cnicNumber).trim();
        if (/^\d{5}-\d{7}-\d{1}$/.test(cnic)) {
          allowed.cnicNumber = cnic;
        } else if (cnic.length > 0) {
          const digits = cnic.replace(/\D/g, '');
          if (digits.length === 13) {
            const formatted = `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
            allowed.cnicNumber = formatted;
          }
        }
      }
    }

    if (Object.keys(allowed).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: session.userId },
      data: allowed,
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        website: true,
        domain: true,
        logoUrl: true,
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

    return NextResponse.json({ success: true, user: updated });
  } catch (err) {
    console.error('Update profile error:', err);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
