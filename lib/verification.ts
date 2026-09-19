import { createHash } from "node:crypto";

export const ID_TYPES = ["CNIC", "PASSPORT", "NATIONAL_ID"] as const;
export type IdType = (typeof ID_TYPES)[number];
export const ID_TYPE_LABEL: Record<IdType, string> = {
  CNIC: "CNIC (Pakistan)",
  PASSPORT: "Passport",
  NATIONAL_ID: "National ID (other country)",
};

/** Normalise an ID number for hashing/formatting: uppercase, digits/letters only. */
export function normalizeIdNumber(type: IdType, raw: string): string | null {
  const cleaned = raw.replace(/[\s-]/g, "").toUpperCase();
  if (type === "CNIC") {
    if (!/^\d{13}$/.test(cleaned)) return null;
    return cleaned;
  }
  if (!/^[A-Z0-9]{5,20}$/.test(cleaned)) return null;
  return cleaned;
}

/** Display form: CNIC as 12345-1234567-1, others as-is. */
export function formatIdNumber(type: IdType, normalized: string): string {
  if (type === "CNIC") return `${normalized.slice(0, 5)}-${normalized.slice(5, 12)}-${normalized.slice(12)}`;
  return normalized;
}

/**
 * One-way hash used only to detect the same ID being used on two accounts.
 * Peppered with the app secret so a leaked DB alone can't be brute-forced by
 * enumerating 13-digit CNICs.
 */
export function hashIdNumber(type: IdType, normalized: string): string {
  const pepper = process.env.ID_HASH_PEPPER || process.env.JWT_SECRET;
  if (!pepper) throw new Error("ID_HASH_PEPPER (or JWT_SECRET) is not configured");
  return createHash("sha256").update(`${pepper}|${type}|${normalized}`).digest("hex");
}

export const DOCUMENT_RETENTION_DAYS = 90;
