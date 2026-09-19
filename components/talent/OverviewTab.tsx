"use client";

import Link from "next/link";
import { Banner, StatTiles } from "@/components/dashboard/DashboardShell";
import { Btn, Notice, StatusBadge, formatDate } from "@/components/dashboard/ui";
import type { DashboardResponse } from "@/lib/types";
import type { TalentTab } from "@/app/talent/dashboard/page";

export function profileCompletion(p: DashboardResponse["profile"]) {
  const items = [
    { label: "Email verified",         done: !!p.emailVerifiedAt },
    { label: "Identity verified",      done: p.verificationStatus === "VERIFIED" },
    { label: "University added",       done: !!p.universityName },
    { label: "Degree program added",   done: !!p.degreeProgram },
    { label: "Skills added",           done: p.skills.length > 0 },
    { label: "Portfolio link added",   done: !!p.portfolioUrl },
    { label: "Phone number added",     done: !!p.phone },
    { label: "Bio written",            done: !!p.bio },
  ];
  const pct = Math.round((items.filter(i => i.done).length / items.length) * 100);
  return { items, pct };
}

export function OverviewTab({ data, goTo }: { data: DashboardResponse; goTo: (t: TalentTab) => void }) {
  const { profile, projects, applications, submissions, certificates } = data;
  const { items, pct } = profileCompletion(profile);
  const selected = applications.filter(a => a.status === "SELECTED");
  const awaitingSubmission = selected.filter(a => !submissions.some(s => s.teamId === a.teamId && s.status !== "REJECTED"));

  const stages = [
    { icon: "🎯", title: "Join & explore",       desc: "Browse real projects posted by verified clients.",                     status: "done" },
    { icon: "📝", title: "Complete your profile", desc: "Skills, education and links make your applications stronger.",       status: pct >= 60 ? "done" : "active" },
    { icon: "📋", title: "Apply to a project",    desc: "Pitch yourself (or your team) to a project that fits your skills.", status: applications.length > 0 ? "done" : pct >= 60 ? "active" : "pending" },
    { icon: "🛠️", title: "Build & submit",       desc: "Once selected, do the work and submit the deliverables.",           status: submissions.length > 0 ? "done" : selected.length > 0 ? "active" : "pending" },
    { icon: "✅", title: "Client approval",       desc: "The client reviews your work and approves it.",                     status: submissions.some(s => s.status === "APPROVED") ? "done" : submissions.length > 0 ? "active" : "pending" },
    { icon: "🏅", title: "Earn your certificate", desc: "A verifiable certificate in your name, shareable anywhere.",       status: certificates.length > 0 ? "done" : "pending" },
  ];

  return (
    <div>
      <Banner
        eyebrow="Welcome back 👋"
        title={profile.name}
        subtitle="Real projects, real proof. Complete work for clients and earn certificates anyone can verify."
        actions={
          <>
            <Btn variant="gold" onClick={() => goTo("projects")}>Find a project</Btn>
            {awaitingSubmission.length > 0 && <Btn variant="ghost" style={{ color: "#fff", borderColor: "rgba(255,255,255,0.2)" }} onClick={() => goTo("submissions")}>Submit work ({awaitingSubmission.length})</Btn>}
          </>
        }
      />

      {profile.verificationStatus !== "VERIFIED" && (
        <Notice kind="warning">Identity verification opens in the next release. Certificates are issued in the name on your verified ID, so keep your profile name accurate.</Notice>
      )}
      <div style={{ height: 20 }} />

      <StatTiles tiles={[
        { label: "Open projects", value: projects.length,      icon: "🔎", color: "var(--navy)",    bg: "rgba(15,42,74,0.06)" },
        { label: "Applications",  value: applications.length,  icon: "📋", color: "#3182CE",        bg: "rgba(49,130,206,0.08)" },
        { label: "Selected",      value: selected.length,      icon: "✅", color: "#97640E",        bg: "rgba(236,201,75,0.12)" },
        { label: "Certificates",  value: certificates.length,  icon: "🏅", color: "var(--success)", bg: "rgba(56,161,105,0.08)" },
      ]} />

      {awaitingSubmission.length > 0 && (
        <div style={{ background: "rgba(56,161,105,0.06)", border: "1px solid rgba(56,161,105,0.3)", borderRadius: 12, padding: 20, marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h4 style={{ fontSize: 15, fontWeight: 700, color: "#276749", margin: "0 0 4px" }}>You were selected for {awaitingSubmission.length} project{awaitingSubmission.length > 1 ? "s" : ""} 🎉</h4>
            <p style={{ fontSize: 13, color: "#276749", margin: 0 }}>{awaitingSubmission.map(a => a.project.title).join(", ")}. Submit your deliverables before the deadline.</p>
          </div>
          <Btn variant="success" small onClick={() => goTo("submissions")}>Submit work →</Btn>
        </div>
      )}

      <div className="mobile-dashboard-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)", margin: "0 0 14px" }}>📊 Profile strength</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
            <div style={{ position: "relative", width: 64, height: 64, flexShrink: 0 }}>
              <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden="true">
                <circle cx="32" cy="32" r="28" fill="none" stroke="var(--border)" strokeWidth="6" />
                <circle cx="32" cy="32" r="28" fill="none" stroke={pct >= 75 ? "var(--success)" : "var(--gold)"} strokeWidth="6" strokeDasharray={`${(pct / 100) * 175.9} 175.9`} strokeLinecap="round" transform="rotate(-90 32 32)" />
              </svg>
              <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "var(--navy)" }}>{pct}%</span>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)" }}>{pct < 50 ? "Getting started" : pct < 75 ? "Good progress" : "Almost there"}</div>
              <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 2 }}>Clients see your profile when you apply.</div>
            </div>
          </div>
          <Btn style={{ width: "100%" }} onClick={() => goTo("profile")}>✏️ Complete profile</Btn>
        </div>
        <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)", margin: "0 0 12px" }}>✅ Checklist</h3>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 7 }}>
            {items.map(item => (
              <li key={item.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: item.done ? "var(--ink)" : "var(--ink-subtle)" }}>
                <span style={{ width: 18, height: 18, borderRadius: "50%", background: item.done ? "var(--success)" : "var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", flexShrink: 0 }}>{item.done ? "✓" : ""}</span>
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)", margin: "0 0 14px" }}>🗺️ Your pathway</h3>
      <div style={{ position: "relative", paddingLeft: 32, marginBottom: 24 }}>
        <div style={{ position: "absolute", left: 12, top: 20, bottom: 20, width: 2, background: "var(--border)" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {stages.map((s, i) => {
            const dot = s.status === "done" ? "var(--success)" : s.status === "active" ? "var(--gold)" : "var(--border)";
            return (
              <div key={i} style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: -26, top: 14, width: 16, height: 16, borderRadius: "50%", background: dot, border: "3px solid #fff", boxShadow: `0 0 0 2px ${dot}` }} />
                <div style={{ padding: "12px 16px", borderRadius: 12, border: `1px solid ${s.status === "done" ? "rgba(56,161,105,0.2)" : s.status === "active" ? "rgba(201,162,39,0.3)" : "var(--border)"}`, background: s.status === "done" ? "rgba(56,161,105,0.04)" : s.status === "active" ? "rgba(201,162,39,0.05)" : "#FAFAFA", display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)" }}>{s.icon} {s.title}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 2 }}>{s.desc}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 8, whiteSpace: "nowrap", background: s.status === "done" ? "rgba(56,161,105,0.12)" : s.status === "active" ? "rgba(201,162,39,0.15)" : "#EDF2F7", color: s.status === "done" ? "var(--success)" : s.status === "active" ? "#97640E" : "var(--ink-subtle)" }}>
                    {s.status === "done" ? "✓ Done" : s.status === "active" ? "⟳ In progress" : "○ Upcoming"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {certificates.length > 0 && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)", margin: 0 }}>🏅 Recent certificates</h3>
            <button onClick={() => goTo("certificates")} style={{ background: "none", border: "none", color: "var(--gold)", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>View all →</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {certificates.slice(0, 2).map(c => (
              <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "12px 16px", border: "1px solid rgba(201,162,39,0.3)", borderRadius: 10, background: "#FFFDF5", flexWrap: "wrap" }}>
                <div>
                  <Link href={`/certificates/${c.certId}`} style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)", textDecoration: "none" }}>{c.title}</Link>
                  <div style={{ fontSize: 12, color: "var(--ink-muted)" }}>{c.issuerName} · {formatDate(c.issuedAt)}</div>
                </div>
                <StatusBadge status={c.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
