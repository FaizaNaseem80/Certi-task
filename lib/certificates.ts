import { createHmac, randomBytes } from "node:crypto";

/**
 * Public certificate id printed on the PDF and used on /verify.
 * Format: CERT-XXXX-XXXX-XXXX (unambiguous uppercase alphanumerics, 62^12 space).
 */
export function generateCertId(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I
  const bytes = randomBytes(12);
  let out = "";
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) out += "-";
    out += alphabet[bytes[i] % alphabet.length];
  }
  return `CERT-${out}`;
}

export interface SignableCertificate {
  certId: string;
  recipientName: string;
  recipientEmail: string;
  issuerName: string;
  projectId: string;
  title: string;
  issuedAt: Date;
}

function signingKey(): string {
  const key = process.env.CERTIFICATE_SIGNING_KEY || process.env.JWT_SECRET;
  if (!key) throw new Error("CERTIFICATE_SIGNING_KEY (or JWT_SECRET) is not configured");
  return key;
}

/**
 * HMAC-SHA256 over the immutable certificate fields. Stored on the row and
 * re-checked on verification so a tampered DB row is detectable.
 */
export function signCertificate(c: SignableCertificate): string {
  const payload = [
    c.certId,
    c.recipientName,
    c.recipientEmail.toLowerCase(),
    c.issuerName,
    c.projectId,
    c.title,
    c.issuedAt.toISOString(),
  ].join("|");
  return createHmac("sha256", signingKey()).update(payload).digest("hex");
}

export function verifyCertificateSignature(c: SignableCertificate, signature: string): boolean {
  return signCertificate(c) === signature;
}
