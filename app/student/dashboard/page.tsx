"use client";

import { useState, useEffect, useCallback } from "react";
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
  company: { name: string; domain: string; logoUrl: string };
}
interface Application {
  id: string;
  teamName: string;
  members: string;
  pitch: string;
  status: string;
  projectId: string;
  project: { title: string; company: { name: string } };
}
interface Submission {
  id: string;
  teamName: string;
  submissionUrl: string;
  notes: string;
  feedback: string;
  status: string;
  project: { title: string; company: { name: string } };
}
interface Certificate {
  id: string;
  certId: string;
  title: string;
  issueDate: string;
  expiryDate: string;
  status: string;
  company: { name: string };
}
interface ProfileData {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  bio?: string;
  dateOfBirth?: string;
  gender?: string;
  universityName?: string;
  degreeProgram?: string;
  currentSemester?: string;
  gpa?: number | null;
  skillsArray?: string;
  portfolioUrl?: string;
  resumeUrl?: string;
  cnicNumber?: string;
  cnicVerified?: boolean;
}

type TabId = "overview" | "projects" | "applications" | "submissions" | "certificates" | "editprofile" | "pathway";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "overview",      label: "Overview",            icon: "🏠" },
  { id: "projects",      label: "Live Projects",       icon: "🚀" },
  { id: "applications",  label: "My Applications",     icon: "📋" },
  { id: "submissions",   label: "My Submissions",      icon: "📤" },
  { id: "certificates",  label: "Certificates",        icon: "🏅" },
  { id: "editprofile",   label: "Edit Profile",        icon: "✏️" },
  { id: "pathway",       label: "My Pathway",          icon: "🗺️" },
];

/* ── Status badge helper ── */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    Pending:          { bg: "#EDF2F7",                    color: "#4A5568" },
    Shortlisted:      { bg: "rgba(49,130,206,0.12)",      color: "#2B6CB0" },
    Selected:         { bg: "rgba(56,161,105,0.12)",      color: "#276749" },
    Rejected:         { bg: "rgba(229,62,62,0.12)",       color: "#9B2C2C" },
    Submitted:        { bg: "rgba(49,130,206,0.12)",      color: "#2B6CB0" },
    Approved:         { bg: "rgba(56,161,105,0.12)",      color: "#276749" },
    CompanyApproved:  { bg: "rgba(236,201,75,0.15)",      color: "#97640E" },
    StudentConfirmed: { bg: "rgba(56,161,105,0.12)",      color: "#276749" },
    Verified:         { bg: "rgba(56,161,105,0.12)",      color: "#276749" },
    Revoked:          { bg: "rgba(229,62,62,0.12)",       color: "#9B2C2C" },
    Active:           { bg: "rgba(56,161,105,0.12)",      color: "#276749" },
    Paused:           { bg: "rgba(236,201,75,0.15)",      color: "#97640E" },
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
export default function StudentDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  /* data */
  const [userName, setUserName]   = useState("Learner");
  const [userEmail, setUserEmail] = useState("");
  const [profile, setProfile]     = useState<ProfileData>({});
  const [projects, setProjects]           = useState<Project[]>([]);
  const [applications, setApplications]   = useState<Application[]>([]);
  const [submissions, setSubmissions]     = useState<Submission[]>([]);
  const [certificates, setCertificates]   = useState<Certificate[]>([]);

  /* ui */
  const [loading, setLoading]             = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showApplyModal, setShowApplyModal]   = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  /* forms */
  const [applyForm, setApplyForm] = useState({ teamName: "", members: "", pitch: "" });
  const [submitForm, setSubmitForm] = useState({ projectId: "", teamName: "", submissionUrl: "", notes: "" });

  /* ── edit-profile form state ── */
  const [pf, setPf] = useState({
    name: "", phone: "", location: "", bio: "",
    dateOfBirth: "", gender: "",
    universityName: "", degreeProgram: "", currentSemester: "", gpa: "",
    skillsArray: "", portfolioUrl: "", resumeUrl: "", cnicNumber: "",
  });
  const [pfSaving, setPfSaving]   = useState(false);
  const [pfSaved, setPfSaved]     = useState(false);
  const [pfError, setPfError]     = useState("");
  const [pfErrors, setPfErrors]   = useState<Record<string, string>>({});

  /* ════════════════ Data Fetching ════════════════ */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [meR, profR, projR, appR, subR, certR] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/auth/profile"),
        fetch("/api/projects"),
        fetch("/api/applications"),
        fetch("/api/submissions"),
        fetch("/api/certificates"),
      ]);

      const meD   = await meR.json();
      const profD = await profR.json();
      const projD = await projR.json();
      const appD  = await appR.json();
      const subD  = await subR.json();
      const certD = await certR.json();

      if (!meR.ok) { router.push("/auth/login"); return; }

      if (meD.user) {
        setUserName(meD.user.name);
        setUserEmail(meD.user.email);
      }
      if (profD.user) {
        const u = profD.user as ProfileData;
        setProfile(u);
        setPf({
          name:            u.name            ?? "",
          phone:           u.phone           ?? "",
          location:        u.location        ?? "",
          bio:             u.bio             ?? "",
          dateOfBirth:     u.dateOfBirth     ?? "",
          gender:          u.gender          ?? "",
          universityName:  u.universityName  ?? "",
          degreeProgram:   u.degreeProgram   ?? "",
          currentSemester: u.currentSemester ?? "",
          gpa:             u.gpa != null ? String(u.gpa) : "",
          skillsArray:     u.skillsArray     ?? "",
          portfolioUrl:    u.portfolioUrl    ?? "",
          resumeUrl:       u.resumeUrl       ?? "",
          cnicNumber:      u.cnicNumber      ?? "",
        });
      }
      if (projD.projects) setProjects(projD.projects);
      if (appD.applications)  setApplications(appD.applications);
      if (subD.submissions)   setSubmissions(subD.submissions);
      if (certD.certificates) setCertificates(certD.certificates);
    } catch (e) {
      console.error("Dashboard fetch error:", e);
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

  function handleEditProfileBtn() { setActiveTab("editprofile"); }

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProject) return;
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: selectedProject.id, ...applyForm }),
      });
      if (res.ok) {
        setShowApplyModal(false);
        setApplyForm({ teamName: "", members: "", pitch: "" });
        fetchData();
      }
    } catch (e) { console.error(e); }
  }

  async function handleSubmitDeliverables(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitForm),
      });
      if (res.ok) {
        setShowSubmitModal(false);
        setSubmitForm({ projectId: "", teamName: "", submissionUrl: "", notes: "" });
        fetchData();
      }
    } catch (e) { console.error(e); }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setPfError(""); setPfSaved(false);
    const errs: Record<string, string> = {};
    if (!pf.name.trim()) errs.name = "Full name is required";
    if (pf.cnicNumber) {
      const digits = pf.cnicNumber.replace(/\D/g, "");
      if (!/^\d{5}-\d{7}-\d$/.test(pf.cnicNumber) && digits.length !== 13)
        errs.cnicNumber = "Enter 13-digit CNIC (e.g., 12345-1234567-1)";
    }
    if (Object.keys(errs).length) { setPfErrors(errs); return; }
    setPfErrors({});
    setPfSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: pf.name, phone: pf.phone, location: pf.location, bio: pf.bio,
        dateOfBirth: pf.dateOfBirth, gender: pf.gender,
        universityName: pf.universityName, degreeProgram: pf.degreeProgram,
        currentSemester: pf.currentSemester,
        skillsArray: pf.skillsArray,
        portfolioUrl: pf.portfolioUrl, resumeUrl: pf.resumeUrl,
      };
      if (pf.gpa) payload.gpa = parseFloat(pf.gpa);
      if (pf.cnicNumber && !profile.cnicVerified) payload.cnicNumber = pf.cnicNumber;

      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setPfSaved(true);
        setTimeout(() => setPfSaved(false), 3500);
        fetchData();
      } else {
        const d = await res.json();
        setPfError(d.error ?? "Failed to save profile");
      }
    } catch { setPfError("Network error. Please try again."); }
    finally { setPfSaving(false); }
  }

  /* ════════════════ Derived ════════════════ */
  const cnicVerified = !!profile.cnicVerified;
  const profileScore = [
    !!userEmail,
    cnicVerified,
    !!profile.universityName,
    !!profile.degreeProgram,
    !!profile.skillsArray,
    !!profile.portfolioUrl,
    !!profile.phone,
    !!profile.bio,
  ].filter(Boolean).length;
  const profilePct = Math.round((profileScore / 8) * 100);

  /* ════════════════ Loading ════════════════ */
  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--paper)" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", border: "4px solid var(--border)", borderTopColor: "var(--navy)", animation: "spin-slow 0.8s linear infinite", margin: "0 auto 16px" }} />
        <p style={{ color: "var(--ink-muted)", fontWeight: 600 }}>Loading your dashboard…</p>
      </div>
    </div>
  );

  /* ════════════════ Styles ════════════════ */
  const inp = (err?: boolean): React.CSSProperties => ({
    width: "100%", padding: "10px 14px", border: `1.5px solid ${err ? "#E53E3E" : "var(--border)"}`,
    borderRadius: 8, fontSize: 14, outline: "none", background: "var(--paper)", color: "var(--ink)",
    transition: "border-color 0.2s",
  });

  /* ════════════════ Render ════════════════ */
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
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>Student Portal</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Avatar */}
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "var(--navy)", flexShrink: 0 }}>
              {userName.charAt(0).toUpperCase()}
            </div>
            <div style={{ display: "none", flexDirection: "column" }} className="sm-show">
              <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", lineHeight: 1 }}>{userName}</span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.4 }}>Student</span>
            </div>
            <button
              onClick={handleEditProfileBtn}
              style={{ marginLeft: 8, padding: "6px 14px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
            >
              Edit Profile
            </button>
            <button
              onClick={handleSignOut}
              style={{ padding: "6px 14px", background: "transparent", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* ── BODY LAYOUT ── */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 20px", display: "grid", gridTemplateColumns: "220px 1fr", gap: 24 }}>

        {/* ── SIDEBAR ── */}
        <aside style={{ position: "sticky", top: 24, height: "fit-content" }}>
          <nav style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
            {/* Profile mini card */}
            <div style={{ padding: "20px 16px", borderBottom: "1px solid var(--border)", background: "linear-gradient(135deg, #F8FAFC 0%, #EDF2F7 100%)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--navy)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: "var(--gold)", flexShrink: 0 }}>
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userName}</div>
                  <div style={{ fontSize: 11, color: "var(--ink-subtle)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userEmail}</div>
                </div>
              </div>
              {/* Profile completion bar */}
              <div style={{ fontSize: 11, color: "var(--ink-muted)", marginBottom: 4, display: "flex", justifyContent: "space-between" }}>
                <span>Profile Complete</span><span style={{ fontWeight: 700, color: profilePct >= 75 ? "var(--success)" : "var(--gold)" }}>{profilePct}%</span>
              </div>
              <div style={{ height: 5, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${profilePct}%`, background: profilePct >= 75 ? "var(--success)" : "var(--gold)", borderRadius: 3, transition: "width 0.6s" }} />
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
                    {tab.id === "applications" && applications.length > 0 && (
                      <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, background: "var(--navy)", color: "#fff", borderRadius: 10, padding: "1px 6px" }}>{applications.length}</span>
                    )}
                    {tab.id === "certificates" && certificates.length > 0 && (
                      <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, background: "var(--success)", color: "#fff", borderRadius: 10, padding: "1px 6px" }}>{certificates.length}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Quick stats sidebar card */}
          <div style={{ marginTop: 16, background: "#fff", border: "1px solid var(--border)", borderRadius: 12, padding: 16, boxShadow: "var(--shadow-sm)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-subtle)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Quick Stats</div>
            {[
              { label: "Applications", value: applications.length, color: "var(--navy)" },
              { label: "Submissions",  value: submissions.length,  color: "#3182CE" },
              { label: "Certificates", value: certificates.length, color: "var(--success)" },
            ].map(s => (
              <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: 12, color: "var(--ink-muted)" }}>{s.label}</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 7 }}>
              <span style={{ fontSize: 12, color: "var(--ink-muted)" }}>CNIC Status</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: cnicVerified ? "var(--success)" : "#E53E3E", background: cnicVerified ? "rgba(56,161,105,0.1)" : "rgba(229,62,62,0.1)", padding: "2px 8px", borderRadius: 8 }}>
                {cnicVerified ? "✓ Verified" : "✗ Pending"}
              </span>
            </div>
          </div>
        </aside>

        {/* ── MAIN PANEL ── */}
        <main style={{ minWidth: 0 }}>
          <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 16, padding: 28, boxShadow: "var(--shadow-sm)", minHeight: 400 }}>

            {/* ══════════ TAB: OVERVIEW ══════════ */}
            {activeTab === "overview" && (
              <div>
                {/* Greeting banner */}
                <div style={{ background: "linear-gradient(135deg, #0A1D33 0%, #0F2A4A 100%)", borderRadius: 14, padding: "28px 32px", marginBottom: 24, position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: -30, right: -30, width: 160, height: 160, borderRadius: "50%", background: "rgba(201,162,39,0.08)" }} />
                  <div style={{ position: "absolute", bottom: -20, right: 60, width: 100, height: 100, borderRadius: "50%", background: "rgba(201,162,39,0.05)" }} />
                  <div style={{ position: "relative", zIndex: 1 }}>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>Welcome back 👋</div>
                    <h1 style={{ fontSize: 26, fontWeight: 800, color: "#fff", margin: 0, letterSpacing: -0.5 }}>{userName}</h1>
                    <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, marginTop: 6, marginBottom: 0 }}>{userEmail} · Student Learner</p>
                    <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button onClick={() => setActiveTab("projects")} style={{ padding: "8px 18px", background: "var(--gold)", color: "var(--navy)", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                        🚀 Browse Projects
                      </button>
                      <button onClick={() => setActiveTab("editprofile")} style={{ padding: "8px 18px", background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                        ✏️ Complete Profile
                      </button>
                    </div>
                  </div>
                </div>

                {/* Stats grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
                  {[
                    { label: "Live Projects",  value: projects.length,      icon: "🚀", color: "var(--navy)",    bg: "rgba(15,42,74,0.06)" },
                    { label: "Applications",   value: applications.length,  icon: "📋", color: "#3182CE",         bg: "rgba(49,130,206,0.08)" },
                    { label: "Submissions",    value: submissions.length,   icon: "📤", color: "#D69E2E",         bg: "rgba(214,158,46,0.08)" },
                    { label: "Certificates",   value: certificates.length,  icon: "🏅", color: "var(--success)", bg: "rgba(56,161,105,0.08)" },
                  ].map(s => (
                    <div key={s.label} style={{ background: s.bg, border: "1px solid var(--border)", borderRadius: 12, padding: "18px 16px", textAlign: "center" }}>
                      <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
                      <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
                      <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 2 }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Profile completion + Checklist */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
                  <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)", marginBottom: 14, marginTop: 0 }}>📊 Profile Strength</h3>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
                      <div style={{ position: "relative", width: 64, height: 64, flexShrink: 0 }}>
                        <svg width="64" height="64" viewBox="0 0 64 64">
                          <circle cx="32" cy="32" r="28" fill="none" stroke="var(--border)" strokeWidth="6" />
                          <circle cx="32" cy="32" r="28" fill="none" stroke={profilePct >= 75 ? "var(--success)" : "var(--gold)"} strokeWidth="6"
                            strokeDasharray={`${(profilePct / 100) * 175.9} 175.9`} strokeLinecap="round"
                            transform="rotate(-90 32 32)" />
                        </svg>
                        <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "var(--navy)" }}>{profilePct}%</span>
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)" }}>{profilePct < 50 ? "Getting Started" : profilePct < 75 ? "Good Progress" : "Almost There!"}</div>
                        <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 2 }}>Complete your profile to stand out to employers</div>
                      </div>
                    </div>
                    <button onClick={() => setActiveTab("editprofile")} style={{ width: "100%", padding: "9px 0", background: "var(--navy)", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                      ✏️ Complete Profile
                    </button>
                  </div>

                  <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)", marginBottom: 12, marginTop: 0 }}>✅ Checklist</h3>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 7 }}>
                      {[
                        { label: "Email registered",       done: !!userEmail },
                        { label: "CNIC verified",          done: cnicVerified },
                        { label: "University added",       done: !!profile.universityName },
                        { label: "Degree program added",   done: !!profile.degreeProgram },
                        { label: "Skills added",           done: !!profile.skillsArray },
                        { label: "Portfolio URL added",    done: !!profile.portfolioUrl },
                        { label: "Phone number added",     done: !!profile.phone },
                        { label: "Bio / Experience added", done: !!profile.bio },
                      ].map(item => (
                        <li key={item.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: item.done ? "var(--ink)" : "var(--ink-subtle)" }}>
                          <span style={{ width: 18, height: 18, borderRadius: "50%", background: item.done ? "var(--success)" : "var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", flexShrink: 0 }}>
                            {item.done ? "✓" : ""}
                          </span>
                          {item.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Recent Certificates preview */}
                {certificates.length > 0 && (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)", margin: 0 }}>🏅 Recent Certificates</h3>
                      <button onClick={() => setActiveTab("certificates")} style={{ background: "none", border: "none", color: "var(--gold)", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>View All →</button>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {certificates.slice(0, 2).map(cert => (
                        <div key={cert.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", background: "#FFFDF5", border: "1px solid rgba(201,162,39,0.2)", borderRadius: 10 }}>
                          <span style={{ fontSize: 24 }}>🏅</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)" }}>{cert.title}</div>
                            <div style={{ fontSize: 12, color: "var(--ink-muted)" }}>Issued by {cert.company.name} · {cert.certId}</div>
                          </div>
                          <StatusBadge status={cert.status} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ══════════ TAB: PROJECTS ══════════ */}
            {activeTab === "projects" && (
              <div>
                <div style={{ marginBottom: 24 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--navy)", margin: "0 0 4px" }}>🚀 Live Projects</h2>
                  <p style={{ color: "var(--ink-muted)", fontSize: 14, margin: 0 }}>Apply to real-world projects from verified companies to earn certifications.</p>
                </div>

                {projects.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "60px 0", color: "var(--ink-subtle)" }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>No active projects right now</div>
                    <div style={{ fontSize: 13 }}>Check back soon — new projects are posted regularly.</div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {projects.map(proj => {
                      const alreadyApplied = applications.some(a => a.projectId === proj.id);
                      const isSelected     = applications.some(a => a.projectId === proj.id && a.status === "Selected");
                      const skills = proj.requiredSkills.split(",").map(s => s.trim()).filter(Boolean);
                      return (
                        <div key={proj.id} style={{ border: "1px solid var(--border)", borderRadius: 14, padding: 22, transition: "box-shadow 0.2s", background: "#FAFAFA" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                            <div>
                              <h4 style={{ fontSize: 17, fontWeight: 700, color: "var(--navy)", margin: "0 0 4px" }}>{proj.title}</h4>
                              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--gold)" }}>{proj.company.name}</span>
                                <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--border)" }} />
                                <StatusBadge status={proj.status} />
                              </div>
                            </div>
                            <span style={{ fontSize: 12, color: "var(--ink-subtle)", whiteSpace: "nowrap", marginLeft: 12 }}>📅 {proj.deadline}</span>
                          </div>
                          <p style={{ fontSize: 14, color: "var(--ink-muted)", margin: "0 0 12px", lineHeight: 1.6 }}>{proj.description}</p>
                          {skills.length > 0 && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                              {skills.map(sk => (
                                <span key={sk} style={{ fontSize: 11, fontWeight: 600, color: "var(--navy)", background: "rgba(15,42,74,0.07)", border: "1px solid rgba(15,42,74,0.12)", borderRadius: 6, padding: "3px 10px" }}>{sk}</span>
                              ))}
                            </div>
                          )}
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            {isSelected ? (
                              <button onClick={() => { setSubmitForm({ ...submitForm, projectId: proj.id }); setShowSubmitModal(true); }}
                                style={{ padding: "9px 18px", background: "var(--success)", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                                📤 Submit Deliverables
                              </button>
                            ) : alreadyApplied ? (
                              <button disabled style={{ padding: "9px 18px", background: "#EDF2F7", color: "var(--ink-subtle)", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "not-allowed" }}>
                                ✓ Application Pending
                              </button>
                            ) : (
                              <button onClick={() => { setSelectedProject(proj); setShowApplyModal(true); }}
                                style={{ padding: "9px 18px", background: "var(--navy)", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                                Apply as Team →
                              </button>
                            )}
                            <span style={{ fontSize: 12, color: "var(--ink-subtle)" }}>Team cap: {proj.teamCap}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ══════════ TAB: APPLICATIONS ══════════ */}
            {activeTab === "applications" && (
              <div>
                <div style={{ marginBottom: 24 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--navy)", margin: "0 0 4px" }}>📋 My Applications</h2>
                  <p style={{ color: "var(--ink-muted)", fontSize: 14, margin: 0 }}>Track the status of your team applications across all projects.</p>
                </div>

                {applications.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "60px 0", color: "var(--ink-subtle)" }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>📬</div>
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>No applications yet</div>
                    <div style={{ fontSize: 13, marginBottom: 16 }}>Browse live projects and submit your team application.</div>
                    <button onClick={() => setActiveTab("projects")} style={{ padding: "9px 22px", background: "var(--navy)", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                      Browse Projects →
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {applications.map(app => (
                      <div key={app.id} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                          <h4 style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)", margin: 0 }}>{app.project.title}</h4>
                          <StatusBadge status={app.status} />
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                          <div><span style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-subtle)", textTransform: "uppercase" }}>Team</span><p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--ink)" }}>{app.teamName}</p></div>
                          <div><span style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-subtle)", textTransform: "uppercase" }}>Company</span><p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--ink)" }}>{app.project.company.name}</p></div>
                          <div style={{ gridColumn: "1/-1" }}><span style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-subtle)", textTransform: "uppercase" }}>Members</span><p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--ink)" }}>{app.members}</p></div>
                        </div>
                        {app.pitch && (
                          <div style={{ marginTop: 10, padding: "10px 14px", background: "#F7FAFC", borderRadius: 8, borderLeft: "3px solid var(--border)" }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-subtle)", textTransform: "uppercase" }}>Pitch</span>
                            <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.5 }}>{app.pitch}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ══════════ TAB: SUBMISSIONS ══════════ */}
            {activeTab === "submissions" && (
              <div>
                <div style={{ marginBottom: 24 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--navy)", margin: "0 0 4px" }}>📤 My Submissions</h2>
                  <p style={{ color: "var(--ink-muted)", fontSize: 14, margin: 0 }}>Deliverables submitted for company review and supervisor feedback.</p>
                </div>

                {submissions.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "60px 0", color: "var(--ink-subtle)" }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>📂</div>
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>No submissions yet</div>
                    <div style={{ fontSize: 13 }}>Once your team application is selected, you can submit deliverables here.</div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {submissions.map(sub => (
                      <div key={sub.id} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                          <div>
                            <h4 style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)", margin: "0 0 4px" }}>{sub.project.title}</h4>
                            <span style={{ fontSize: 12, color: "var(--ink-muted)" }}>{sub.project.company.name}</span>
                          </div>
                          <StatusBadge status={sub.status} />
                        </div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
                          <span style={{ fontSize: 12, color: "var(--ink-subtle)" }}>🔗 Submission:</span>
                          <a href={sub.submissionUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "var(--gold)", fontWeight: 600, wordBreak: "break-all" }}>{sub.submissionUrl}</a>
                        </div>
                        {sub.feedback && (
                          <div style={{ marginTop: 10, padding: "12px 14px", background: "#FFFDF5", borderRadius: 8, borderLeft: "3px solid var(--gold)" }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--gold)", textTransform: "uppercase" }}>Reviewer Feedback</span>
                            <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.6 }}>{sub.feedback}</p>
                          </div>
                        )}
                        {sub.status === "CompanyApproved" && (
                          <div style={{ marginTop: 14, padding: 14, background: "rgba(236,201,75,0.08)", border: "1px solid rgba(236,201,75,0.3)", borderRadius: 10 }}>
                            <p style={{ margin: "0 0 10px", fontSize: 13, color: "#744210", fontWeight: 600 }}>
                              🎉 The company has approved your submission! Confirm to issue your certificate.
                            </p>
                            <button
                              onClick={async () => {
                                if (!confirm("Confirm acceptance and certificate issuance?")) return;
                                const res = await fetch(`/api/submissions/${sub.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "StudentConfirmed" }) });
                                if (res.ok) fetchData();
                              }}
                              style={{ padding: "9px 20px", background: "var(--gold)", color: "var(--navy)", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" }}
                            >
                              ✓ Confirm & Accept Certificate
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ══════════ TAB: CERTIFICATES ══════════ */}
            {activeTab === "certificates" && (
              <div>
                <div style={{ marginBottom: 24 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--navy)", margin: "0 0 4px" }}>🏅 Earned Certificates</h2>
                  <p style={{ color: "var(--ink-muted)", fontSize: 14, margin: 0 }}>Verified credentials issued under your name, publicly verifiable.</p>
                </div>

                {certificates.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "60px 0", color: "var(--ink-subtle)" }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>🎓</div>
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>No certificates yet</div>
                    <div style={{ fontSize: 13 }}>Complete a project submission to earn your first verified certificate.</div>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
                    {certificates.map(cert => (
                      <div key={cert.id} style={{ border: "1px solid rgba(201,162,39,0.25)", borderRadius: 14, padding: 22, background: "linear-gradient(135deg, #FFFDF5 0%, #FFFBEB 100%)", position: "relative", overflow: "hidden" }}>
                        <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: "rgba(201,162,39,0.07)" }} />
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                          <span style={{ fontSize: 32 }}>🏅</span>
                          <StatusBadge status={cert.status} />
                        </div>
                        <h4 style={{ fontSize: 16, fontWeight: 800, color: "var(--navy)", margin: "0 0 6px" }}>{cert.title}</h4>
                        <p style={{ fontSize: 13, color: "var(--ink-muted)", margin: "0 0 14px" }}>Issued by <strong>{cert.company.name}</strong></p>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
                          <div><div style={{ fontSize: 10, color: "var(--ink-subtle)", textTransform: "uppercase", fontWeight: 700 }}>Issue Date</div><div style={{ fontSize: 12, color: "var(--ink)", fontWeight: 600 }}>{cert.issueDate}</div></div>
                          <div><div style={{ fontSize: 10, color: "var(--ink-subtle)", textTransform: "uppercase", fontWeight: 700 }}>Expiry</div><div style={{ fontSize: 12, color: "var(--ink)", fontWeight: 600 }}>{cert.expiryDate}</div></div>
                        </div>
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

            {/* ══════════ TAB: EDIT PROFILE ══════════ */}
            {activeTab === "editprofile" && (
              <div>
                <div style={{ marginBottom: 24 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--navy)", margin: "0 0 4px" }}>✏️ Edit Profile</h2>
                  <p style={{ color: "var(--ink-muted)", fontSize: 14, margin: 0 }}>Keep your profile complete to stand out to employers and unlock all features.</p>
                </div>

                <form onSubmit={handleSaveProfile}>
                  {/* Personal Info */}
                  <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 24, marginBottom: 20 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)", margin: "0 0 18px", paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>👤 Personal Information</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <div>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--navy)", marginBottom: 5 }}>Full Name *</label>
                        <input value={pf.name} onChange={e => setPf(p => ({...p, name: e.target.value}))} style={inp(!!pfErrors.name)} placeholder="Your full name" />
                        {pfErrors.name && <p style={{ color: "#E53E3E", fontSize: 11, margin: "3px 0 0" }}>{pfErrors.name}</p>}
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--navy)", marginBottom: 5 }}>Email</label>
                        <input value={profile.email ?? userEmail} disabled style={{ ...inp(), background: "#F7F8FA", cursor: "not-allowed", color: "var(--ink-muted)" }} />
                        <p style={{ fontSize: 10, color: "var(--ink-subtle)", margin: "3px 0 0" }}>Email cannot be changed</p>
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--navy)", marginBottom: 5 }}>Phone Number</label>
                        <input value={pf.phone} onChange={e => setPf(p => ({...p, phone: e.target.value}))} style={inp()} placeholder="+92 300 1234567" />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--navy)", marginBottom: 5 }}>Location</label>
                        <input value={pf.location} onChange={e => setPf(p => ({...p, location: e.target.value}))} style={inp()} placeholder="City, Country" />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--navy)", marginBottom: 5 }}>Date of Birth</label>
                        <input type="date" value={pf.dateOfBirth} onChange={e => setPf(p => ({...p, dateOfBirth: e.target.value}))} style={inp()} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--navy)", marginBottom: 5 }}>Gender</label>
                        <select value={pf.gender} onChange={e => setPf(p => ({...p, gender: e.target.value}))} style={{ ...inp(), background: "#fff" }}>
                          <option value="">Select gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* CNIC */}
                  <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 24, marginBottom: 20 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)", margin: "0 0 14px", paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>🪪 CNIC Verification</h3>
                    {cnicVerified ? (
                      <div style={{ display: "flex", gap: 12, alignItems: "center", padding: 16, background: "rgba(56,161,105,0.07)", border: "1px solid rgba(56,161,105,0.2)", borderRadius: 10 }}>
                        <span style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--success)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 16, flexShrink: 0 }}>✓</span>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#276749" }}>CNIC Verified</div>
                          <div style={{ fontSize: 12, color: "#276749", marginTop: 2 }}>Your CNIC <strong>{pf.cnicNumber || profile.cnicNumber}</strong> is verified. Employers can see your verified status.</div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ padding: "10px 14px", background: "rgba(236,201,75,0.08)", border: "1px solid rgba(236,201,75,0.3)", borderRadius: 8, marginBottom: 14 }}>
                          <p style={{ margin: 0, fontSize: 13, color: "#744210", fontWeight: 600 }}>📋 CNIC verification builds trust with employers. Enter your 13-digit CNIC to get verified.</p>
                        </div>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--navy)", marginBottom: 5 }}>CNIC Number</label>
                        <input value={pf.cnicNumber} onChange={e => setPf(p => ({...p, cnicNumber: e.target.value}))} style={{ ...inp(!!pfErrors.cnicNumber), maxWidth: 300 }} placeholder="XXXXX-XXXXXXX-X" />
                        {pfErrors.cnicNumber && <p style={{ color: "#E53E3E", fontSize: 11, margin: "3px 0 0" }}>{pfErrors.cnicNumber}</p>}
                        <p style={{ fontSize: 11, color: "var(--ink-subtle)", marginTop: 4 }}>Format: XXXXX-XXXXXXX-X. Once submitted, CNIC cannot be changed.</p>
                      </div>
                    )}
                  </div>

                  {/* Education */}
                  <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 24, marginBottom: 20 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)", margin: "0 0 18px", paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>🎓 Education</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <div>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--navy)", marginBottom: 5 }}>University Name</label>
                        <input value={pf.universityName} onChange={e => setPf(p => ({...p, universityName: e.target.value}))} style={inp()} placeholder="e.g. University of Karachi" />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--navy)", marginBottom: 5 }}>Degree Program</label>
                        <input value={pf.degreeProgram} onChange={e => setPf(p => ({...p, degreeProgram: e.target.value}))} style={inp()} placeholder="e.g. BS Computer Science" />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--navy)", marginBottom: 5 }}>Current Semester</label>
                        <select value={pf.currentSemester} onChange={e => setPf(p => ({...p, currentSemester: e.target.value}))} style={{ ...inp(), background: "#fff" }}>
                          <option value="">Select semester</option>
                          {[1,2,3,4,5,6,7,8].map(s => (
                            <option key={s} value={String(s)}>{s}{s===1?"st":s===2?"nd":s===3?"rd":"th"} Semester</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--navy)", marginBottom: 5 }}>GPA / CGPA</label>
                        <input type="number" step="0.01" min="0" max="4" value={pf.gpa} onChange={e => setPf(p => ({...p, gpa: e.target.value}))} style={inp()} placeholder="e.g. 3.5" />
                      </div>
                    </div>
                  </div>

                  {/* Skills & Links */}
                  <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 24, marginBottom: 20 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)", margin: "0 0 18px", paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>💼 Skills, Experience & Links</h3>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--navy)", marginBottom: 5 }}>Skills (comma-separated)</label>
                      <textarea value={pf.skillsArray} onChange={e => setPf(p => ({...p, skillsArray: e.target.value}))} rows={2}
                        style={{ ...inp(), resize: "vertical" as const, height: "auto" }}
                        placeholder="e.g. React, Next.js, TypeScript, Python, Node.js" />
                      <p style={{ fontSize: 11, color: "var(--ink-subtle)", margin: "3px 0 0" }}>Separate each skill with a comma</p>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--navy)", marginBottom: 5 }}>Bio / Experience</label>
                      <textarea value={pf.bio} onChange={e => setPf(p => ({...p, bio: e.target.value}))} rows={4}
                        style={{ ...inp(), resize: "vertical" as const, height: "auto" }}
                        placeholder="Tell companies about yourself, your experience, and what you're looking for..." />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <div>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--navy)", marginBottom: 5 }}>Portfolio URL</label>
                        <input type="url" value={pf.portfolioUrl} onChange={e => setPf(p => ({...p, portfolioUrl: e.target.value}))} style={inp()} placeholder="https://yourportfolio.com" />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--navy)", marginBottom: 5 }}>Resume URL</label>
                        <input type="url" value={pf.resumeUrl} onChange={e => setPf(p => ({...p, resumeUrl: e.target.value}))} style={inp()} placeholder="https://drive.google.com/your-resume" />
                      </div>
                    </div>
                  </div>

                  {/* Save */}
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <button type="submit" disabled={pfSaving} style={{ padding: "12px 32px", background: pfSaving ? "#A0AEC0" : "var(--navy)", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: pfSaving ? "not-allowed" : "pointer", transition: "all 0.2s" }}>
                      {pfSaving ? "Saving…" : "Save Profile"}
                    </button>
                    <button type="button" onClick={() => setActiveTab("overview")} style={{ padding: "12px 24px", background: "transparent", border: "1px solid var(--border)", borderRadius: 10, color: "var(--ink-muted)", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                      Cancel
                    </button>
                  </div>

                  {pfSaved && (
                    <div style={{ marginTop: 14, padding: "12px 16px", background: "rgba(56,161,105,0.08)", border: "1px solid rgba(56,161,105,0.25)", borderRadius: 10, color: "#276749", fontWeight: 600, fontSize: 14 }}>
                      ✓ Profile saved successfully!
                    </div>
                  )}
                  {pfError && (
                    <div style={{ marginTop: 14, padding: "12px 16px", background: "rgba(229,62,62,0.08)", border: "1px solid rgba(229,62,62,0.25)", borderRadius: 10, color: "#9B2C2C", fontWeight: 600, fontSize: 14 }}>
                      ⚠ {pfError}
                    </div>
                  )}
                </form>
              </div>
            )}

            {/* ══════════ TAB: PATHWAY ══════════ */}
            {activeTab === "pathway" && (
              <div>
                <div style={{ marginBottom: 28 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--navy)", margin: "0 0 4px" }}>🗺️ My Pathway</h2>
                  <p style={{ color: "var(--ink-muted)", fontSize: 14, margin: 0 }}>Your accreditation journey — stages from onboarding to verified credentials.</p>
                </div>

                {/* Dynamic stages */}
                {(() => {
                  const stages = [
                    {
                      icon: "🎯",
                      title: "Stage 1 — Join & Explore",
                      desc: "Register on CertiTask and browse available real-world projects posted by verified companies.",
                      status: userEmail ? "done" : "pending",
                    },
                    {
                      icon: "📝",
                      title: "Stage 2 — Complete Your Profile",
                      desc: "Fill in your education, skills, and CNIC to unlock full platform access and employer visibility.",
                      status: profilePct >= 60 ? "done" : applications.length > 0 ? "active" : "pending",
                    },
                    {
                      icon: "📋",
                      title: "Stage 3 — Apply to a Project",
                      desc: "Submit a team application to a live project matching your skills and career goals.",
                      status: applications.length > 0 ? "done" : "pending",
                    },
                    {
                      icon: "🛠️",
                      title: "Stage 4 — Build & Submit",
                      desc: "Work with your team on the selected project and submit your deliverables for company review.",
                      status: submissions.length > 0 ? "done" : applications.some(a => a.status === "Selected") ? "active" : "pending",
                    },
                    {
                      icon: "✅",
                      title: "Stage 5 — Get Company Approval",
                      desc: "The sponsoring company reviews and approves your submission, triggering certificate issuance.",
                      status: submissions.some(s => ["CompanyApproved", "StudentConfirmed", "Approved"].includes(s.status)) ? "done" : submissions.length > 0 ? "active" : "pending",
                    },
                    {
                      icon: "🏅",
                      title: "Stage 6 — Earn Verified Certificate",
                      desc: "Receive your immutable, publicly-verifiable CertiTask credential listing your contributions.",
                      status: certificates.length > 0 ? "done" : "pending",
                    },
                  ];
                  return (
                    <div style={{ position: "relative", paddingLeft: 32 }}>
                      <div style={{ position: "absolute", left: 12, top: 20, bottom: 20, width: 2, background: "var(--border)" }} />
                      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                        {stages.map((stage, i) => {
                          const dotColor = stage.status === "done" ? "var(--success)" : stage.status === "active" ? "var(--gold)" : "var(--border)";
                          return (
                            <div key={i} style={{ position: "relative" }}>
                              <div style={{ position: "absolute", left: -26, top: 14, width: 16, height: 16, borderRadius: "50%", background: dotColor, border: "3px solid #fff", boxShadow: "0 0 0 2px " + dotColor }} />
                              <div style={{ padding: 18, borderRadius: 12, border: `1px solid ${stage.status === "done" ? "rgba(56,161,105,0.2)" : stage.status === "active" ? "rgba(201,162,39,0.3)" : "var(--border)"}`, background: stage.status === "done" ? "rgba(56,161,105,0.04)" : stage.status === "active" ? "rgba(201,162,39,0.05)" : "#FAFAFA" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                                  <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)", margin: 0 }}>{stage.icon} {stage.title}</h4>
                                  <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 8, background: stage.status === "done" ? "rgba(56,161,105,0.12)" : stage.status === "active" ? "rgba(201,162,39,0.15)" : "#EDF2F7", color: stage.status === "done" ? "var(--success)" : stage.status === "active" ? "#97640E" : "var(--ink-subtle)", whiteSpace: "nowrap", marginLeft: 12 }}>
                                    {stage.status === "done" ? "✓ Completed" : stage.status === "active" ? "⟳ In Progress" : "○ Upcoming"}
                                  </span>
                                </div>
                                <p style={{ fontSize: 13, color: "var(--ink-muted)", margin: 0, lineHeight: 1.6 }}>{stage.desc}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

          </div>
        </main>
      </div>

      {/* ══════════ MODAL: Apply ══════════ */}
      {showApplyModal && selectedProject && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(10,29,51,0.6)", backdropFilter: "blur(4px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 32, maxWidth: 500, width: "100%", boxShadow: "var(--shadow-lg)", animation: "scaleIn 0.2s ease" }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: "var(--navy)", margin: "0 0 4px" }}>Apply as Team</h3>
            <p style={{ color: "var(--ink-muted)", fontSize: 13, margin: "0 0 22px" }}>Applying to: <strong>{selectedProject.title}</strong></p>
            <form onSubmit={handleApply}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--navy)", marginBottom: 5 }}>Team Name *</label>
                <input className="form-input" placeholder="e.g. Apex Engineers" value={applyForm.teamName} onChange={e => setApplyForm({...applyForm, teamName: e.target.value})} required />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--navy)", marginBottom: 5 }}>Team Members (comma separated) *</label>
                <input className="form-input" placeholder="e.g. Alex R., Sarah J." value={applyForm.members} onChange={e => setApplyForm({...applyForm, members: e.target.value})} required />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--navy)", marginBottom: 5 }}>Application Pitch *</label>
                <textarea className="form-input" rows={3} style={{ height: "auto", padding: "10px 14px" }} placeholder="Why should we select your team?" value={applyForm.pitch} onChange={e => setApplyForm({...applyForm, pitch: e.target.value})} required />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" onClick={() => setShowApplyModal(false)} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" style={{ flex: 2, padding: "12px 0", background: "var(--navy)", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Submit Application</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════ MODAL: Submit Deliverables ══════════ */}
      {showSubmitModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(10,29,51,0.6)", backdropFilter: "blur(4px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 32, maxWidth: 500, width: "100%", boxShadow: "var(--shadow-lg)", animation: "scaleIn 0.2s ease" }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: "var(--navy)", margin: "0 0 4px" }}>Submit Deliverables</h3>
            <p style={{ color: "var(--ink-muted)", fontSize: 13, margin: "0 0 22px" }}>Post your completed files or repository URL for review.</p>
            <form onSubmit={handleSubmitDeliverables}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--navy)", marginBottom: 5 }}>Team Name *</label>
                <input className="form-input" placeholder="e.g. Apex Engineers" value={submitForm.teamName} onChange={e => setSubmitForm({...submitForm, teamName: e.target.value})} required />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--navy)", marginBottom: 5 }}>Submission Link *</label>
                <input type="url" className="form-input" placeholder="https://github.com/yourteam/project" value={submitForm.submissionUrl} onChange={e => setSubmitForm({...submitForm, submissionUrl: e.target.value})} required />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--navy)", marginBottom: 5 }}>Additional Notes</label>
                <textarea className="form-input" rows={3} style={{ height: "auto", padding: "10px 14px" }} placeholder="Setup instructions, remarks for the reviewer..." value={submitForm.notes} onChange={e => setSubmitForm({...submitForm, notes: e.target.value})} />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" onClick={() => setShowSubmitModal(false)} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" style={{ flex: 2, padding: "12px 0", background: "var(--success)", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Submit Deliverables</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
