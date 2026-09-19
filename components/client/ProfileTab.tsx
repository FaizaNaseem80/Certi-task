"use client";

import { useState } from "react";
import { Btn, Field, Notice, SectionHeader, inputStyle, selectStyle, textareaStyle } from "@/components/dashboard/ui";
import { api } from "@/components/dashboard/useDashboardData";
import { CLIENT_TYPE_LABEL } from "@/lib/enums";
import type { ProfileDto } from "@/lib/types";

const INDUSTRIES = ["Technology", "Finance", "Healthcare", "Education", "Retail & E-commerce", "Media & Marketing", "Non-profit", "Government", "Other"];
const SIZES = ["1-10", "11-50", "51-200", "201-1000", "1001+"];

export function ProfileTab({ profile, onSaved }: { profile: ProfileDto; onSaved: () => void }) {
  const isOrg = profile.clientType === "ORGANIZATION";
  const [form, setForm] = useState({
    name: profile.name ?? "",
    bio: profile.bio ?? "",
    website: profile.website ?? "",
    linkedinUrl: profile.linkedinUrl ?? "",
    phone: profile.phone ?? "",
    location: profile.location ?? "",
    industry: profile.industry ?? "",
    organizationSize: profile.organizationSize ?? "",
    foundedYear: profile.foundedYear ? String(profile.foundedYear) : "",
  });
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setSaved(false); setError(null);
    const res = await api("/api/auth/profile", "PATCH", form);
    setBusy(false);
    if (!res.ok) { setError(res.error ?? "Could not save profile"); return; }
    setSaved(true); setTimeout(() => setSaved(false), 3000);
    onSaved();
  }

  return (
    <div>
      <SectionHeader icon="✏️" title="Edit profile" subtitle={`You are registered as an ${profile.clientType ? CLIENT_TYPE_LABEL[profile.clientType].toLowerCase() : "client"}. This is what talent sees on your public page.`} />
      <form onSubmit={save}>
        <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)", margin: "0 0 18px", paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>{isOrg ? "🏢 Organization" : "👤 About you"}</h3>
          <div className="mobile-dashboard-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label={isOrg ? "Organization name" : "Display name"} required>
              <input id="pf-name" value={form.name} onChange={set("name")} style={inputStyle()} required maxLength={200} />
            </Field>
            <Field label="Location">
              <input id="pf-location" value={form.location} onChange={set("location")} style={inputStyle()} placeholder="City, Country" />
            </Field>
            {isOrg && (
              <>
                <Field label="Industry">
                  <select id="pf-industry" value={form.industry} onChange={set("industry")} style={selectStyle()}>
                    <option value="">Select industry</option>
                    {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </Field>
                <Field label="Organization size">
                  <select id="pf-size" value={form.organizationSize} onChange={set("organizationSize")} style={selectStyle()}>
                    <option value="">Select size</option>
                    {SIZES.map(s => <option key={s} value={s}>{s} people</option>)}
                  </select>
                </Field>
                <Field label="Founded">
                  <input id="pf-founded" type="number" min={1800} max={new Date().getFullYear()} value={form.foundedYear} onChange={set("foundedYear")} style={inputStyle()} placeholder="e.g. 2019" />
                </Field>
              </>
            )}
          </div>
        </div>

        <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)", margin: "0 0 18px", paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>🌐 Contact &amp; links</h3>
          <div className="mobile-dashboard-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Phone">
              <input id="pf-phone" value={form.phone} onChange={set("phone")} style={inputStyle()} placeholder="+92 300 1234567" />
            </Field>
            <Field label="Website">
              <input id="pf-website" type="url" value={form.website} onChange={set("website")} style={inputStyle()} placeholder="https://example.com" />
            </Field>
            <Field label="LinkedIn">
              <input id="pf-linkedin" type="url" value={form.linkedinUrl} onChange={set("linkedinUrl")} style={inputStyle()} placeholder="https://linkedin.com/…" />
            </Field>
          </div>
        </div>

        <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)", margin: "0 0 18px", paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>📝 Bio</h3>
          <Field label={isOrg ? "What your organization does" : "A short introduction"}>
            <textarea id="pf-bio" value={form.bio} onChange={set("bio")} rows={4} style={textareaStyle()} placeholder={isOrg ? "Mission, what you build, and what kind of projects you post." : "Who you are and what kind of projects you post."} maxLength={2000} />
          </Field>
        </div>

        <Btn type="submit" disabled={busy} style={{ padding: "12px 32px", fontSize: 15 }}>{busy ? "Saving…" : "Save profile"}</Btn>
        {saved && <Notice kind="success">Profile saved.</Notice>}
        {error && <Notice kind="error">{error}</Notice>}
      </form>
    </div>
  );
}
