import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { generateCertId, signCertificate } from "@/lib/certificates";
import { generateCertificatePdf } from "@/lib/pdf";
import { sendCertificateEmail } from "@/lib/email";
import { audit } from "@/lib/audit";
import type { SessionPayload } from "@/lib/auth-token";

/**
 * Issue one certificate per ACCEPTED team member for an approved submission.
 * Idempotent: a member who already holds a certificate for this project is skipped
 * (unique [projectId, talentId]). Runs inside the caller's transaction.
 *
 * Phase 2 will additionally require the recipient's identity to be VERIFIED.
 */
export async function issueCertificatesForSubmission(
  tx: Prisma.TransactionClient,
  actor: SessionPayload,
  submissionId: string
): Promise<string[]> {
  const submission = await tx.submission.findUniqueOrThrow({
    where: { id: submissionId },
    include: {
      project: {
        select: {
          id: true,
          title: true,
          requiredSkills: true,
          client: { select: { id: true, name: true, legalName: true, clientType: true } },
        },
      },
      team: {
        select: {
          id: true,
          members: {
            where: { status: "ACCEPTED" },
            select: { user: { select: { id: true, name: true, legalName: true, email: true } } },
          },
        },
      },
    },
  });

  const client = submission.project.client;
  const issuerName = client.legalName || client.name;
  const issuerType = client.clientType ?? "INDIVIDUAL";
  const title = submission.project.title;
  const issued: string[] = [];

  const memberIds = submission.team.members.map((m) => m.user.id);
  const existing = await tx.certificate.findMany({
    where: { projectId: submission.project.id, talentId: { in: memberIds } },
    select: { talentId: true },
  });
  const alreadyIssued = new Set(existing.map((c) => c.talentId));

  for (const { user } of submission.team.members) {
    if (alreadyIssued.has(user.id)) continue;

    const issuedAt = new Date();
    const certId = generateCertId();
    const recipientName = user.legalName || user.name;
    const signature = signCertificate({
      certId,
      recipientName,
      recipientEmail: user.email,
      issuerName,
      projectId: submission.project.id,
      title,
      issuedAt,
    });

    const cert = await tx.certificate.create({
      data: {
        certId,
        talentId: user.id,
        clientId: client.id,
        projectId: submission.project.id,
        teamId: submission.team.id,
        recipientName,
        recipientEmail: user.email,
        issuerName,
        issuerType,
        title,
        skills: submission.project.requiredSkills,
        issuedAt,
        signature,
      },
    });
    await audit(actor, "certificate.issued", "certificate", cert.id, { certId, talentId: user.id, projectId: submission.project.id }, tx);
    issued.push(cert.id);
  }

  return issued;
}

/** Best-effort PDF + email delivery after the transaction has committed. Never throws. */
export async function deliverCertificates(certificateIds: string[]): Promise<void> {
  for (const id of certificateIds) {
    try {
      const cert = await prisma.certificate.findUnique({ where: { id } });
      if (!cert) continue;
      const pdf = await generateCertificatePdf(cert);
      await sendCertificateEmail({
        to: cert.recipientEmail,
        subject: `Your CertiTask certificate — ${cert.title}`,
        text: `Congratulations ${cert.recipientName}! Your certificate for "${cert.title}" issued by ${cert.issuerName} is attached. Verify it any time at ${process.env.APP_URL ?? ""}/verify using ID ${cert.certId}.`,
        attachment: { filename: `${cert.certId}.pdf`, content: pdf },
      });
    } catch (err) {
      console.error("certificate delivery failed:", id, err);
    }
  }
}
