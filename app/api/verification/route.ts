import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { isString } from "@/lib/validation";
import { audit } from "@/lib/audit";
import { ID_TYPES, hashIdNumber, normalizeIdNumber, type IdType } from "@/lib/verification";
import { isOneOf } from "@/lib/enums";

const requestSelect = {
  id: true, kind: true, status: true, formData: true, submittedAt: true, reviewedAt: true, rejectionReason: true,
  documents: { where: { deletedAt: null }, select: { id: true, type: true, mimeType: true, sizeBytes: true, createdAt: true } },
} as const;

/** GET /api/verification — the signed-in user's verification state and request history. */
export async function GET() {
  const auth = await requireRole("CLIENT", "TALENT");
  if (auth instanceof NextResponse) return auth;

  const [user, requests, unattached] = await Promise.all([
    prisma.user.findUnique({
      where: { id: auth.userId },
      select: { verificationStatus: true, verifiedAt: true, emailVerifiedAt: true, legalName: true, idType: true, idLast4: true, clientType: true, registrationNumber: true },
    }),
    prisma.verificationRequest.findMany({ where: { userId: auth.userId }, select: requestSelect, orderBy: { submittedAt: "desc" } }),
    prisma.document.findMany({ where: { userId: auth.userId, verificationRequestId: null, deletedAt: null }, select: { id: true, type: true, mimeType: true, sizeBytes: true, createdAt: true } }),
  ]);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  return NextResponse.json({ user, requests, unattachedDocuments: unattached });
}

/**
 * POST /api/verification — submit identity (talent / individual client) or
 * organization (organization client) verification for admin review.
 *
 * Body:
 *  common:       legalName, idType, idNumber, documentIds: { idFront, idBack }
 *  organization: + registrationNumber, documentIds.orgRegistration
 * The raw ID number is never stored: only its peppered hash (uniqueness) and last 4 digits.
 */
export async function POST(req: Request) {
  const auth = await requireRole("CLIENT", "TALENT");
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { id: true, role: true, clientType: true, emailVerifiedAt: true, verificationStatus: true, name: true },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (!user.emailVerifiedAt) return NextResponse.json({ error: "Confirm your email address before submitting verification" }, { status: 403 });
    if (user.verificationStatus === "VERIFIED") return NextResponse.json({ error: "You are already verified" }, { status: 409 });
    if (user.verificationStatus === "PENDING_REVIEW") return NextResponse.json({ error: "Your previous submission is still being reviewed" }, { status: 409 });

    const isOrg = user.role === "CLIENT" && user.clientType === "ORGANIZATION";
    const kind = isOrg ? "ORGANIZATION" : "IDENTITY";

    // ── validate fields ──
    const legalName = typeof body.legalName === "string" ? body.legalName.trim() : "";
    if (!isString(legalName, 150) || legalName.length < 2) {
      return NextResponse.json({ error: isOrg ? "Enter the organization's registered legal name" : "Enter your full legal name exactly as on your ID" }, { status: 400 });
    }
    if (!isOneOf(ID_TYPES, body.idType)) return NextResponse.json({ error: "Choose an ID type" }, { status: 400 });
    const idType = body.idType as IdType;
    const normalized = typeof body.idNumber === "string" ? normalizeIdNumber(idType, body.idNumber) : null;
    if (!normalized) {
      return NextResponse.json({ error: idType === "CNIC" ? "CNIC must be 13 digits (e.g. 12345-1234567-1)" : "Enter a valid ID number" }, { status: 400 });
    }
    const idNumberHash = hashIdNumber(idType, normalized);
    const idLast4 = normalized.slice(-4);

    const authorizedPersonName = isOrg ? (typeof body.authorizedPersonName === "string" ? body.authorizedPersonName.trim() : "") : legalName;
    if (isOrg && (!isString(authorizedPersonName, 150) || authorizedPersonName.length < 2)) {
      return NextResponse.json({ error: "Enter the authorized person's full legal name" }, { status: 400 });
    }
    const registrationNumber = isOrg ? (typeof body.registrationNumber === "string" ? body.registrationNumber.trim() : "") : null;
    if (isOrg && !isString(registrationNumber, 60)) {
      return NextResponse.json({ error: "Enter the SECP / NTN / registration number" }, { status: 400 });
    }

    // ── documents ──
    const ids = body.documentIds ?? {};
    const required: Array<[string, string]> = [["idFront", "ID_FRONT"], ["idBack", "ID_BACK"]];
    if (isOrg) required.push(["orgRegistration", "ORG_REGISTRATION"]);
    const docIds: string[] = [];
    for (const [field, type] of required) {
      const id = ids[field];
      if (!isString(id, 100)) return NextResponse.json({ error: `Upload the ${type === "ORG_REGISTRATION" ? "registration document" : type === "ID_FRONT" ? "front of the ID" : "back of the ID"}` }, { status: 400 });
      const doc = await prisma.document.findFirst({ where: { id, userId: auth.userId, type: type as "ID_FRONT", deletedAt: null, verificationRequestId: null }, select: { id: true } });
      if (!doc) return NextResponse.json({ error: `The uploaded ${type.toLowerCase().replace("_", " ")} could not be found. Upload it again.` }, { status: 400 });
      docIds.push(doc.id);
    }

    // ── the same ID on another account is a hard stop ──
    const clash = await prisma.user.findFirst({ where: { idNumberHash, id: { not: auth.userId } }, select: { id: true } });
    if (clash) {
      await audit(auth, "verification.duplicate_id_attempt", "user", auth.userId, { idType, idLast4 });
      return NextResponse.json({ error: "This ID number is already verified on another CertiTask account. Contact support if you think this is a mistake." }, { status: 409 });
    }

    const request = await prisma.$transaction(async (tx) => {
      const vr = await tx.verificationRequest.create({
        data: {
          userId: auth.userId,
          kind,
          formData: { legalName, idType, idLast4, authorizedPersonName, registrationNumber },
          documents: { connect: docIds.map((id) => ({ id })) },
        },
        select: requestSelect,
      });
      await tx.user.update({
        where: { id: auth.userId },
        data: { verificationStatus: "PENDING_REVIEW", idType, idNumberHash, idLast4, ...(isOrg && registrationNumber ? { registrationNumber } : {}) },
      });
      await audit(auth, "verification.submitted", "verification_request", vr.id, { kind }, tx);
      return vr;
    }, { maxWait: 10_000, timeout: 30_000 });

    return NextResponse.json({ success: true, request });
  } catch (error) {
    console.error("Verification submit error:", error);
    return NextResponse.json({ error: "Could not submit verification" }, { status: 500 });
  }
}
