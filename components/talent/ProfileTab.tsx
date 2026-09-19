"use client";

import { useState } from "react";
import { Btn, Field, Notice, SectionHeader, VerificationBadge, inputStyle, selectStyle, textareaStyle } from "@/components/dashboard/ui";
import { api } from "@/components/dashboard/useDashboardData";
import type { ProfileDto } from "@/lib/types";

export function ProfileTab({ profile, onSaved }: { profile: ProfileDto; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: profile.name ?? "",
    phone: profile.phone ?? "",
    location: profile.location ?? "",
    bio: profile.bio ?? "",
    dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.slice(0, 10) : "",
    gender: profile.gender ?? "",
    universityName: profile.universityName ?? "",
    degreeProgram: profile.degreeProgram ?? "",
    currentSemester: profile.currentSemester ?? "",
    gpa: profile.gpa != null ? String(profile.gpa) : "",
    skills: profile.skills.join(", "),
    portfolioUrl: profile.portfolioUrl ?? "",
    resumeUrl: profile.resumeUrl ?? "",
    linkedinUrl: profile.linkedinUrl ?? "",
  });
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError("Name is required"); return; }
    setBusy(true); setSaved(false); setError(null);
    const res = await api("/api/auth/profile", "PATCH", { ...form, gpa: form.gpa === "" ? null : parseFloat(form.gpa) });
    setBusy(false);
    if (!res.ok) { setError(res.error ?? "Could not save profile"); return; }
    setSaved(true); setTimeout(() => setSaved(false), 3000);
    onSaved();
  }

  const section = (title: string, children: React.ReactNode) => (
    <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 24, marginBottom: 20 }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)", margin: "0 0 18px", paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>{title}</h3>
      <div className="mobile-dashboard-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>{children}</div>
    </div>
  );

  return (
    <div>
      <SectionHeader icon="✏️" title="Edit profile" subtitle="Clients see this when you apply. Keep it accurate — your certificates use the name on your verified ID." />

      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", border: "1px solid var(--border)", borderRadius: 10, marginBottom: 20, background: "#FAFAFA", flexWrap: "wrap" }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)" }}>Identity verification</span>
        <VerificationBadge status={profile.verificationStatus} />
        <span style={{ fontSize: 12, color: "var(--ink-subtle)" }}>{profile.verificationStatus === "VERIFIED" ? `Verified · ID ending ${profile.idLast4 ?? "····"}` : "Document upload and review arrive in the next release."}</span>
      </div>

      <form onSubmit={save}>
        {section("👤 Personal", <>
          <Field label="Full name" required><input id="pf-name" value={form.name} onChange={set("name")} style={inputStyle()} required maxLength={120} /></Field>
          <Field label="Email"><input value={profile.email} disabled style={{ ...inputStyle(), background: "#F7FAFC", color: "var(--ink-subtle)" }} /></Field>
          <Field label="Phone"><input id="pf-phone" value={form.phone} onChange={set("phone")} style={inputStyle()} placeholder="+92 300 1234567" /></Field>
          <Field label="Location"><input id="pf-location" value={form.location} onChange={set("location")} style={inputStyle()} placeholder="City, Country" /></Field>
          <Field label="Date of birth"><input id="pf-dob" type="date" value={form.dateOfBirth} onChange={set("dateOfBirth")} style={inputStyle()} max={new Date().toISOString().slice(0, 10)} /></Field>
          <Field label="Gender">
            <select id="pf-gender" value={form.gender} onChange={set("gender")} style={selectStyle()}>
              <option value="">Prefer not to say</option><option>Female</option><option>Male</option><option>Other</option>
            </select>
          </Field>
        </>)}

        {section("🎓 Education", <>
          <Field label="University / institute"><input id="pf-uni" value={form.universityName} onChange={set("universityName")} style={inputStyle()} placeholder="e.g. NUST" /></Field>
          <Field label="Degree program"><input id="pf-degree" value={form.degreeProgram} onChange={set("degreeProgram")} style={inputStyle()} placeholder="e.g. BS Computer Science" /></Field>
          <Field label="Current semester / year">
            <select id="pf-sem" value={form.currentSemester} onChange={set("currentSemester")} style={selectStyle()}>
              <option value="">Select</option>
              {["1", "2", "3", "4", "5", "6", "7", "8"].map(s => <option key={s} value={s}>Semester {s}</option>)}
              <option value="Graduated">Graduated</option>
              <option value="Not a student">Not a student</option>
            </select>
          </Field>
          <Field label="GPA / CGPA (out of 4)"><input id="pf-gpa" type="number" step="0.01" min="0" max="4" value={form.gpa} onChange={set("gpa")} style={inputStyle()} placeholder="e.g. 3.5" /></Field>
        </>)}

        {section("🛠️ Skills & links", <>
          <div style={{ gridColumn: "1 / -1" }}>
            <Field label="Skills" hint="Comma separated, up to 30. Clients search by these.">
              <textarea id="pf-skills" value={form.skills} onChange={set("skills")} rows={2} style={textareaStyle()} placeholder="e.g. React, Next.js, Figma, Technical writing" />
            </Field>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <Field label="Bio"><textarea id="pf-bio" value={form.bio} onChange={set("bio")} rows={4} style={textareaStyle()} placeholder="What you've built, what you're good at, what you're looking for." maxLength={2000} /></Field>
          </div>
          <Field label="Portfolio"><input id="pf-portfolio" type="url" value={form.portfolioUrl} onChange={set("portfolioUrl")} style={inputStyle()} placeholder="https://" /></Field>
          <Field label="Resume / CV link"><input id="pf-resume" type="url" value={form.resumeUrl} onChange={set("resumeUrl")} style={inputStyle()} placeholder="https://" /></Field>
          <Field label="LinkedIn"><input id="pf-linkedin" type="url" value={form.linkedinUrl} onChange={set("linkedinUrl")} style={inputStyle()} placeholder="https://linkedin.com/in/…" /></Field>
        </>)}

        <Btn type="submit" disabled={busy} style={{ padding: "12px 32px", fontSize: 15 }}>{busy ? "Saving…" : "Save profile"}</Btn>
        {saved && <Notice kind="success">Profile saved.</Notice>}
        {error && <Notice kind="error">{error}</Notice>}
      </form>
    </div>
  );
}
