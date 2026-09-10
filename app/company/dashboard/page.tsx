"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

/* ── Types ── */
interface Project {
  id: string;
  title: string;
  description: string;
  requiredSkills: string;
  deliverables: string;
  deadline: string;
  teamCap: number;
  status: string;
  createdAt: string;
}

interface Application {
  id: string;
  teamName: string;
  members: string;
  pitch: string;
  status: string;
  projectId: string;
  project: { title: string };
  createdAt: string;
}

interface Submission {
  id: string;
  teamName: string;
  submissionUrl: string;
  notes: string;
  feedback: string;
  status: string;
  projectId: string;
  project: { title: string };
  createdAt: string;
}

interface Certificate {
  id: string;
  certId: string;
  title: string;
  studentName: string;
  studentEmail: string;
  issueDate: string;
  expiryDate: string;
  status: string;
}

interface CompanyProfile {
  name: string;
  email: string;
  domain?: string;
  isVerified?: boolean;
  bio?: string;
  website?: string;
  industry?: string;
  companySize?: string;
  location?: string;
  phone?: string;
  linkedinUrl?: string;
  foundedYear?: string | number;
  companyDescription?: string;
  companyWebsite?: string;
  logoUrl?: string;
}

type TabId = "overview" | "post-project" | "projects" | "applications" | "submissions" | "certificates" | "profile" | "billing";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "overview",     label: "Overview",             icon: "🏢" },
  { id: "post-project", label: "Post New Project",     icon: "➕" },
  { id: "projects",     label: "My Projects",          icon: "🚀" },
  { id: "applications", label: "Student Applications", icon: "📋" },
  { id: "submissions",  label: "Review Submissions",   icon: "📤" },
  { id: "certificates", label: "Issued Credentials",   icon: "🏅" },
  { id: "profile",      label: "Edit Profile",         icon: "✏️" },
  { id: "billing",      label: "Sponsorship & Badges", icon: "💳" },
];

/* ── Status Badge ── */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    Pending:          { bg: "#EDF2F7",                    color: "#4A5568" },
    Shortlisted:      { bg: "rgba(49,130,206,0.12)",      color: "#2B6CB0" },
    Selected:         { bg: "rgba(56,161,105,0.12)",      color: "#276749" },
    Rejected:         { bg: "rgba(229,62,62,0.12)",       color: "#9B2C2C" },
    Submitted:        { bg: "rgba(49,130,206,0.12)",      color: "#2B6CB0" },
    Approved:         { bg: "rgba(56,161,105,0.12)",      color: "#276749" },
    CompanyApproved:  { bg: "rgba(236,201,75,0.18)",      color: "#97640E" },
    StudentConfirmed: { bg: "rgba(56,161,105,0.12)",      color: "#276749" },
    Verified:         { bg: "rgba(56,161,105,0.12)",      color: "#276749" },
    Active:           { bg: "rgba(56,161,105,0.12)",      color: "#276749" },
    Paused:           { bg: "rgba(236,201,75,0.18)",      color: "#97640E" },
    Closed:           { bg: "#EDF2F7",                    color: "#4A5568" },
  };
  const style = map[status] ?? { bg: "#EDF2F7", color: "#4A5568" };
  return (
    <span style={{
      display: "inline-block",
      padding: "3px 10px",
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 700,
      background: style.bg,
      color: style.color,
    }}>
      {status}
    </span>
  );
}

/* ══════════════════════════════════════════════════════════
   Main Component
══════════════════════════════════════════════════════════ */
export default function CompanyDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  /* data states */
  const [profile, setProfile]             = useState<CompanyProfile | null>(null);
  const [projects, setProjects]           = useState<Project[]>([]);
  const [applications, setApplications]   = useState<Application[]>([]);
  const [submissions, setSubmissions]     = useState<Submission[]>([]);
  const [certificates, setCertificates]   = useState<Certificate[]>([]);

  /* UI states */
  const [loading, setLoading]             = useState(true);
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg]     = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  /* post project form */
  const [projForm, setProjForm] = useState({
    title: "",
    description: "",
    requiredSkills: "",
    deliverables: "",
    deadline: "",
    teamCap: 20,
  });
  const [projPosting, setProjPosting] = useState(false);
  const [projSuccess, setProjSuccess] = useState(false);

  /* profile form */
  const [pf, setPf] = useState({
    name: "", bio: "", website: "", industry: "", companySize: "",
    location: "", phone: "", domain: "", linkedinUrl: "",
    foundedYear: "", companyDescription: "", companyWebsite: "", logoUrl: "",
  });
  const [pfSaving, setPfSaving] = useState(false);
  const [pfSaved, setPfSaved]   = useState(false);
  const [pfError, setPfError]   = useState("");

  /* ════════════════ Fetch Data ════════════════ */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard");
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          router.push("/auth/login");
        }
        return;
      }

      const p = data.profile || {};
      const meUser = data.user || {};
      const companyProf: CompanyProfile = {
        name: meUser.name || "Company Sponsor",
        email: meUser.email || "",
        domain: p.domain || meUser.email?.split("@")[1] || "company.com",
        isVerified: true,
        bio: p.bio || "",
        website: p.website || "",
        industry: p.industry || "",
        companySize: p.companySize || "",
        location: p.location || "",
        phone: p.phone || "",
        linkedinUrl: p.linkedinUrl || "",
        foundedYear: p.foundedYear ? String(p.foundedYear) : "",
        companyDescription: p.companyDescription || "",
        companyWebsite: p.companyWebsite || "",
        logoUrl: p.logoUrl || "",
      };
      setProfile(companyProf);

      setPf({
        name: companyProf.name,
        bio: companyProf.bio || "",
        website: companyProf.website || "",
        industry: companyProf.industry || "",
        companySize: companyProf.companySize || "",
        location: companyProf.location || "",
        phone: companyProf.phone || "",
        domain: companyProf.domain || "",
        linkedinUrl: companyProf.linkedinUrl || "",
        foundedYear: companyProf.foundedYear ? String(companyProf.foundedYear) : "",
        companyDescription: companyProf.companyDescription || "",
        companyWebsite: companyProf.companyWebsite || "",
        logoUrl: companyProf.logoUrl || "",
      });

      if (data.projects) setProjects(data.projects);
      if (data.applications) setApplications(data.applications);
      if (data.submissions) setSubmissions(data.submissions);
      if (data.certificates) setCertificates(data.certificates);
    } catch (e) {
      console.error("Company dashboard fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ════════════════ Handlers ════════════════ */
  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.replace("/auth/login");
  }

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();
    setProjPosting(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projForm),
      });
      if (res.ok) {
        setProjSuccess(true);
        setProjForm({ title: "", description: "", requiredSkills: "", deliverables: "", deadline: "", teamCap: 20 });
        setTimeout(() => setProjSuccess(false), 3000);
        fetchData();
        setActiveTab("projects");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProjPosting(false);
    }
  }

  async function handleToggleProjectStatus(projId: string, currentStatus: string) {
    const nextStatus = currentStatus === "Active" ? "Paused" : "Active";
    try {
      const res = await fetch(`/api/projects/${projId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) fetchData();
    } catch (e) { console.error(e); }
  }

  async function handleUpdateAppStatus(appId: string, status: string) {
    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) fetchData();
    } catch (e) { console.error(e); }
  }

  async function handleApproveSubmission(subId: string) {
    try {
      const res = await fetch(`/api/submissions/${subId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CompanyApproved" }),
      });
      if (res.ok) fetchData();
    } catch (e) { console.error(e); }
  }

  async function handleRejectSubmission(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSubId) return;
    try {
      const res = await fetch(`/api/submissions/${selectedSubId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Rejected", feedback: feedbackMsg }),
      });
      if (res.ok) {
        setShowRejectModal(false);
        setFeedbackMsg("");
        setSelectedSubId(null);
        fetchData();
      }
    } catch (e) { console.error(e); }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setPfSaving(true); setPfSaved(false); setPfError("");
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...pf,
          foundedYear: pf.foundedYear ? parseInt(pf.foundedYear) : undefined,
        }),
      });
      if (res.ok) {
        setPfSaved(true);
        setTimeout(() => setPfSaved(false), 3000);
        fetchData();
      } else {
        const d = await res.json();
        setPfError(d.error || "Failed to save profile");
      }
    } catch {
      setPfError("Network error. Failed to save profile.");
    } finally {
      setPfSaving(false);
    }
  }

  /* ════════════════ Derived ════════════════ */
  const pendingSubmissions = submissions.filter(s => s.status === "Submitted");
  const compName = profile?.name || "Company Sponsor";
  const compDomain = profile?.domain || "enterprise.com";

  /* ════════════════ Loading ════════════════ */
  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--paper)" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", border: "4px solid var(--border)", borderTopColor: "var(--navy)", animation: "spin-slow 0.8s linear infinite", margin: "0 auto 16px" }} />
        <p style={{ color: "var(--ink-muted)", fontWeight: 600 }}>Loading company workspace…</p>
      </div>
    </div>
  );

  /* ════════════════ Styles ════════════════ */
  const inp = (err?: boolean): React.CSSProperties => ({
    width: "100%", padding: "10px 14px", border: `1.5px solid ${err ? "#E53E3E" : "var(--border)"}`,
    borderRadius: 8, fontSize: 14, outline: "none", background: "var(--paper)", color: "var(--ink)",
    transition: "border-color 0.2s",
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)", fontFamily: "var(--font-geist-sans)" }}>

      {/* ── TOP HEADER ── */}
      <header style={{ background: "linear-gradient(135deg, #0A1D33 0%, #0F2A4A 60%, #1a3a5c 100%)", color: "#fff", padding: "0 24px", boxShadow: "0 2px 12px rgba(10,29,51,0.25)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link href="/" style={{ textDecoration: "none" }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: -0.5 }}>
                Certi<span style={{ color: "var(--gold)" }}>Task</span>
              </span>
            </Link>
            <span style={{ width: 1, height: 20, background: "rgba(255,255,255,0.2)" }} />
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>Employer Workspace</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: "var(--navy)", flexShrink: 0 }}>
              {compName.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={() => setActiveTab("post-project")}
              style={{ marginLeft: 8, padding: "6px 14px", background: "var(--gold)", color: "var(--navy)", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
            >
              + Post Project
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              style={{ padding: "6px 14px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
            >
              Edit Profile
            </button>
            <button
              onClick={handleSignOut}
              style={{ padding: "6px 14px", background: "transparent", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* ── BODY LAYOUT ── */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 20px", display: "grid", gridTemplateColumns: "230px 1fr", gap: 24 }}>

        {/* ── SIDEBAR ── */}
        <aside style={{ position: "sticky", top: 24, height: "fit-content" }}>
          <nav style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
            {/* Company mini card */}
            <div style={{ padding: "20px 16px", borderBottom: "1px solid var(--border)", background: "linear-gradient(135deg, #F8FAFC 0%, #EDF2F7 100%)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: "var(--navy)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color: "var(--gold)", flexShrink: 0 }}>
                  {compName.charAt(0).toUpperCase()}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{compName}</div>
                  <div style={{ fontSize: 11, color: "var(--ink-subtle)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{compDomain}</div>
                </div>
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(56,161,105,0.12)", color: "#276749", padding: "3px 8px", borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
                ✓ Verified Corporate Sponsor
              </div>
            </div>

            {/* Nav items */}
            <div style={{ padding: "8px 0" }}>
              {TABS.map(tab => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 10,
                      padding: "10px 16px", border: "none", borderRadius: 0,
                      background: isActive ? "rgba(15,42,74,0.06)" : "transparent",
                      color: isActive ? "var(--navy)" : "var(--ink-muted)",
                      fontSize: 13, fontWeight: isActive ? 700 : 500, cursor: "pointer",
                      transition: "all 0.15s",
                      borderLeft: isActive ? "3px solid var(--navy)" : "3px solid transparent",
                    }}
                  >
                    <span style={{ fontSize: 16 }}>{tab.icon}</span>
                    {tab.label}
                    {tab.id === "submissions" && pendingSubmissions.length > 0 && (
                      <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, background: "#E53E3E", color: "#fff", borderRadius: 10, padding: "1px 6px" }}>{pendingSubmissions.length}</span>
                    )}
                    {tab.id === "applications" && applications.length > 0 && (
                      <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, background: "var(--navy)", color: "#fff", borderRadius: 10, padding: "1px 6px" }}>{applications.length}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Activity summary sidebar card */}
          <div style={{ marginTop: 16, background: "#fff", border: "1px solid var(--border)", borderRadius: 12, padding: 16, boxShadow: "var(--shadow-sm)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-subtle)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Corporate Summary</div>
            {[
              { label: "Active Projects", value: projects.filter(p => p.status === "Active").length, color: "var(--navy)" },
              { label: "Applications",   value: applications.length,                                color: "#3182CE" },
              { label: "Review Queue",   value: pendingSubmissions.length,                          color: pendingSubmissions.length > 0 ? "#E53E3E" : "var(--ink-subtle)" },
              { label: "Certificates",   value: certificates.length,                                color: "var(--success)" },
            ].map(s => (
              <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: 12, color: "var(--ink-muted)" }}>{s.label}</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* ── MAIN PANEL ── */}
        <main style={{ minWidth: 0 }}>
          <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 16, padding: 28, boxShadow: "var(--shadow-sm)", minHeight: 450 }}>

            {/* ══════════ TAB 1: OVERVIEW ══════════ */}
            {activeTab === "overview" && (
              <div>
                {/* Banner */}
                <div style={{ background: "linear-gradient(135deg, #0A1D33 0%, #0F2A4A 100%)", borderRadius: 14, padding: "28px 32px", marginBottom: 24, position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: -30, right: -30, width: 160, height: 160, borderRadius: "50%", background: "rgba(201,162,39,0.08)" }} />
                  <div style={{ position: "relative", zIndex: 1 }}>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>Corporate Portal 👋</div>
                    <h1 style={{ fontSize: 26, fontWeight: 800, color: "#fff", margin: 0, letterSpacing: -0.5 }}>{compName}</h1>
                    <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, marginTop: 6, marginBottom: 0 }}>Manage real-world project tasks, review student work, and issue verified certificates.</p>
                    <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button onClick={() => setActiveTab("post-project")} style={{ padding: "8px 18px", background: "var(--gold)", color: "var(--navy)", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                        + Post New Project
                      </button>
                      <button onClick={() => setActiveTab("submissions")} style={{ padding: "8px 18px", background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                        📥 Review Submissions ({pendingSubmissions.length})
                      </button>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
                  {[
                    { label: "Active Projects",      value: projects.length,            icon: "🚀", color: "var(--navy)",    bg: "rgba(15,42,74,0.06)" },
                    { label: "Student Applications", value: applications.length,        icon: "📋", color: "#3182CE",         bg: "rgba(49,130,206,0.08)" },
                    { label: "Submissions Queue",    value: pendingSubmissions.length,  icon: "📤", color: "#E53E3E",         bg: "rgba(229,62,62,0.08)" },
                    { label: "Issued Credentials",   value: certificates.length,        icon: "🏅", color: "var(--success)", bg: "rgba(56,161,105,0.08)" },
                  ].map(s => (
                    <div key={s.label} style={{ background: s.bg, border: "1px solid var(--border)", borderRadius: 12, padding: "18px 16px", textAlign: "center" }}>
                      <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
                      <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
                      <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 2 }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Submissions Queue Alert */}
                {pendingSubmissions.length > 0 && (
                  <div style={{ background: "rgba(229,62,62,0.06)", border: "1px solid rgba(229,62,62,0.25)", borderRadius: 12, padding: 20, marginBottom: 24 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <h4 style={{ fontSize: 15, fontWeight: 700, color: "#9B2C2C", margin: "0 0 4px" }}>⚠️ Action Required ({pendingSubmissions.length} Submissions)</h4>
                        <p style={{ fontSize: 13, color: "#9B2C2C", margin: 0 }}>Student teams have submitted completed deliverables for your review.</p>
                      </div>
                      <button onClick={() => setActiveTab("submissions")} style={{ padding: "8px 16px", background: "#9B2C2C", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                        Review Queue →
                      </button>
                    </div>
                  </div>
                )}

                {/* Projects overview */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)", margin: 0 }}>Recent Project Listings</h3>
                    <button onClick={() => setActiveTab("projects")} style={{ background: "none", border: "none", color: "var(--gold)", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>View All →</button>
                  </div>
                  {projects.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px 0", border: "1px dashed var(--border)", borderRadius: 12, color: "var(--ink-subtle)" }}>
                      <p style={{ margin: "0 0 10px", fontWeight: 600 }}>No projects posted yet.</p>
                      <button onClick={() => setActiveTab("post-project")} style={{ padding: "8px 18px", background: "var(--navy)", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                        + Post Your First Project
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {projects.slice(0, 3).map(proj => (
                        <div key={proj.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", border: "1px solid var(--border)", borderRadius: 10, background: "#FAFAFA" }}>
                          <div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)" }}>{proj.title}</div>
                            <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 2 }}>Deadline: {proj.deadline} · Skills: {proj.requiredSkills}</div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <StatusBadge status={proj.status} />
                            <button onClick={() => handleToggleProjectStatus(proj.id, proj.status)} style={{ padding: "4px 10px", background: "transparent", border: "1px solid var(--border)", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                              {proj.status === "Active" ? "Pause" : "Activate"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ══════════ TAB 2: POST PROJECT ══════════ */}
            {activeTab === "post-project" && (
              <div>
                <div style={{ marginBottom: 24 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--navy)", margin: "0 0 4px" }}>➕ Post New Real-World Project</h2>
                  <p style={{ color: "var(--ink-muted)", fontSize: 14, margin: 0 }}>Outline the project scope, required skills, and deliverables for student applicants.</p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>
                  <form onSubmit={handleCreateProject}>
                    <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 24, marginBottom: 20 }}>
                      <div style={{ marginBottom: 16 }}>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--navy)", marginBottom: 5 }}>Project Title *</label>
                        <input value={projForm.title} onChange={e => setProjForm({ ...projForm, title: e.target.value })} style={inp()} placeholder="e.g. Next.js E-Commerce Checkout Component" required />
                      </div>

                      <div style={{ marginBottom: 16 }}>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--navy)", marginBottom: 5 }}>Project Description *</label>
                        <textarea value={projForm.description} onChange={e => setProjForm({ ...projForm, description: e.target.value })} rows={4} style={{ ...inp(), resize: "vertical" as const, height: "auto" }} placeholder="Describe the feature scope, architectural requirements, and business context..." required />
                      </div>

                      <div style={{ marginBottom: 16 }}>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--navy)", marginBottom: 5 }}>Required Skills (comma separated) *</label>
                        <input value={projForm.requiredSkills} onChange={e => setProjForm({ ...projForm, requiredSkills: e.target.value })} style={inp()} placeholder="e.g. React, Next.js, Node.js, TypeScript" required />
                      </div>

                      <div style={{ marginBottom: 16 }}>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--navy)", marginBottom: 5 }}>Deliverables Specification *</label>
                        <textarea value={projForm.deliverables} onChange={e => setProjForm({ ...projForm, deliverables: e.target.value })} rows={3} style={{ ...inp(), resize: "vertical" as const, height: "auto" }} placeholder="e.g. GitHub Pull Request with 90% test coverage and live Vercel demo link..." required />
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        <div>
                          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--navy)", marginBottom: 5 }}>Deadline Date *</label>
                          <input type="date" value={projForm.deadline} onChange={e => setProjForm({ ...projForm, deadline: e.target.value })} style={inp()} required />
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--navy)", marginBottom: 5 }}>Team Capacity (Max Students)</label>
                          <input type="number" min="1" max="50" value={projForm.teamCap} onChange={e => setProjForm({ ...projForm, teamCap: parseInt(e.target.value) || 20 })} style={inp()} />
                        </div>
                      </div>
                    </div>

                    <button type="submit" disabled={projPosting} style={{ width: "100%", padding: "14px 0", background: projPosting ? "#A0AEC0" : "var(--navy)", color: "#fff", border: "none", borderRadius: 10, fontWeight: 800, fontSize: 15, cursor: projPosting ? "not-allowed" : "pointer" }}>
                      {projPosting ? "Posting Project..." : "🚀 Publish Project Listing"}
                    </button>

                    {projSuccess && (
                      <div style={{ marginTop: 14, padding: "12px 16px", background: "rgba(56,161,105,0.1)", border: "1px solid rgba(56,161,105,0.3)", borderRadius: 10, color: "#276749", fontWeight: 600, textAlign: "center" }}>
                        ✓ Project created and published successfully!
                      </div>
                    )}
                  </form>

                  {/* Student View Live Preview */}
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-subtle)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Student Card Preview</div>
                    <div style={{ border: "1px solid var(--gold)", borderRadius: 14, padding: 20, background: "#FFFDF5", boxShadow: "var(--shadow-md)" }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "var(--gold)", background: "rgba(201,162,39,0.15)", padding: "2px 6px", borderRadius: 4, textTransform: "uppercase" }}>Corporate Project</span>
                      <h4 style={{ fontSize: 16, fontWeight: 800, color: "var(--navy)", margin: "8px 0 4px" }}>{projForm.title || "Project Title Placeholder"}</h4>
                      <div style={{ fontSize: 12, color: "var(--gold)", fontWeight: 600, marginBottom: 10 }}>{compName}</div>
                      <p style={{ fontSize: 13, color: "var(--ink-muted)", margin: "0 0 12px", lineHeight: 1.5 }}>{projForm.description || "Project description preview will appear here as you type..."}</p>
                      <div style={{ fontSize: 11, color: "var(--navy)", fontWeight: 600, marginBottom: 12 }}>Skills: {projForm.requiredSkills || "React, TypeScript..."}</div>
                      <div style={{ fontSize: 11, color: "var(--ink-subtle)" }}>Deadline: {projForm.deadline || "YYYY-MM-DD"}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════ TAB 3: MY PROJECTS ══════════ */}
            {activeTab === "projects" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                  <div>
                    <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--navy)", margin: "0 0 4px" }}>🚀 My Corporate Projects</h2>
                    <p style={{ color: "var(--ink-muted)", fontSize: 14, margin: 0 }}>Manage status, edit specifications, and track student enrollment.</p>
                  </div>
                  <button onClick={() => setActiveTab("post-project")} style={{ padding: "9px 18px", background: "var(--navy)", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                    + Post New Project
                  </button>
                </div>

                {projects.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "60px 0", color: "var(--ink-subtle)" }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>No active project listings</div>
                    <button onClick={() => setActiveTab("post-project")} style={{ marginTop: 12, padding: "9px 20px", background: "var(--gold)", color: "var(--navy)", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                      + Create First Project
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {projects.map(proj => {
                      const projApps = applications.filter(a => a.projectId === proj.id);
                      return (
                        <div key={proj.id} style={{ border: "1px solid var(--border)", borderRadius: 14, padding: 22, background: "#FAFAFA" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                            <div>
                              <h4 style={{ fontSize: 17, fontWeight: 700, color: "var(--navy)", margin: "0 0 4px" }}>{proj.title}</h4>
                              <div style={{ fontSize: 13, color: "var(--ink-muted)" }}>Required Skills: <strong>{proj.requiredSkills}</strong></div>
                            </div>
                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                              <StatusBadge status={proj.status} />
                              <button onClick={() => handleToggleProjectStatus(proj.id, proj.status)} style={{ padding: "5px 12px", background: "#fff", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                                {proj.status === "Active" ? "Pause Listing" : "Reactivate"}
                              </button>
                            </div>
                          </div>
                          <p style={{ fontSize: 14, color: "var(--ink-muted)", margin: "0 0 14px", lineHeight: 1.6 }}>{proj.description}</p>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: 12, fontSize: 12, color: "var(--ink-subtle)" }}>
                            <span>📅 Deadline: <strong>{proj.deadline}</strong> · Team Cap: <strong>{proj.teamCap}</strong></span>
                            <button onClick={() => setActiveTab("applications")} style={{ background: "none", border: "none", color: "var(--navy)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                              View Applications ({projApps.length}) →
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ══════════ TAB 4: STUDENT APPLICATIONS ══════════ */}
            {activeTab === "applications" && (
              <div>
                <div style={{ marginBottom: 24 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--navy)", margin: "0 0 4px" }}>📋 Student Team Applications</h2>
                  <p style={{ color: "var(--ink-muted)", fontSize: 14, margin: 0 }}>Review team pitches and select qualified student groups for your projects.</p>
                </div>

                {applications.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "60px 0", color: "var(--ink-subtle)" }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>📬</div>
                    <div style={{ fontWeight: 600 }}>No student applications received yet.</div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {applications.map(app => (
                      <div key={app.id} style={{ border: "1px solid var(--border)", borderRadius: 14, padding: 22 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                          <div>
                            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--gold)", textTransform: "uppercase" }}>Project: {app.project.title}</span>
                            <h4 style={{ fontSize: 18, fontWeight: 800, color: "var(--navy)", margin: "4px 0 2px" }}>Team: {app.teamName}</h4>
                            <div style={{ fontSize: 13, color: "var(--ink-muted)" }}>Members: {app.members}</div>
                          </div>
                          <StatusBadge status={app.status} />
                        </div>

                        <div style={{ padding: 14, background: "#F8FAFC", borderRadius: 10, borderLeft: "3px solid var(--navy)", marginBottom: 16 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-subtle)", textTransform: "uppercase" }}>Application Pitch</div>
                          <p style={{ fontSize: 13, color: "var(--ink)", margin: "4px 0 0", lineHeight: 1.5 }}>{app.pitch}</p>
                        </div>

                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => handleUpdateAppStatus(app.id, "Selected")} style={{ padding: "8px 16px", background: "var(--success)", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                            ✓ Select Team
                          </button>
                          <button onClick={() => handleUpdateAppStatus(app.id, "Shortlisted")} style={{ padding: "8px 16px", background: "#3182CE", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                            Shortlist
                          </button>
                          <button onClick={() => handleUpdateAppStatus(app.id, "Rejected")} style={{ padding: "8px 16px", background: "#transparent", border: "1px solid var(--border)", color: "#9B2C2C", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ══════════ TAB 5: SUBMISSIONS REVIEW ══════════ */}
            {activeTab === "submissions" && (
              <div>
                <div style={{ marginBottom: 24 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--navy)", margin: "0 0 4px" }}>📤 Review Deliverable Submissions</h2>
                  <p style={{ color: "var(--ink-muted)", fontSize: 14, margin: 0 }}>Inspect completed student code and issue verified certificates.</p>
                </div>

                {submissions.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "60px 0", color: "var(--ink-subtle)" }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>📂</div>
                    <div style={{ fontWeight: 600 }}>No deliverable submissions yet.</div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {submissions.map(sub => (
                      <div key={sub.id} style={{ border: "1px solid var(--border)", borderRadius: 14, padding: 22 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                          <div>
                            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--gold)", textTransform: "uppercase" }}>{sub.project.title}</span>
                            <h4 style={{ fontSize: 17, fontWeight: 800, color: "var(--navy)", margin: "4px 0 2px" }}>Team: {sub.teamName}</h4>
                          </div>
                          <StatusBadge status={sub.status} />
                        </div>

                        <div style={{ marginBottom: 14 }}>
                          <span style={{ fontSize: 12, color: "var(--ink-subtle)" }}>🔗 Deliverable URL: </span>
                          <a href={sub.submissionUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, fontWeight: 700, color: "var(--gold)", wordBreak: "break-all" }}>
                            {sub.submissionUrl} ↗
                          </a>
                        </div>

                        {sub.notes && (
                          <div style={{ padding: 12, background: "#FAFAFA", borderRadius: 8, fontSize: 13, color: "var(--ink-muted)", marginBottom: 16 }}>
                            <strong>Student Notes:</strong> {sub.notes}
                          </div>
                        )}

                        {sub.feedback && (
                          <div style={{ padding: 12, background: "#FFFDF5", borderLeft: "3px solid var(--gold)", borderRadius: 8, fontSize: 13, color: "var(--ink-muted)", marginBottom: 16 }}>
                            <strong>Reviewer Feedback:</strong> {sub.feedback}
                          </div>
                        )}

                        <div style={{ display: "flex", gap: 10 }}>
                          <button onClick={() => handleApproveSubmission(sub.id)} style={{ padding: "9px 20px", background: "var(--navy)", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                            ✓ Approve & Issue Certificate
                          </button>
                          <button onClick={() => { setSelectedSubId(sub.id); setShowRejectModal(true); }} style={{ padding: "9px 20px", background: "transparent", border: "1px solid var(--border)", color: "#9B2C2C", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                            Request Changes / Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ══════════ TAB 6: ISSUED CERTIFICATES ══════════ */}
            {activeTab === "certificates" && (
              <div>
                <div style={{ marginBottom: 24 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--navy)", margin: "0 0 4px" }}>🏅 Issued Corporate Certificates</h2>
                  <p style={{ color: "var(--ink-muted)", fontSize: 14, margin: 0 }}>Verified accreditation credentials issued by your company.</p>
                </div>

                {certificates.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "60px 0", color: "var(--ink-subtle)" }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>🎓</div>
                    <div style={{ fontWeight: 600 }}>No certificates issued yet.</div>
                    <div style={{ fontSize: 13, marginTop: 4 }}>Approve student submissions to generate credentials automatically.</div>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
                    {certificates.map(cert => (
                      <div key={cert.id} style={{ border: "1px solid rgba(201,162,39,0.25)", borderRadius: 14, padding: 22, background: "linear-gradient(135deg, #FFFDF5 0%, #FFFBEB 100%)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                          <span style={{ fontSize: 32 }}>🏅</span>
                          <StatusBadge status={cert.status} />
                        </div>
                        <h4 style={{ fontSize: 16, fontWeight: 800, color: "var(--navy)", margin: "0 0 6px" }}>{cert.title}</h4>
                        <div style={{ fontSize: 13, color: "var(--ink-muted)", marginBottom: 12 }}>Recipient: <strong>{cert.studentName}</strong> ({cert.studentEmail})</div>
                        <div style={{ borderTop: "1px dashed rgba(201,162,39,0.3)", paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 11, fontFamily: "monospace", color: "var(--ink-subtle)" }}>{cert.certId}</span>
                          <div style={{ display: "flex", gap: 6 }}>
                            <Link href={`/certificates/${cert.id}`} style={{ fontSize: 11, fontWeight: 700, color: "var(--navy)", textDecoration: "none", padding: "4px 10px", border: "1px solid var(--navy)", borderRadius: 6 }}>View</Link>
                            <a href={`/api/certificates/${cert.id}/pdf`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, fontWeight: 700, color: "#fff", background: "var(--navy)", textDecoration: "none", padding: "4px 10px", borderRadius: 6 }}>PDF</a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ══════════ TAB 7: EDIT PROFILE ══════════ */}
            {activeTab === "profile" && (
              <div>
                <div style={{ marginBottom: 24 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--navy)", margin: "0 0 4px" }}>✏️ Edit Company Profile</h2>
                  <p style={{ color: "var(--ink-muted)", fontSize: 14, margin: 0 }}>Update corporate details, branding, industry tags, and contact information.</p>
                </div>

                <form onSubmit={handleSaveProfile}>
                  <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 24, marginBottom: 20 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)", margin: "0 0 18px", paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>🏢 Basic Company Information</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <div>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--navy)", marginBottom: 5 }}>Company Name *</label>
                        <input value={pf.name} onChange={e => setPf(p => ({ ...p, name: e.target.value }))} style={inp()} required />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--navy)", marginBottom: 5 }}>Industry *</label>
                        <select value={pf.industry} onChange={e => setPf(p => ({ ...p, industry: e.target.value }))} style={{ ...inp(), background: "#fff" }}>
                          <option value="">Select industry</option>
                          <option value="Technology">Technology</option>
                          <option value="Finance">Finance</option>
                          <option value="Healthcare">Healthcare</option>
                          <option value="Education">Education</option>
                          <option value="Retail">Retail</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--navy)", marginBottom: 5 }}>Company Size</label>
                        <select value={pf.companySize} onChange={e => setPf(p => ({ ...p, companySize: e.target.value }))} style={{ ...inp(), background: "#fff" }}>
                          <option value="">Select size</option>
                          <option value="1-50">1-50 employees</option>
                          <option value="51-200">51-200 employees</option>
                          <option value="201-1000">201-1000 employees</option>
                          <option value="1001+">1001+ employees</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--navy)", marginBottom: 5 }}>Founded Year</label>
                        <input type="number" min="1800" max={new Date().getFullYear()} value={pf.foundedYear} onChange={e => setPf(p => ({ ...p, foundedYear: e.target.value }))} style={inp()} placeholder="e.g. 2020" />
                      </div>
                    </div>
                  </div>

                  <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 24, marginBottom: 20 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)", margin: "0 0 18px", paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>🌐 Location & Contact Links</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <div>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--navy)", marginBottom: 5 }}>Location</label>
                        <input value={pf.location} onChange={e => setPf(p => ({ ...p, location: e.target.value }))} style={inp()} placeholder="City, Country" />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--navy)", marginBottom: 5 }}>Phone Number</label>
                        <input value={pf.phone} onChange={e => setPf(p => ({ ...p, phone: e.target.value }))} style={inp()} placeholder="+1 (555) 000-0000" />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--navy)", marginBottom: 5 }}>Website URL</label>
                        <input type="url" value={pf.website} onChange={e => setPf(p => ({ ...p, website: e.target.value }))} style={inp()} placeholder="https://example.com" />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--navy)", marginBottom: 5 }}>LinkedIn URL</label>
                        <input type="url" value={pf.linkedinUrl} onChange={e => setPf(p => ({ ...p, linkedinUrl: e.target.value }))} style={inp()} placeholder="https://linkedin.com/company/..." />
                      </div>
                    </div>
                  </div>

                  <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 24, marginBottom: 20 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)", margin: "0 0 18px", paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>📝 Company Description & Bio</h3>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--navy)", marginBottom: 5 }}>Short Tagline / Bio</label>
                      <textarea value={pf.bio} onChange={e => setPf(p => ({ ...p, bio: e.target.value }))} rows={2} style={{ ...inp(), resize: "vertical" as const, height: "auto" }} placeholder="Short tagline about your company..." />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--navy)", marginBottom: 5 }}>Full Company Description</label>
                      <textarea value={pf.companyDescription} onChange={e => setPf(p => ({ ...p, companyDescription: e.target.value }))} rows={4} style={{ ...inp(), resize: "vertical" as const, height: "auto" }} placeholder="Describe your corporate mission, engineering culture, and internship opportunities..." />
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 12 }}>
                    <button type="submit" disabled={pfSaving} style={{ padding: "12px 32px", background: pfSaving ? "#A0AEC0" : "var(--navy)", color: "#fff", border: "none", borderRadius: 10, fontWeight: 800, fontSize: 15, cursor: pfSaving ? "not-allowed" : "pointer" }}>
                      {pfSaving ? "Saving..." : "Save Company Profile"}
                    </button>
                  </div>

                  {pfSaved && (
                    <div style={{ marginTop: 14, padding: "12px 16px", background: "rgba(56,161,105,0.08)", border: "1px solid rgba(56,161,105,0.25)", borderRadius: 10, color: "#276749", fontWeight: 600 }}>
                      ✓ Profile saved successfully!
                    </div>
                  )}
                  {pfError && (
                    <div style={{ marginTop: 14, padding: "12px 16px", background: "rgba(229,62,62,0.08)", border: "1px solid rgba(229,62,62,0.25)", borderRadius: 10, color: "#9B2C2C", fontWeight: 600 }}>
                      ⚠ {pfError}
                    </div>
                  )}
                </form>
              </div>
            )}

            {/* ══════════ TAB 8: BILLING & SPONSORSHIP ══════════ */}
            {activeTab === "billing" && (
              <div>
                <div style={{ marginBottom: 24 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--navy)", margin: "0 0 4px" }}>💳 Corporate Sponsorship & Accreditation Badge</h2>
                  <p style={{ color: "var(--ink-muted)", fontSize: 14, margin: 0 }}>Manage your corporate sponsorship tier and certificate verification seal.</p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
                  <div style={{ border: "2px solid var(--gold)", borderRadius: 14, padding: 24, background: "linear-gradient(135deg, #FFFDF5 0%, #FFFBEB 100%)" }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: "var(--gold)", background: "rgba(201,162,39,0.15)", padding: "3px 8px", borderRadius: 4, textTransform: "uppercase" }}>Active Tier</span>
                    <h3 style={{ fontSize: 24, fontWeight: 800, color: "var(--navy)", margin: "10px 0 4px" }}>Verified Corporate Partner</h3>
                    <p style={{ fontSize: 13, color: "var(--ink-muted)", margin: "0 0 16px" }}>Unlimited project postings, student applications, and verified certificate generation.</p>
                    <ul style={{ padding: 0, margin: "0 0 20px", listStyle: "none", fontSize: 13, color: "var(--navy)", display: "flex", flexDirection: "column", gap: 6 }}>
                      <li>✓ Unlimited live project listings</li>
                      <li>✓ Priority student applicant access</li>
                      <li>✓ Publicly verifiable digital certificates</li>
                      <li>✓ Direct PDF certificate downloads</li>
                    </ul>
                    <div style={{ fontSize: 12, color: "#276749", fontWeight: 700 }}>Status: ACTIVE (Sponsored Ecosystem)</div>
                  </div>

                  <div style={{ border: "1px solid var(--border)", borderRadius: 14, padding: 24, background: "#FAFAFA" }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)", margin: "0 0 8px" }}>🔐 Cryptographic Seal</h3>
                    <p style={{ fontSize: 13, color: "var(--ink-muted)", margin: "0 0 14px", lineHeight: 1.5 }}>CertiTask signs all issued certificates using Neon PostgreSQL digital hashes. Recruiters can verify credentials at <code>/verify</code>.</p>
                    <div style={{ padding: 12, background: "var(--navy)", color: "var(--gold)", borderRadius: 8, fontFamily: "monospace", fontSize: 12 }}>
                      STATUS: VERIFIED CORPORATE SPONSOR<br />
                      DOMAIN: {compDomain}<br />
                      ISSUANCE: UNLIMITED
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* ── Modal: Reject / Request Changes ── */}
      {showRejectModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(10,29,51,0.6)", backdropFilter: "blur(4px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 32, maxWidth: 480, width: "100%", boxShadow: "var(--shadow-lg)" }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: "var(--navy)", margin: "0 0 4px" }}>Request Changes / Reject</h3>
            <p style={{ color: "var(--ink-muted)", fontSize: 13, margin: "0 0 20px" }}>Provide detailed feedback to the student team explaining why deliverables require revision.</p>
            <form onSubmit={handleRejectSubmission}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--navy)", marginBottom: 5 }}>Feedback Remarks *</label>
                <textarea rows={4} style={{ ...inp(), resize: "vertical" as const, height: "auto" }} value={feedbackMsg} onChange={e => setFeedbackMsg(e.target.value)} placeholder="Explain required fixes, code quality improvements, or missing deliverables..." required />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" onClick={() => setShowRejectModal(false)} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" style={{ flex: 2, padding: "12px 0", background: "#9B2C2C", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Send Feedback</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
