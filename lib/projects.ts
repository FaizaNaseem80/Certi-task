/** Input parsing shared by the project create/update routes. */

export function parseSkills(value: unknown): string[] {
  const raw = Array.isArray(value) ? value : typeof value === "string" ? value.split(",") : [];
  return Array.from(new Set(raw.map((s) => String(s).trim()).filter((s) => s.length > 0 && s.length <= 40))).slice(0, 20);
}

export function parseDeadline(value: unknown): Date | null {
  if (typeof value !== "string" || !value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  // Accept a date-only string as end-of-day UTC so "today" is still valid.
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) d.setUTCHours(23, 59, 59, 999);
  return d;
}
