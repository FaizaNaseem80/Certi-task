"use client";

import { useState } from "react";
import { Btn, Card, EmptyState, Notice, SectionHeader, StatusBadge, formatDate } from "@/components/dashboard/ui";
import { api } from "@/components/dashboard/useDashboardData";
import type { ApplicationDto } from "@/lib/types";
import type { TalentTab } from "@/app/talent/dashboard/page";

export function ApplicationsTab({ applications, onChanged, goTo }: { applications: ApplicationDto[]; onChanged: () => void; goTo: (t: TalentTab) => void }) {
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function withdraw(id: string) {
    if (!confirm("Withdraw this application? Your team\u2019s roster unfreezes and you can apply again while the project is open.")) return;
    setError(null); setBusyId(id);
    const res = await api(`/api/applications/${id}`, "PATCH", { status: "WITHDRAWN" });
    setBusyId(null);
    if (!res.ok) { setError(res.error ?? "Could not withdraw"); return; }
    onChanged();
  }

  return (
    <div>
      <SectionHeader icon="📋" title="My applications" subtitle="Where each application stands. You'll be able to submit work once a client selects you." />
      {error && <Notice kind="error">{error}</Notice>}
      {applications.length === 0 ? (
        <EmptyState icon="📬" title="No applications yet" hint="Find a project that fits your skills and send a pitch." action={<Btn onClick={() => goTo("projects")}>Browse projects →</Btn>} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {applications.map(app => (
            <Card key={app.id} style={{ background: "#fff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
                <div>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)", margin: "0 0 4px" }}>{app.project.title}</h4>
                  <div style={{ fontSize: 12, color: "var(--ink-muted)" }}>{app.project.client?.name} · Team &ldquo;{app.team.name}&rdquo; · Applied {formatDate(app.createdAt)}</div>
                </div>
                <StatusBadge status={app.status} />
              </div>
              <p style={{ fontSize: 13, color: "var(--ink-muted)", margin: "0 0 12px", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{app.pitch}</p>
              {app.status === "SELECTED" && (
                <Notice kind="success">🎉 You were selected. <button onClick={() => goTo("submissions")} style={{ background: "none", border: "none", color: "#276749", fontWeight: 800, textDecoration: "underline", cursor: "pointer", padding: 0 }}>Submit your deliverables</button> before the deadline.</Notice>
              )}
              {(app.status === "PENDING" || app.status === "SHORTLISTED") && (
                <Btn variant="outline" small disabled={busyId === app.id} onClick={() => withdraw(app.id)}>Withdraw</Btn>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
