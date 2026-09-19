import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { profileSelect } from "@/lib/queries";
import { isHttpUrl } from "@/lib/validation";

/** GET: the authenticated user's own profile. */
export async function GET() {
  const session = await getSession();
  if (!session || session.role === "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: session.userId }, select: profileSelect });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json({ success: true, user });
  } catch (err) {
    console.error("Fetch profile error:", err);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

const COMMON_TEXT = ["name", "bio", "phone", "location"] as const;
const COMMON_URL = ["website", "avatarUrl", "linkedinUrl"] as const;
const ORG_TEXT = ["industry", "organizationSize", "registrationNumber"] as const;
const TALENT_TEXT = ["gender", "universityName", "degreeProgram", "currentSemester"] as const;
const TALENT_URL = ["portfolioUrl", "resumeUrl"] as const;

function optionalText(value: unknown, max = 500): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  if (typeof value !== "string") return undefined;
  const v = value.trim();
  return v.length > max ? v.slice(0, max) : v;
}

function optionalUrl(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  return isHttpUrl(value) ? value : undefined;
}

/**
 * PATCH: update the authenticated user's editable profile fields.
 * Identity fields (legalName, ID number, verification status) are NOT editable
 * here — they are set through the verification flow (Phase 2).
 */
export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session || session.role === "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload: Record<string, unknown> = await req.json();
    const data: Record<string, unknown> = {};

    for (const f of COMMON_TEXT) {
      const v = optionalText(payload[f], f === "bio" ? 2000 : 200);
      if (v !== undefined) data[f] = v;
    }
    if (typeof data.name === "string" && data.name.length === 0) {
      return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
    }
    if (data.name === null) delete data.name;

    for (const f of COMMON_URL) {
      const v = optionalUrl(payload[f]);
      if (v !== undefined) data[f] = v;
    }

    if (session.role === "CLIENT") {
      for (const f of ORG_TEXT) {
        const v = optionalText(payload[f], 200);
        if (v !== undefined) data[f] = v;
      }
      if (payload.foundedYear !== undefined) {
        if (payload.foundedYear === null || payload.foundedYear === "") {
          data.foundedYear = null;
        } else {
          const yr = parseInt(String(payload.foundedYear), 10);
          if (!Number.isNaN(yr) && yr >= 1800 && yr <= new Date().getFullYear()) data.foundedYear = yr;
        }
      }
    }

    if (session.role === "TALENT") {
      for (const f of TALENT_TEXT) {
        const v = optionalText(payload[f], 200);
        if (v !== undefined) data[f] = v;
      }
      for (const f of TALENT_URL) {
        const v = optionalUrl(payload[f]);
        if (v !== undefined) data[f] = v;
      }
      if (payload.skills !== undefined) {
        const raw = Array.isArray(payload.skills)
          ? payload.skills
          : typeof payload.skills === "string"
            ? payload.skills.split(",")
            : [];
        const skills = Array.from(
          new Set(raw.map((s) => String(s).trim()).filter((s) => s.length > 0 && s.length <= 40))
        ).slice(0, 30);
        data.skills = skills;
      }
      if (payload.gpa !== undefined) {
        if (payload.gpa === null || payload.gpa === "") {
          data.gpa = null;
        } else {
          const g = parseFloat(String(payload.gpa));
          if (!Number.isNaN(g) && g >= 0 && g <= 4) data.gpa = g;
        }
      }
      if (payload.dateOfBirth !== undefined) {
        if (payload.dateOfBirth === null || payload.dateOfBirth === "") {
          data.dateOfBirth = null;
        } else {
          const d = new Date(String(payload.dateOfBirth));
          if (!Number.isNaN(d.getTime()) && d < new Date()) data.dateOfBirth = d;
        }
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: session.userId },
      data,
      select: profileSelect,
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (err) {
    console.error("Update profile error:", err);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
