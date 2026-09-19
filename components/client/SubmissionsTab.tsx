"use client";

import { useState } from "react";
import { Btn, Card, EmptyState, Modal, Notice, SectionHeader, StatusBadge, formatDate, textareaStyle } from "@/components/dashboard/ui";
import { api } from "@/components/dashboard/useDashboardData";
import type { SubmissionDto } from "@/lib/types";

export function SubmissionsTab({ submissions, onChanged }: { submissions: SubmissionDto[]; onChanged: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<SubmissionDto | null>(null);
  const [feedback, setFeedback] = useState("");
  const [issued, setIssued] = useState<number | null>(null);

  const pending = submissions.filter(s => s.status === "SUBMITTED");
  const done = submissions.filter(s => s.status !== "SUBMITTED");

  async function approve(sub: SubmissionDto) {
    const n = sub.team.members?.filter(m => m.status === "ACCEPTED").length ?? 1;
    if (!confirm(`Approve this submission and issue ${n} certificate${n !== 1 ? "s" : ""}? This cannot be undone.`)) return;
    setError(null); setBusyId(sub.id);
    const res = await api<{ certificatesIssued: number }>(`/api/submissions/${sub.id}`, "PATCH", { status: "APPROVED" });
    setBusyId(null);
    if (!res.ok) { setError(res.error ?? "Could not approve"); return; }
    setIssued(res.data?.certificatesIssued ?? 0);
    onChanged();
  }

  async function reject(e: React.FormEvent) {
    e.preventDefault();
    if (!rejecting) return;
    setError(null); setBusyId(rejecting.id);
    const res = await api(`/api/submissions/${rejecting.id}`, "PATCH", { status: "REJECTED", feedback });
    setBusyId(null);
    if (!res.ok) { setError(res.error ?? "Could not send feedback"); return; }
    setRejecting(null); setFeedback("");
    onChanged();
  }

  function SubmissionCard({ sub }: { sub: SubmissionDto }) {
    const busy = busyId === sub.id;
    return (
      <Card style={{ background: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--gold)", textTransform: "uppercase" }}>{sub.project.title}</span>
            <h4 style={{ fontSize: 17, fontWeight: 800, color: "var(--navy)", margin: "4px 0 2px" }}>{sub.team.name}</h4>
            <div style={{ fontSize: 12, color: "var(--ink-subtle)" }}>Submitted by {sub.submittedBy.name} · {formatDate(sub.createdAt)}</div>
          </div>
          <StatusBadge status={sub.status} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <span style={{ fontSize: 12, color: "var(--ink-subtle)" }}>🔗 Deliverable: </span>
          <a href={sub.submissionUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, fontWeight: 700, color: "var(--gold)", wordBreak: "break-all" }}>{sub.submissionUrl} ↗</a>
        </div>
        {sub.notes && <div style={{ padding: 12, background: "#FAFAFA", borderRadius: 8, fontSize: 13, color: "var(--ink-muted)", marginBottom: 14, whiteSpace: "pre-wrap" }}><strong>Notes from the team:</strong> {sub.notes}</div>}
        {sub.feedback && <div style={{ padding: 12, background: "#FFFDF5", borderLeft: "3px solid var(--gold)", borderRadius: 8, fontSize: 13, color: "var(--ink-muted)", marginBottom: 14, whiteSpace: "pre-wrap" }}><strong>Your feedback:</strong> {sub.feedback}</div>}
        {sub.status === "SUBMITTED" && (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Btn disabled={busy} onClick={() => approve(sub)}>✓ Approve &amp; issue certificates</Btn>
            <Btn variant="outline" disabled={busy} onClick={() => { setRejecting(sub); setFeedback(""); }}>Request changes</Btn>
          </div>
        )}
      </Card>
    );
  }

  return (
    <div>
      <SectionHeader icon="📤" title="Review submissions" subtitle="Approving issues a verifiable certificate to every accepted member of the team." />
      {error && <Notice kind="error">{error}</Notice>}
      {issued !== null && <Notice kind="success">Approved. {issued} certificate{issued !== 1 ? "s" : ""} issued and emailed to the team.</Notice>}

      {submissions.length === 0 ? (
        <EmptyState icon="📂" title="Nothing to review yet" hint="Once a selected team submits their deliverables, it shows up here." />
      ) : (
        <>
          {pending.length > 0 && (
            <>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--ink-subtle)", textTransform: "uppercase", letterSpacing: 1, margin: "16px 0 12px" }}>Waiting for review ({pending.length})</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>{pending.map(s => <SubmissionCard key={s.id} sub={s} />)}</div>
            </>
          )}
          {done.length > 0 && (
            <>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--ink-subtle)", textTransform: "uppercase", letterSpacing: 1, margin: "28px 0 12px" }}>Reviewed ({done.length})</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>{done.map(s => <SubmissionCard key={s.id} sub={s} />)}</div>
            </>
          )}
        </>
      )}

      {rejecting && (
        <Modal title="Request changes" subtitle={`Tell ${rejecting.team.name} what needs to change. They can resubmit before the deadline.`} onClose={() => setRejecting(null)}>
          <form onSubmit={reject}>
            <textarea id="reject-feedback" rows={5} style={textareaStyle()} value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Be specific: what is missing, what should be fixed, what would make it acceptable." required autoFocus />
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <Btn type="button" variant="ghost" style={{ flex: 1 }} onClick={() => setRejecting(null)}>Cancel</Btn>
              <Btn type="submit" variant="danger" style={{ flex: 2 }} disabled={busyId === rejecting.id}>Send feedback</Btn>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
