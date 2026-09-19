"use client";

import Link from "next/link";
import { Banner, StatTiles } from "@/components/dashboard/DashboardShell";
import { Btn, Notice, StatusBadge, formatDate } from "@/components/dashboard/ui";
import type { DashboardResponse } from "@/lib/types";
import type { ClientTab } from "@/app/client/dashboard/page";

export function OverviewTab({ data, goTo }: { data: DashboardResponse; goTo: (t: ClientTab) => void; onChanged: () => void }) {
  const { profile, projects, applications, submissions, certificates } = data;
  const reviewQueue = submissions.filter(s => s.status === "SUBMITTED");
  const newApps = applications.filter(a => a.status === "PENDING");

  return (
    <div>
      <Banner
        eyebrow="Client workspace"
        title={profile.name}
        subtitle="Post real projects, review the work, and issue certificates that anyone can verify."
        actions={
          <>
            <Btn variant="gold" onClick={() => goTo("post-project")}>+ Post a project</Btn>
            <Btn variant="ghost" style={{ color: "#fff", borderColor: "rgba(255,255,255,0.2)" }} onClick={() => goTo("submissions")}>Review submissions ({reviewQueue.length})</Btn>
          </>
        }
      />

      {profile.verificationStatus !== "VERIFIED" && (
        <Notice kind="warning">
          {profile.verificationStatus === "PENDING_REVIEW"
            ? "Your verification is being reviewed. You can prepare projects as drafts meanwhile."
            : <>Your account is not verified yet, so new projects are saved as drafts. <button onClick={() => goTo("verification")} style={{ background: "none", border: "none", color: "#744210", fontWeight: 800, textDecoration: "underline", cursor: "pointer", padding: 0 }}>Complete verification</button> to publish them.</>}
        </Notice>
      )}

      <div style={{ height: 20 }} />

      <StatTiles tiles={[
        { label: "Active projects",  value: projects.filter(p => p.status === "ACTIVE").length, icon: "🚀", color: "var(--navy)", bg: "rgba(15,42,74,0.06)" },
        { label: "New applications", value: newApps.length,     icon: "📋", color: "#3182CE", bg: "rgba(49,130,206,0.08)" },
        { label: "Awaiting review",  value: reviewQueue.length, icon: "📤", color: "#E53E3E", bg: "rgba(229,62,62,0.08)" },
        { label: "Certificates issued", value: certificates.length, icon: "🏅", color: "var(--success)", bg: "rgba(56,161,105,0.08)" },
      ]} />

      {reviewQueue.length > 0 && (
        <div style={{ background: "rgba(229,62,62,0.06)", border: "1px solid rgba(229,62,62,0.25)", borderRadius: 12, padding: 20, marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h4 style={{ fontSize: 15, fontWeight: 700, color: "#9B2C2C", margin: "0 0 4px" }}>{reviewQueue.length} submission{reviewQueue.length > 1 ? "s" : ""} waiting for your review</h4>
            <p style={{ fontSize: 13, color: "#9B2C2C", margin: 0 }}>Approving issues certificates to every member of the team.</p>
          </div>
          <Btn variant="danger" small onClick={() => goTo("submissions")}>Open review queue →</Btn>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)", margin: 0 }}>Recent projects</h3>
        <button onClick={() => goTo("projects")} style={{ background: "none", border: "none", color: "var(--gold)", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>View all →</button>
      </div>
      {projects.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0", border: "1px dashed var(--border)", borderRadius: 12, color: "var(--ink-subtle)" }}>
          <p style={{ margin: "0 0 10px", fontWeight: 600 }}>You haven&apos;t posted a project yet.</p>
          <Btn onClick={() => goTo("post-project")}>+ Post your first project</Btn>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {projects.slice(0, 3).map(p => (
            <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "14px 18px", border: "1px solid var(--border)", borderRadius: 10, background: "#FAFAFA", flexWrap: "wrap" }}>
              <div style={{ minWidth: 0 }}>
                <Link href={`/projects/${p.id}`} style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)", textDecoration: "none" }}>{p.title}</Link>
                <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 2 }}>Deadline {formatDate(p.deadline)} · {p._count?.applications ?? 0} applications · {p._count?.submissions ?? 0} submissions</div>
              </div>
              <StatusBadge status={p.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
