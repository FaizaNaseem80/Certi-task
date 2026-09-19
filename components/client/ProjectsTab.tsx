"use client";

import { useState } from "react";
import Link from "next/link";
import { Btn, Card, EmptyState, Notice, SectionHeader, SkillChips, StatusBadge, formatDate } from "@/components/dashboard/ui";
import { api } from "@/components/dashboard/useDashboardData";
import { PROJECT_CATEGORY_LABEL } from "@/lib/enums";
import type { ApplicationDto, ProjectDto } from "@/lib/types";
import type { ClientTab } from "@/app/client/dashboard/page";

export function ProjectsTab({ projects, applications, goTo, onChanged, verified }: { projects: ProjectDto[]; applications: ApplicationDto[]; goTo: (t: ClientTab) => void; onChanged: () => void; verified: boolean }) {
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function setStatus(id: string, status: "ACTIVE" | "PAUSED" | "CLOSED") {
    if (status === "CLOSED" && !confirm("Close this project? Talent will no longer be able to apply or submit.")) return;
    setError(null); setBusyId(id);
    const res = await api(`/api/projects/${id}`, "PATCH", { status });
    setBusyId(null);
    if (!res.ok) { setError(res.error ?? "Could not update project"); return; }
    onChanged();
  }

  return (
    <div>
      <SectionHeader icon="🚀" title="My projects" subtitle="Pause, resume or close listings and track who has applied." action={<Btn onClick={() => goTo("post-project")}>+ Post a project</Btn>} />
      {error && <Notice kind="error">{error}</Notice>}

      {projects.length === 0 ? (
        <EmptyState icon="📭" title="No projects yet" hint="Post your first project and talent can start applying." action={<Btn variant="gold" onClick={() => goTo("post-project")}>+ Post a project</Btn>} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {projects.map(p => {
            const apps = applications.filter(a => a.projectId === p.id);
            const busy = busyId === p.id;
            return (
              <Card key={p.id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
                  <div style={{ minWidth: 0 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "var(--gold)", textTransform: "uppercase" }}>{PROJECT_CATEGORY_LABEL[p.category]}</span>
                    <h4 style={{ fontSize: 17, fontWeight: 700, color: "var(--navy)", margin: "2px 0 6px" }}>
                      <Link href={`/projects/${p.id}`} style={{ color: "inherit", textDecoration: "none" }}>{p.title}</Link>
                    </h4>
                    <SkillChips skills={p.requiredSkills} />
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <StatusBadge status={p.status} />
                    {p.status === "DRAFT" && (verified
                      ? <Btn variant="gold" small disabled={busy} onClick={() => setStatus(p.id, "ACTIVE")}>Publish</Btn>
                      : <button onClick={() => goTo("verification")} style={{ fontSize: 12, fontWeight: 700, color: "#97640E", background: "rgba(236,201,75,0.18)", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer" }}>Verify to publish</button>)}
                    {p.status === "ACTIVE" && <Btn variant="ghost" small disabled={busy} onClick={() => setStatus(p.id, "PAUSED")}>Pause</Btn>}
                    {p.status === "PAUSED" && <Btn variant="ghost" small disabled={busy} onClick={() => setStatus(p.id, "ACTIVE")}>Resume</Btn>}
                    {(p.status === "ACTIVE" || p.status === "PAUSED") && <Btn variant="outline" small disabled={busy} onClick={() => setStatus(p.id, "CLOSED")}>Close</Btn>}
                  </div>
                </div>
                <p style={{ fontSize: 14, color: "var(--ink-muted)", margin: "0 0 14px", lineHeight: 1.6 }}>{p.description}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, borderTop: "1px solid var(--border)", paddingTop: 12, fontSize: 12, color: "var(--ink-subtle)", flexWrap: "wrap" }}>
                  <span>📅 Deadline <strong>{formatDate(p.deadline)}</strong> · Team size <strong>{p.teamCap}</strong> · Posted {formatDate(p.createdAt)}</span>
                  <button onClick={() => goTo("applications")} style={{ background: "none", border: "none", color: "var(--navy)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                    Applications ({apps.length}) →
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
