/**
 * Human-readable labels for every enum the UI shows.
 * Values mirror prisma/schema.prisma exactly; keep them in sync.
 */

export const ROLES = ["CLIENT", "TALENT"] as const;
export type Role = (typeof ROLES)[number];

export const CLIENT_TYPES = ["INDIVIDUAL", "ORGANIZATION"] as const;
export type ClientType = (typeof CLIENT_TYPES)[number];
export const CLIENT_TYPE_LABEL: Record<ClientType, string> = {
  INDIVIDUAL: "Individual",
  ORGANIZATION: "Organization",
};

export const VERIFICATION_STATUSES = ["UNVERIFIED", "PENDING_REVIEW", "VERIFIED", "REJECTED"] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];
export const VERIFICATION_STATUS_LABEL: Record<VerificationStatus, string> = {
  UNVERIFIED: "Not verified",
  PENDING_REVIEW: "Pending review",
  VERIFIED: "Verified",
  REJECTED: "Rejected",
};

export const PROJECT_CATEGORIES = [
  "SOFTWARE_DEVELOPMENT",
  "WEB_AND_MOBILE",
  "DATA_AND_AI",
  "DESIGN_AND_UX",
  "MARKETING_AND_CONTENT",
  "RESEARCH_AND_WRITING",
  "BUSINESS_AND_OPERATIONS",
  "OTHER",
] as const;
export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];
export const PROJECT_CATEGORY_LABEL: Record<ProjectCategory, string> = {
  SOFTWARE_DEVELOPMENT: "Software Development",
  WEB_AND_MOBILE: "Web & Mobile",
  DATA_AND_AI: "Data & AI",
  DESIGN_AND_UX: "Design & UX",
  MARKETING_AND_CONTENT: "Marketing & Content",
  RESEARCH_AND_WRITING: "Research & Writing",
  BUSINESS_AND_OPERATIONS: "Business & Operations",
  OTHER: "Other",
};

export const PROJECT_STATUSES = ["DRAFT", "PENDING_PAYMENT", "ACTIVE", "PAUSED", "CLOSED", "COMPLETED"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  DRAFT: "Draft",
  PENDING_PAYMENT: "Awaiting payment",
  ACTIVE: "Active",
  PAUSED: "Paused",
  CLOSED: "Closed",
  COMPLETED: "Completed",
};

export const APPLICATION_STATUSES = ["PENDING", "SHORTLISTED", "SELECTED", "REJECTED", "WITHDRAWN"] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];
export const APPLICATION_STATUS_LABEL: Record<ApplicationStatus, string> = {
  PENDING: "Pending",
  SHORTLISTED: "Shortlisted",
  SELECTED: "Selected",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

export const SUBMISSION_STATUSES = ["SUBMITTED", "APPROVED", "REJECTED"] as const;
export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];
export const SUBMISSION_STATUS_LABEL: Record<SubmissionStatus, string> = {
  SUBMITTED: "Submitted",
  APPROVED: "Approved",
  REJECTED: "Changes requested",
};

export const CERTIFICATE_STATUSES = ["VERIFIED", "REVOKED", "DISPUTED"] as const;
export type CertificateStatus = (typeof CERTIFICATE_STATUSES)[number];
export const CERTIFICATE_STATUS_LABEL: Record<CertificateStatus, string> = {
  VERIFIED: "Verified",
  REVOKED: "Revoked",
  DISPUTED: "Disputed",
};

export const TEAM_CAP_MIN = 1;
export const TEAM_CAP_MAX = 20;
export const TEAM_CAP_DEFAULT = 1;

/** Generic label lookup for any status string the UI might receive. */
export function statusLabel(value: string): string {
  const all: Record<string, string> = {
    ...PROJECT_STATUS_LABEL,
    ...APPLICATION_STATUS_LABEL,
    ...SUBMISSION_STATUS_LABEL,
    ...CERTIFICATE_STATUS_LABEL,
    ...VERIFICATION_STATUS_LABEL,
  };
  return all[value] ?? value;
}

export function isOneOf<T extends readonly string[]>(list: T, value: unknown): value is T[number] {
  return typeof value === "string" && (list as readonly string[]).includes(value);
}
