import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { isString } from "@/lib/validation";
import { submissionInclude } from "@/lib/queries";
import { audit } from "@/lib/audit";
import { deliverCertificates, issueCertificatesForSubmission } from "@/lib/issue-certificates";

type Params = { params: Promise<{ id: string }> };

/**
 * PATCH /api/submissions/[id] — project owner reviews a submission.
 * - APPROVED: one-step approval; certificates are issued to every accepted team
 *   member in the same transaction (FR-C8, FR-V1).
 * - REJECTED: feedback is required; the team may resubmit.
 */
export async function PATCH(req: Request, { params }: Params) {
  const auth = await requireRole("CLIENT");
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const { status, feedback } = await req.json();

    if (status !== "APPROVED" && status !== "REJECTED") {
      return NextResponse.json({ error: "Status must be APPROVED or REJECTED" }, { status: 400 });
    }
    if (status === "REJECTED" && !isString(feedback, 5000)) {
      return NextResponse.json({ error: "Tell the team what needs to change" }, { status: 400 });
    }
    if (feedback !== undefined && feedback !== null && feedback !== "" && !isString(feedback, 5000)) {
      return NextResponse.json({ error: "Feedback is too long" }, { status: 400 });
    }

    const submission = await prisma.submission.findUnique({
      where: { id },
      include: { project: { select: { clientId: true } } },
    });
    if (!submission || submission.project.clientId !== auth.userId) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }
    if (submission.status === "APPROVED") {
      return NextResponse.json({ error: "This submission is already approved" }, { status: 409 });
    }

    const { updated, certificateIds } = await prisma.$transaction(async (tx) => {
      const updated = await tx.submission.update({
        where: { id },
        data: {
          status,
          feedback: feedback ? String(feedback).trim() : null,
          reviewedAt: new Date(),
        },
        include: submissionInclude,
      });
      await audit(auth, status === "APPROVED" ? "submission.approved" : "submission.rejected", "submission", id, { from: submission.status }, tx);

      const certificateIds = status === "APPROVED" ? await issueCertificatesForSubmission(tx, auth, id) : [];
      return { updated, certificateIds };
    }, { maxWait: 10_000, timeout: 60_000 }); // remote DB: several sequential round trips

    // Email delivery happens after commit and never blocks the response.
    if (certificateIds.length > 0) void deliverCertificates(certificateIds);

    return NextResponse.json({ success: true, submission: updated, certificatesIssued: certificateIds.length });
  } catch (error) {
    console.error("Review submission error:", error);
    return NextResponse.json({ error: "Failed to review submission" }, { status: 500 });
  }
}
