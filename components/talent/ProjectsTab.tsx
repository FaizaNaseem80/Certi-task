"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Btn, Card, EmptyState, Field, Modal, Notice, SectionHeader, SkillChips, VerificationBadge, daysUntil, formatDate, inputStyle, selectStyle, textareaStyle } from "@/components/dashboard/ui";
import { api } from "@/components/dashboard/useDashboardData";
import { PROJECT_CATEGORIES, PROJECT_CATEGORY_LABEL, CLIENT_TYPE_LABEL } from "@/lib/enums";
import type { ApplicationDto, ProjectDto, SubmissionDto } from "@/lib/types";
import type { TalentTab } from "@/app/talent/dashboard/page";

export function ProjectsTab({ projects, applications, submissions, onChanged, goTo }: {
  projects: ProjectDto[]; applications: ApplicationDto[]; submissions: SubmissionDto[]; onChanged: () => void; goTo: (t: TalentTab) => void;
}) {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [applying, setApplying] = useState<ProjectDto | null>(null);
  const [form, setForm] = useState({ teamName: "", pitch: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return projects.filter(p =>
      (category === "all" || p.category === category) &&
      (!needle || p.title.toLowerCase().includes(needle) || p.description.toLowerCase().includes(needle) || p.requiredSkills.some(s => s.toLowerCase().includes(needle)) || p.client?.name.toLowerCase().includes(needle))
    );
  }, [projects, q, category]);

  function appFor(projectId: string) {
    return applications.find(a => a.projectId === projectId && a.status !== "WITHDRAWN");
  }

  async function apply(e: React.FormEvent) {
    e.preventDefault();
    if (!applying) return;
    setBusy(true); setError(null);
    const res = await api("/api/applications", "POST", { projectId: applying.id, ...form });
    setBusy(false);
    if (!res.ok) { setError(res.error ?? "Could not apply"); return; }
    setApplying(null); setForm({ teamName: "", pitch: "" });
    onChanged();
    goTo("applications");
  }

  return (
    <div>
      <SectionHeader icon="🔎" title="Find projects" subtitle="Open projects from clients. Apply to the ones that match your skills." />

      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <input id="proj-search" value={q} onChange={e => setQ(e.target.value)} style={{ ...inputStyle(), flex: "1 1 240px" }} placeholder="Search by title, skill or client…" aria-label="Search projects" />
        <select id="proj-cat" value={category} onChange={e => setCategory(e.target.value)} style={{ ...selectStyle(), width: "auto", minWidth: 200 }} aria-label="Filter by category">
          <option value="all">All categories</option>
          {PROJECT_CATEGORIES.map(c => <option key={c} value={c}>{PROJECT_CATEGORY_LABEL[c]}</option>)}
        </select>
      </div>

      {visible.length === 0 ? (
        <EmptyState icon="📭" title={projects.length === 0 ? "No open projects right now" : "No projects match your search"} hint={projects.length === 0 ? "Check back soon — new projects are posted regularly." : "Try a different keyword or category."} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {visible.map(p => {
            const app = appFor(p.id);
            const sub = app ? submissions.find(s => s.teamId === app.teamId) : undefined;
            const days = daysUntil(p.deadline);
            return (
              <Card key={p.id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
                  <div style={{ minWidth: 0 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "var(--gold)", textTransform: "uppercase" }}>{PROJECT_CATEGORY_LABEL[p.category]}</span>
                    <h4 style={{ fontSize: 17, fontWeight: 700, color: "var(--navy)", margin: "2px 0 4px" }}>
                      <Link href={`/projects/${p.id}`} style={{ color: "inherit", textDecoration: "none" }}>{p.title}</Link>
                    </h4>
                    {p.client && (
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <Link href={`/clients/${p.client.id}`} style={{ fontSize: 13, fontWeight: 600, color: "var(--gold)", textDecoration: "none" }}>{p.client.name}</Link>
                        <span style={{ fontSize: 11, color: "var(--ink-subtle)" }}>{p.client.clientType ? CLIENT_TYPE_LABEL[p.client.clientType] : ""}</span>
                        <VerificationBadge status={p.client.verificationStatus} />
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: 12, color: days <= 3 ? "#9B2C2C" : "var(--ink-subtle)", whiteSpace: "nowrap", fontWeight: days <= 3 ? 700 : 400 }}>📅 {formatDate(p.deadline)} · {days} day{days !== 1 ? "s" : ""} left</span>
                </div>
                <p style={{ fontSize: 14, color: "var(--ink-muted)", margin: "0 0 12px", lineHeight: 1.6 }}>{p.description}</p>
                <div style={{ marginBottom: 14 }}><SkillChips skills={p.requiredSkills} /></div>
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  {sub && sub.status !== "REJECTED" ? (
                    <Btn variant="ghost" small onClick={() => goTo("submissions")}>View submission</Btn>
                  ) : app?.status === "SELECTED" ? (
                    <Btn variant="success" onClick={() => goTo("submissions")}>📤 Submit deliverables</Btn>
                  ) : app ? (
                    <Btn variant="ghost" disabled>{app.status === "REJECTED" ? "Not selected" : app.status === "SHORTLISTED" ? "Shortlisted ✓" : "Application pending"}</Btn>
                  ) : (
                    <Btn onClick={() => { setApplying(p); setForm({ teamName: "", pitch: "" }); setError(null); }}>Apply →</Btn>
                  )}
                  <span style={{ fontSize: 12, color: "var(--ink-subtle)" }}>Team size up to {p.teamCap} · {p._count?.applications ?? 0} applied</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {applying && (
        <Modal title={`Apply to ${applying.title}`} subtitle={`${applying.client?.name ?? "Client"} · deadline ${formatDate(applying.deadline)}. Team invitations are coming in the next release; for now you apply as a team of one.`} onClose={() => setApplying(null)}>
          <form onSubmit={apply} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Field label="Team name" required hint="Your own name is fine if you are applying solo.">
              <input id="apply-team" value={form.teamName} onChange={e => setForm({ ...form, teamName: e.target.value })} style={inputStyle()} placeholder="e.g. Ayesha Khan" maxLength={100} required autoFocus />
            </Field>
            <Field label="Pitch" required>
              <textarea id="apply-pitch" value={form.pitch} onChange={e => setForm({ ...form, pitch: e.target.value })} rows={5} style={textareaStyle()} placeholder="Why you? Relevant experience, links to similar work, how you would approach this." required />
            </Field>
            {error && <Notice kind="error">{error}</Notice>}
            <div style={{ display: "flex", gap: 10 }}>
              <Btn type="button" variant="ghost" style={{ flex: 1 }} onClick={() => setApplying(null)}>Cancel</Btn>
              <Btn type="submit" style={{ flex: 2 }} disabled={busy}>{busy ? "Sending…" : "Send application"}</Btn>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
