"use client";

import { useState } from "react";
import { Btn, Card, EmptyState, Field, Modal, Notice, SectionHeader, StatusBadge, formatDate, inputStyle, textareaStyle } from "@/components/dashboard/ui";
import { api } from "@/components/dashboard/useDashboardData";
import type { ApplicationDto, SubmissionDto } from "@/lib/types";
import { SUBMISSION_STATUS_LABEL } from "@/lib/enums";

export function SubmissionsTab({ applications, submissions, onChanged }: { applications: ApplicationDto[]; submissions: SubmissionDto[]; onChanged: () => void }) {
  const [target, setTarget] = useState<{ projectId: string; title: string; existing?: SubmissionDto } | null>(null);
  const [form, setForm] = useState({ submissionUrl: "", notes: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Selected applications with no live submission yet.
  const selected = applications.filter(a => a.status === "SELECTED");
  const todo = selected.filter(a => !submissions.some(s => s.teamId === a.teamId));

  function open(projectId: string, title: string, existing?: SubmissionDto) {
    setTarget({ projectId, title, existing });
    setForm({ submissionUrl: existing?.submissionUrl ?? "", notes: existing?.notes ?? "" });
    setError(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!target) return;
    setBusy(true); setError(null);
    const res = await api("/api/submissions", "POST", { projectId: target.projectId, ...form });
    setBusy(false);
    if (!res.ok) { setError(res.error ?? "Could not submit"); return; }
    setTarget(null);
    onChanged();
  }

  return (
    <div>
      <SectionHeader icon="📤" title="My submissions" subtitle="Submit the deliverables for projects you were selected for, and see the client's feedback." />

      {todo.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--ink-subtle)", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 12px" }}>Ready to submit</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {todo.map(a => (
              <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "14px 18px", border: "1px solid rgba(56,161,105,0.3)", borderRadius: 12, background: "rgba(56,161,105,0.04)", flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)" }}>{a.project.title}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-muted)" }}>{a.project.client?.name} · Team &ldquo;{a.team.name}&rdquo;</div>
                </div>
                <Btn variant="success" onClick={() => open(a.projectId, a.project.title)}>📤 Submit deliverables</Btn>
              </div>
            ))}
          </div>
        </div>
      )}

      {submissions.length === 0 && todo.length === 0 ? (
        <EmptyState icon="📂" title="Nothing to submit yet" hint="When a client selects your application, you can submit your work here." />
      ) : submissions.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {submissions.map(sub => (
            <Card key={sub.id} style={{ background: "#fff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
                <div>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)", margin: "0 0 4px" }}>{sub.project.title}</h4>
                  <span style={{ fontSize: 12, color: "var(--ink-muted)" }}>{sub.project.client?.name} · submitted {formatDate(sub.createdAt)}</span>
                </div>
                <StatusBadge status={sub.status} label={SUBMISSION_STATUS_LABEL[sub.status]} />
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, color: "var(--ink-subtle)" }}>🔗</span>
                <a href={sub.submissionUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "var(--gold)", fontWeight: 600, wordBreak: "break-all" }}>{sub.submissionUrl}</a>
              </div>
              {sub.notes && <p style={{ fontSize: 13, color: "var(--ink-muted)", margin: "0 0 10px", whiteSpace: "pre-wrap" }}>{sub.notes}</p>}
              {sub.feedback && (
                <div style={{ marginTop: 10, padding: "12px 14px", background: "#FFFDF5", borderRadius: 8, borderLeft: "3px solid var(--gold)" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--gold)", textTransform: "uppercase" }}>Client feedback</span>
                  <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{sub.feedback}</p>
                </div>
              )}
              {sub.status === "REJECTED" && (
                <div style={{ marginTop: 14 }}>
                  <Btn onClick={() => open(sub.projectId, sub.project.title, sub)}>Resubmit with changes</Btn>
                </div>
              )}
              {sub.status === "APPROVED" && <Notice kind="success">🎉 Approved. Your certificate is in the Certificates tab.</Notice>}
            </Card>
          ))}
        </div>
      )}

      {target && (
        <Modal title={target.existing ? "Resubmit deliverables" : "Submit deliverables"} subtitle={target.title} onClose={() => setTarget(null)}>
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Field label="Link to your work" required hint="A public repo, deployed site, shared document or folder. Make sure the client can open it.">
              <input id="sub-url" type="url" value={form.submissionUrl} onChange={e => setForm({ ...form, submissionUrl: e.target.value })} style={inputStyle()} placeholder="https://github.com/you/project" required autoFocus />
            </Field>
            <Field label="Notes for the reviewer">
              <textarea id="sub-notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={4} style={textareaStyle()} placeholder="How to run it, what you'd do next, anything the client should know." />
            </Field>
            {error && <Notice kind="error">{error}</Notice>}
            <div style={{ display: "flex", gap: 10 }}>
              <Btn type="button" variant="ghost" style={{ flex: 1 }} onClick={() => setTarget(null)}>Cancel</Btn>
              <Btn type="submit" variant="success" style={{ flex: 2 }} disabled={busy}>{busy ? "Submitting…" : "Submit for review"}</Btn>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
