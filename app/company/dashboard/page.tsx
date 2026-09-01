"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

export default function CompanyDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "post-project" | "applications" | "submissions" | "certificates" | "billing" | "profile">("overview");

  // User & DB states
  const [userProfile, setUserProfile] = useState<{ name: string; email: string; domain: string; isVerified: boolean; bio: string; website: string } | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  // Feedback/UI states
  const [loading, setLoading] = useState(true);
  const [showAdConfirmation, setShowAdConfirmation] = useState(false);
  const [adClickCount, setAdClickCount] = useState(0);

  // Forms states
  const [projectForm, setProjectForm] = useState({
    title: "",
    description: "",
    requiredSkills: "",
    deliverables: "",
    deadline: "",
    teamCap: 20,
  });

  const [profileForm, setProfileForm] = useState({
    name: "",
    bio: "",
    website: "",
  });

  const [feedbackText, setFeedbackText] = useState("");
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const userRes = await fetch("/api/auth/me");
      const userData = await userRes.json();
      if (userData.user) {
        setUserProfile({
          name: userData.user.name,
          email: userData.user.email,
          domain: userData.user.email.split("@")[1] || "company.com",
          isVerified: true, // FR-C1: Verified business domain
          bio: userData.user.bio || "Leading innovation and hiring top student developers.",
          website: userData.user.website || `https://www.${userData.user.email.split("@")[1] || "company.com"}`,
        });
        setProfileForm({
          name: userData.user.name,
          bio: userData.user.bio || "Leading innovation and hiring top student developers.",
          website: userData.user.website || `https://www.${userData.user.email.split("@")[1] || "company.com"}`,
        });
      }

      const projRes = await fetch("/api/projects");
      const projData = await projRes.json();
      if (projData.projects) setProjects(projData.projects);

      const appRes = await fetch("/api/applications");
      const appData = await appRes.json();
      if (appData.applications) setApplications(appData.applications);

      const subRes = await fetch("/api/submissions");
      const subData = await subRes.json();
      if (subData.submissions) setSubmissions(subData.submissions);

      const certRes = await fetch("/api/certificates");
      const certData = await certRes.json();
      if (certData.certificates) setCertificates(certData.certificates);

    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/auth/login";
  }

    // Save company profile edits
    async function handleSaveProfile(e?: React.FormEvent) {
      if (e) e.preventDefault();
      try {
        const res = await fetch('/api/auth/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profileForm),
        });
        if (res.ok) {
          // Refresh local state
          fetchData();
          alert('Profile updated');
          setActiveTab('profile');
        } else {
          console.error('Failed to save profile');
        }
      } catch (err) {
        console.error(err);
      }
    }

  // FR-C3: Post a Project (Free, Goes Live Immediately)
  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectForm),
      });

      if (res.ok) {
        setProjectForm({ title: "", description: "", requiredSkills: "", deliverables: "", deadline: "", teamCap: 20 });
        setShowAdConfirmation(true); // FR-C4: Render ads unit on post-project confirmation
        fetchData();
        setActiveTab("overview");
      }
    } catch (err) {
      console.error(err);
    }
  }

  // FR-C6: Manage Project Lifecycle
  async function handleUpdateProjectStatus(id: string, status: string) {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  }

  // FR-C6: Extend Deadline
  async function handleExtendDeadline(id: string, currentDeadline: string) {
    const newDeadline = prompt("Enter new deadline date (YYYY-MM-DD):", currentDeadline);
    if (!newDeadline) return;
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deadline: newDeadline }),
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  }

  // FR-C5: Review Applications (Select/Reject)
  async function handleApplicationStatus(id: string, status: string) {
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  }

  // FR-C8: Approve Submission (Company confirms deliverable)
  async function handleApproveSubmission(id: string) {
    if (!confirm("Are you sure you want to confirm this submission from the company's side? The certificate will be issued after the student also confirms.")) return;
    try {
      const res = await fetch(`/api/submissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CompanyApproved" }),
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  }

  // FR-C8: Reject Submission
  async function handleRejectSubmission(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSubmissionId) return;
    try {
      const res = await fetch(`/api/submissions/${selectedSubmissionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Rejected", feedback: feedbackText }),
      });
      if (res.ok) {
        setShowRejectModal(false);
        setFeedbackText("");
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  }

  // FR-C9: Revoke/Flag Certificate
  async function handleUpdateCertificate(id: string, status: string) {
    if (!confirm(`Are you sure you want to set certificate status to ${status}?`)) return;
    try {
      const res = await fetch(`/api/certificates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="dashboard-root" style={{ minHeight: "100vh", background: "var(--paper)", fontFamily: "Inter, sans-serif" }}>
      {/* ── Top Navigation Bar ───────────────────────────────── */}
      <header className="dashboard-topbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 28px", borderBottom: "1px solid var(--border)", background: "var(--surface)", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Image src="/app-icon-128.png" alt="CertiTask" width={32} height={32} />
          <span style={{ fontSize: 20, fontWeight: 700, color: "var(--navy)", letterSpacing: "-0.5px" }}>
            Certi<span style={{ color: "var(--gold)" }}>Task</span>
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* FR-C1: Verification Status Badge */}
          {userProfile?.isVerified ? (
            <span style={{ fontSize: 12, fontWeight: 600, color: "#276749", background: "rgba(56,161,105,0.12)", padding: "4px 10px", borderRadius: 20, display: "inline-flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#38A169" }} />
              Verified Domain ({userProfile.domain})
            </span>
          ) : (
            <span style={{ fontSize: 12, fontWeight: 600, color: "#9B2C2C", background: "rgba(229,62,62,0.12)", padding: "4px 10px", borderRadius: 20 }}>
              Unverified Domain
            </span>
          )}

          <div style={{ width: 1, height: 20, background: "var(--border)" }} />

          <img
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            alt="Profile Avatar"
            style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }}
          />

          <button onClick={handleSignOut} className="sign-out-btn" style={{ background: "none", border: "none", color: "var(--ink-muted)", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            Sign out
          </button>
        </div>
      </header>

      {/* ── FR-C4: Top Google Ads / Sponsor Banner ───────────── */}
      <div style={{ maxWidth: 1200, margin: "16px auto 0", padding: "0 24px" }}>
        <div style={{ background: "#FFFDF5", border: "1px dashed var(--gold)", borderRadius: "var(--radius-md)", padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: "var(--gold)", border: "1px solid var(--gold)", padding: "2px 4px", borderRadius: 3, textTransform: "uppercase" }}>Sponsor</span>
            <p style={{ fontSize: 13, color: "var(--navy)", fontWeight: 500 }}>
              Need fast cloud servers? Host your next app on <strong>Neon Serverless Postgres</strong>. Fast, autoscaled database.
            </p>
          </div>
          <a href="https://neon.tech" target="_blank" rel="noopener noreferrer" onClick={() => setAdClickCount(c => c + 1)} style={{ fontSize: 12, fontWeight: 700, color: "var(--gold)", textDecoration: "none" }}>
            Try Neon Free →
          </a>
        </div>
      </div>

      {/* ── Main Layout Grid ─────────────────────────────────── */}
      <main className="dashboard-main" style={{ maxWidth: 1200, margin: "0 auto", padding: "24px", display: "grid", gridTemplateColumns: "240px 1fr", gap: 24 }}>
        
        {/* Sidebar Nav */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {[
            { id: "overview", label: "Dashboard Overview" },
            { id: "post-project", label: "Post a Project (Free)" },
            { id: "applications", label: `Applications (${applications.filter(a => a.status === "Pending").length})` },
            { id: "submissions", label: `Submissions (${submissions.filter(s => s.status === "Submitted").length})` },
            { id: "certificates", label: "Certificate Oversight" },
            { id: "billing", label: "Billing & Revenue" },
            { id: "profile", label: "Public Profile Page" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "10px 14px",
                borderRadius: 8,
                border: "none",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                background: activeTab === tab.id ? "var(--navy)" : "transparent",
                color: activeTab === tab.id ? "#fff" : "var(--ink-muted)",
                transition: "var(--transition)",
              }}
            >
              {tab.label}
            </button>
          ))}

          {/* Ad unit inside sidebar */}
          <div style={{ marginTop: 24, background: "#EDF2F7", borderRadius: 8, padding: 14, border: "1px solid var(--border)", textAlign: "center" }}>
            <span style={{ fontSize: 9, color: "var(--ink-subtle)", fontWeight: 700, textTransform: "uppercase" }}>Advertisement</span>
            <h4 style={{ fontSize: 12, fontWeight: 700, color: "var(--navy)", margin: "4px 0" }}>Host with Vercel</h4>
            <p style={{ fontSize: 11, color: "var(--ink-muted)", lineHeight: 1.4, marginBottom: 8 }}>Deploy your Next.js apps instantly with Vercel.</p>
            <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, fontWeight: 700, color: "var(--navy)", textDecoration: "none" }}>Learn More</a>
          </div>
        </aside>

        {/* Dynamic Tab Panel */}
        <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "28px", boxShadow: "var(--shadow-sm)" }}>
          
          {/* ── TAB 1: OVERVIEW ──────────────────────────────── */}
          {activeTab === "overview" && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--navy)", marginBottom: 6 }}>Overview</h2>
              <p style={{ fontSize: 14, color: "var(--ink-muted)", marginBottom: 24 }}>Manage your active project listings and student engagements.</p>

              {/* Stats row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
                <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 18, background: "#F8FAFC" }}>
                  <span style={{ fontSize: 12, color: "var(--ink-subtle)", fontWeight: 600 }}>Active Projects</span>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "var(--navy)", marginTop: 4 }}>{projects.filter(p => p.status === "Active").length}</div>
                </div>
                <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 18, background: "#F8FAFC" }}>
                  <span style={{ fontSize: 12, color: "var(--ink-subtle)", fontWeight: 600 }}>Pending Applications</span>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "var(--navy)", marginTop: 4 }}>{applications.filter(a => a.status === "Pending").length}</div>
                </div>
                <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 18, background: "#F8FAFC" }}>
                  <span style={{ fontSize: 12, color: "var(--ink-subtle)", fontWeight: 600 }}>Issued Certificates</span>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "var(--navy)", marginTop: 4 }}>{certificates.filter(c => c.status === "Verified").length}</div>
                </div>
              </div>

              {/* Projects List */}
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)", marginBottom: 16 }}>Your Posted Projects</h3>
              {projects.length === 0 ? (
                <div style={{ border: "2px dashed var(--border)", borderRadius: 12, padding: 40, textAlign: "center" }}>
                  <p style={{ color: "var(--ink-muted)", marginBottom: 16 }}>No projects posted yet.</p>
                  <button onClick={() => setActiveTab("post-project")} className="btn-primary" style={{ width: "auto", display: "inline-flex", padding: "10px 20px" }}>Post Your First Project</button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {projects.map((proj) => (
                    <div key={proj.id} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                        <div>
                          <h4 style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)" }}>{proj.title}</h4>
                          <span style={{ fontSize: 12, color: "var(--ink-subtle)" }}>Deadline: {proj.deadline} | Team Cap: {proj.teamCap} students</span>
                        </div>
                        <span style={{
                          padding: "4px 10px",
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 700,
                          background: proj.status === "Active" ? "rgba(56,161,105,0.12)" : proj.status === "Paused" ? "rgba(214,158,46,0.12)" : "rgba(229,62,62,0.12)",
                          color: proj.status === "Active" ? "#276749" : proj.status === "Paused" ? "#975A16" : "#9B2C2C",
                        }}>
                          {proj.status}
                        </span>
                      </div>
                      <p style={{ fontSize: 14, color: "var(--ink-muted)", marginBottom: 16 }}>{proj.description}</p>

                      {/* Lifecycle Controls */}
                      <div style={{ display: "flex", gap: 8 }}>
                        {proj.status === "Active" ? (
                          <button onClick={() => handleUpdateProjectStatus(proj.id, "Paused")} style={{ padding: "6px 12px", border: "1px solid var(--border)", background: "#fff", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", color: "var(--ink-muted)" }}>Pause Listing</button>
                        ) : (
                          <button onClick={() => handleUpdateProjectStatus(proj.id, "Active")} style={{ padding: "6px 12px", border: "1px solid var(--border)", background: "#fff", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", color: "var(--navy)" }}>Go Live</button>
                        )}
                        <button onClick={() => handleExtendDeadline(proj.id, proj.deadline)} style={{ padding: "6px 12px", border: "1px solid var(--border)", background: "#fff", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", color: "var(--ink-muted)" }}>Extend Deadline</button>
                        <button onClick={() => handleUpdateProjectStatus(proj.id, "Closed")} style={{ padding: "6px 12px", border: "1px solid #FC8181", background: "#FFF5F5", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", color: "#C53030" }}>Close Project</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TAB 2: POST A PROJECT (FREE & LIVE IMMEDIATELY) ──── */}
          {activeTab === "post-project" && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--navy)", marginBottom: 6 }}>Post a Project</h2>
              <p style={{ fontSize: 14, color: "var(--ink-muted)", marginBottom: 24 }}>Form to create a project listing. Goes live immediately on submission for free.</p>

              <form onSubmit={handleCreateProject}>
                <div className="form-group">
                  <label className="form-label">Project Title</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. ISO 27001 Compliance Audit Helper"
                    value={projectForm.title}
                    onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Project Description</label>
                  <textarea
                    className="form-input"
                    rows={4}
                    style={{ height: "auto", padding: "10px 14px" }}
                    placeholder="Provide details about the project goals, scope, and expectations..."
                    value={projectForm.description}
                    onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Required Skills (Comma separated)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. React, Cybersecurity, Excel"
                    value={projectForm.requiredSkills}
                    onChange={(e) => setProjectForm({ ...projectForm, requiredSkills: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Deliverables Required</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. GitHub Repository, PDF Security Audit Report"
                    value={projectForm.deliverables}
                    onChange={(e) => setProjectForm({ ...projectForm, deliverables: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Submission Deadline</label>
                    <input
                      type="date"
                      className="form-input"
                      value={projectForm.deadline}
                      onChange={(e) => setProjectForm({ ...projectForm, deadline: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Team Size Cap (Students)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={projectForm.teamCap}
                      onChange={(e) => setProjectForm({ ...projectForm, teamCap: parseInt(e.target.value) || 20 })}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn-primary btn-gold" style={{ marginTop: 12 }}>
                  Submit & Post Live Immediately (No Fee)
                </button>
              </form>
            </div>
          )}

          {/* ── TAB 3: REVIEW APPLICATIONS ───────────────────── */}
          {activeTab === "applications" && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--navy)", marginBottom: 6 }}>Applications</h2>
              <p style={{ fontSize: 14, color: "var(--ink-muted)", marginBottom: 24 }}>Review applying student teams and select sub-teams for your listings.</p>

              {applications.length === 0 ? (
                <p style={{ color: "var(--ink-subtle)", textAlign: "center", padding: "40px 0" }}>No applications received yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {applications.map((app) => (
                    <div key={app.id} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                        <div>
                          <h4 style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)" }}>{app.teamName}</h4>
                          <span style={{ fontSize: 12, color: "var(--ink-subtle)" }}>Applying for: <strong>{app.project.title}</strong></span>
                        </div>
                        <span style={{
                          padding: "4px 10px",
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 700,
                          background: app.status === "Pending" ? "#EDF2F7" : app.status === "Selected" ? "rgba(56,161,105,0.12)" : "rgba(229,62,62,0.12)",
                          color: app.status === "Pending" ? "var(--ink-muted)" : app.status === "Selected" ? "#276749" : "#9B2C2C",
                        }}>
                          {app.status}
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: "var(--ink-muted)", marginBottom: 8 }}><strong>Team Members:</strong> {app.members}</p>
                      <p style={{ fontSize: 14, color: "var(--ink-muted)", marginBottom: 16 }}><strong>Pitch:</strong> {app.pitch}</p>

                      {app.status === "Pending" && (
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => handleApplicationStatus(app.id, "Selected")} style={{ padding: "6px 14px", background: "var(--navy)", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Accept Team</button>
                          <button onClick={() => handleApplicationStatus(app.id, "Rejected")} style={{ padding: "6px 14px", border: "1px solid var(--border)", background: "#fff", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", color: "#C53030" }}>Decline</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TAB 4: REVIEW SUBMISSIONS ────────────────────── */}
          {activeTab === "submissions" && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--navy)", marginBottom: 6 }}>Submissions</h2>
              <p style={{ fontSize: 14, color: "var(--ink-muted)", marginBottom: 24 }}>Review deliverables, write feedback, and trigger certificate issuance upon approval.</p>

              {submissions.length === 0 ? (
                <p style={{ color: "var(--ink-subtle)", textAlign: "center", padding: "40px 0" }}>No submissions received yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {submissions.map((sub) => (
                    <div key={sub.id} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                        <div>
                          <h4 style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)" }}>{sub.teamName}</h4>
                          <span style={{ fontSize: 12, color: "var(--ink-subtle)" }}>Project: <strong>{sub.project.title}</strong></span>
                        </div>
                        <span style={{
                          padding: "4px 10px",
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 700,
                          background: sub.status === "Submitted" ? "rgba(49,130,206,0.12)" : sub.status === "Approved" ? "rgba(56,161,105,0.12)" : "rgba(229,62,62,0.12)",
                          color: sub.status === "Submitted" ? "#2B6CB0" : sub.status === "Approved" ? "#276749" : "#9B2C2C",
                        }}>
                          {sub.status}
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: "var(--ink-muted)", marginBottom: 8 }}>
                        <strong>Submission Link/Repo:</strong>{" "}
                        <a href={sub.submissionUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--gold)", fontWeight: 600 }}>{sub.submissionUrl}</a>
                      </p>
                      {sub.notes && <p style={{ fontSize: 14, color: "var(--ink-muted)", marginBottom: 16 }}><strong>Notes:</strong> {sub.notes}</p>}
                      {sub.feedback && <p style={{ fontSize: 13, background: "#F7FAFC", padding: "10px 14px", borderRadius: 8, borderLeft: "3px solid var(--gold)", color: "var(--ink-muted)", marginBottom: 16 }}><strong>Feedback given:</strong> {sub.feedback}</p>}

                      {sub.status === "Submitted" && (
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => handleApproveSubmission(sub.id)} style={{ padding: "6px 14px", background: "#38A169", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Approve & Issue Certificate</button>
                          <button onClick={() => { setSelectedSubmissionId(sub.id); setShowRejectModal(true); }} style={{ padding: "6px 14px", border: "1px solid var(--border)", background: "#fff", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", color: "#C53030" }}>Return Feedback / Decline</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TAB 5: CERTIFICATE OVERSIGHT ─────────────────── */}
          {activeTab === "certificates" && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--navy)", marginBottom: 6 }}>Certificate Oversight</h2>
              <p style={{ fontSize: 14, color: "var(--ink-muted)", marginBottom: 24 }}>Overview of issued credentials under your brand name, with the ability to flag or revoke.</p>

              {certificates.length === 0 ? (
                <p style={{ color: "var(--ink-subtle)", textAlign: "center", padding: "40px 0" }}>No certificates issued yet.</p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                    <thead>
                      <tr style={{ background: "#F8FAFC", borderBottom: "1px solid var(--border)", color: "var(--ink-muted)", fontSize: 12, textTransform: "uppercase", textAlign: "left" }}>
                        <th style={{ padding: "12px" }}>Credential ID</th>
                        <th style={{ padding: "12px" }}>Student</th>
                        <th style={{ padding: "12px" }}>Certificate Title</th>
                        <th style={{ padding: "12px" }}>Issue Date</th>
                        <th style={{ padding: "12px" }}>Status</th>
                        <th style={{ padding: "12px", textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {certificates.map((cert) => (
                        <tr key={cert.id} style={{ borderBottom: "1px solid var(--border)" }}>
                          <td style={{ padding: "12px", fontFamily: "monospace", fontWeight: 600 }}>{cert.certId}</td>
                          <td style={{ padding: "12px" }}>
                            <div style={{ fontWeight: 600 }}>{cert.studentName}</div>
                            <div style={{ fontSize: 12, color: "var(--ink-subtle)" }}>{cert.studentEmail}</div>
                          </td>
                          <td style={{ padding: "12px" }}>{cert.title}</td>
                          <td style={{ padding: "12px", color: "var(--ink-muted)" }}>{cert.issueDate}</td>
                          <td style={{ padding: "12px" }}>
                            <span style={{
                              padding: "2px 8px",
                              borderRadius: 10,
                              fontSize: 11,
                              fontWeight: 700,
                              background: cert.status === "Verified" ? "rgba(56,161,105,0.12)" : "rgba(229,62,62,0.12)",
                              color: cert.status === "Verified" ? "#276749" : "#9B2C2C",
                            }}>
                              {cert.status}
                            </span>
                          </td>
                          <td style={{ padding: "12px", textAlign: "right" }}>
                            {cert.status === "Verified" ? (
                              <button onClick={() => handleUpdateCertificate(cert.id, "Revoked")} style={{ padding: "4px 8px", background: "none", border: "1px solid #FC8181", color: "#C53030", borderRadius: 4, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Revoke</button>
                            ) : (
                              <button onClick={() => handleUpdateCertificate(cert.id, "Verified")} style={{ padding: "4px 8px", background: "none", border: "1px solid var(--border)", color: "var(--navy)", borderRadius: 4, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Verify</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── TAB 6: BILLING & AD REVENUE NOTE ──────────────── */}
          {activeTab === "billing" && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--navy)", marginBottom: 6 }}>Billing & Ad Revenue</h2>
              <p style={{ fontSize: 14, color: "var(--ink-muted)", marginBottom: 24 }}>Billing history and platform advertisement metrics.</p>

              <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 24, background: "#FFFDF5", marginBottom: 24 }}>
                <h4 style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)", marginBottom: 8 }}>Free Tier (Ad-Supported)</h4>
                <p style={{ fontSize: 14, color: "var(--ink-muted)", lineHeight: 1.6 }}>
                  CertiTask is free for all companies and students. Instead of paying listing fees, the platform is sustained through non-intrusive developer sponsorships and ads.
                </p>
                <div style={{ display: "flex", gap: 24, marginTop: 18 }}>
                  <div>
                    <span style={{ fontSize: 12, color: "var(--ink-subtle)" }}>Sponsor Clicks Generated</span>
                    <div style={{ fontSize: 24, fontWeight: 800, color: "var(--navy)", marginTop: 2 }}>{adClickCount}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: 12, color: "var(--ink-subtle)" }}>Current Billing Invoices</span>
                    <div style={{ fontSize: 24, fontWeight: 800, color: "var(--success)", marginTop: 2 }}>$0.00 (Free)</div>
                  </div>
                </div>
              </div>

              <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 20, background: "#EDF2F7" }}>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--ink-subtle)" }}>Phase 2 Featured Listing</span>
                <p style={{ fontSize: 13, color: "var(--ink-muted)", marginTop: 6 }}>
                  Featured listing purchase history and invoice exports will appear here in Phase 2.
                </p>
              </div>
            </div>
          )}

          {/* ── TAB 7: COMPANY PROFILE PAGE ──────────────────── */}
          {activeTab === "profile" && userProfile && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--navy)", marginBottom: 6 }}>Company Profile Page</h2>
              <p style={{ fontSize: 14, color: "var(--ink-muted)", marginBottom: 24 }}>Public facing organizational branding.</p>

              <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 24, background: "#F8FAFC", marginBottom: 24 }}>
                <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 16 }}>
                  <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt={userProfile.name}
                    style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover" }}
                  />
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--navy)" }}>{userProfile.name}</h3>
                    <p style={{ fontSize: 13, color: "var(--gold)", fontWeight: 600 }}>{userProfile.website}</p>
                  </div>
                </div>

                <p style={{ fontSize: 14, color: "var(--ink-muted)", lineHeight: 1.6, marginBottom: 16 }}>
                  <strong>Company Bio:</strong> {userProfile.bio}
                </p>

                <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
                  <span style={{ fontSize: 12, color: "var(--ink-subtle)" }}>Verified Organization Domain</span>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--navy)", marginTop: 2 }}>{userProfile.domain}</div>
                </div>

                <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
                  <Link href="/company/profile" className="btn-primary" style={{ padding: '8px 14px', fontWeight: 700, textDecoration: 'none', display: 'inline-block', background: 'var(--navy)', color: 'white', borderRadius: '6px', cursor: 'pointer' }}>Edit Full Profile</Link>
                  <button onClick={handleSaveProfile} className="btn-primary" style={{ padding: '8px 14px', fontWeight: 700 }}>Save Changes</button>
                  <button onClick={() => { setProfileForm({ name: userProfile.name, bio: userProfile.bio, website: userProfile.website }); alert('Reverted to saved profile'); }} className="btn-ghost" style={{ padding: '8px 14px', fontWeight: 700 }}>Revert</button>
                </div>
              </div>
            </div>
          )}

        </section>
      </main>

      {/* ── FR-C8: Feedback/Decline Modal ────────────────────── */}
      {showRejectModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,42,74,0.6)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: "var(--radius-xl)", padding: 32, maxWidth: 480, width: "100%", boxShadow: "var(--shadow-lg)" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--navy)", marginBottom: 6 }}>Decline Submission</h3>
            <p style={{ fontSize: 13, color: "var(--ink-muted)", marginBottom: 20 }}>Provide constructive feedback for the team to address and resubmit.</p>

            <form onSubmit={handleRejectSubmission}>
              <div className="form-group">
                <label className="form-label">Constructive Feedback</label>
                <textarea
                  className="form-input"
                  rows={4}
                  style={{ height: "auto", padding: "10px 14px" }}
                  placeholder="e.g. Please update the README configuration details and format the API endpoints documentation..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                <button type="button" onClick={() => setShowRejectModal(false)} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, background: "#C53030" }}>Return Feedback</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── FR-C4: Post-Project Ad Confirmation Modal ────────── */}
      {showAdConfirmation && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,42,74,0.6)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: "var(--radius-xl)", padding: 32, maxWidth: 480, width: "100%", boxShadow: "var(--shadow-lg)", textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(56,161,105,0.12)", color: "#38A169", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: 28, height: 28 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: "var(--navy)", marginBottom: 8 }}>Project Posted Live!</h3>
            <p style={{ fontSize: 14, color: "var(--ink-muted)", marginBottom: 24, lineHeight: 1.5 }}>
              Your project listing is live and students can apply immediately.
            </p>

            {/* Ad Unit */}
            <div style={{ background: "#F7FAFC", border: "1px solid var(--border)", borderRadius: 12, padding: 18, marginBottom: 24 }}>
              <span style={{ fontSize: 9, color: "var(--gold)", border: "1px solid var(--gold)", padding: "2px 4px", borderRadius: 3, textTransform: "uppercase", fontWeight: 700 }}>Sponsored Ad</span>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)", marginTop: 8, marginBottom: 4 }}>Need Professional Certifications?</h4>
              <p style={{ fontSize: 12, color: "var(--ink-muted)", lineHeight: 1.4 }}>Gain industry-grade accredited qualifications in cloud systems and AWS architectures free with CertiTask Partners.</p>
              <button onClick={() => setAdClickCount(c => c + 1)} style={{ marginTop: 12, background: "var(--navy)", color: "#fff", border: "none", padding: "6px 14px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Register Now</button>
            </div>

            <button type="button" onClick={() => setShowAdConfirmation(false)} className="btn-primary" style={{ width: "100%" }}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
}
