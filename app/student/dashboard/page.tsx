"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
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
  company: {
    name: string;
    domain: string;
    logoUrl: string;
  };
}

interface Application {
  id: string;
  teamName: string;
  members: string;
  pitch: string;
  status: string;
  projectId: string;
  project: {
    title: string;
    company: { name: string };
  };
}

interface Submission {
  id: string;
  teamName: string;
  submissionUrl: string;
  notes: string;
  feedback: string;
  status: string;
  project: {
    title: string;
    company: { name: string };
  };
}

interface Certificate {
  id: string;
  certId: string;
  title: string;
  issueDate: string;
  expiryDate: string;
  status: string;
  company: {
    name: string;
  };
}

export default function StudentDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"projects" | "applications" | "submissions" | "certificates" | "pathway">("projects");

  // User Profile & Database states
  const [userName, setUserName] = useState<string>("Learner");
  const [userEmail, setUserEmail] = useState<string>("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  // UI/Modals states
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [adClickCount, setAdClickCount] = useState(0);

  // Form states
  const [applyForm, setApplyForm] = useState({
    teamName: "",
    members: "",
    pitch: "",
  });

  const [submitForm, setSubmitForm] = useState({
    projectId: "",
    teamName: "",
    submissionUrl: "",
    notes: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const userRes = await fetch("/api/auth/me");
      const userData = await userRes.json();
      if (userData.user) {
        setUserName(userData.user.name);
        setUserEmail(userData.user.email);
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
      console.error("Error fetching student dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
    router.refresh();
  }

    // Allow quick edit of student profile (name)
    async function handleEditProfile() {
      const newName = prompt('Enter your display name:', userName || 'Learner');
      if (!newName) return;
      try {
        const res = await fetch('/api/auth/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newName }),
        });
        if (res.ok) {
          setUserName(newName);
          alert('Profile updated');
        } else {
          console.error('Failed to update profile');
        }
      } catch (err) {
        console.error(err);
      }
    }

  // Submit project application (FR-C5)
  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProject) return;
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProject.id,
          ...applyForm,
        }),
      });
      if (res.ok) {
        setApplyForm({ teamName: "", members: "", pitch: "" });
        setShowApplyModal(false);
        fetchData();
        setActiveTab("applications");
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Submit project deliverables (FR-C7)
  async function handleSubmitDeliverables(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitForm),
      });
      if (res.ok) {
        setSubmitForm({ projectId: "", teamName: "", submissionUrl: "", notes: "" });
        setShowSubmitModal(false);
        fetchData();
        setActiveTab("submissions");
      }
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
          <span className="role-badge student">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 12, height: 12 }}>
              <path d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Student Learner
          </span>

          <div style={{ width: 1, height: 20, background: "var(--border)" }} />

          <button onClick={handleEditProfile} className="btn-ghost" style={{ background: "none", border: "none", color: "var(--ink-muted)", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            Edit profile
          </button>

          <button onClick={handleSignOut} className="sign-out-btn" style={{ background: "none", border: "none", color: "var(--ink-muted)", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            Sign out
          </button>
        </div>
      </header>

      {/* ── FR-C4: Ad-Supported Ecosystem ────────────────────── */}
      <div style={{ maxWidth: 1200, margin: "16px auto 0", padding: "0 24px" }}>
        <div style={{ background: "#FFFDF5", border: "1px dashed var(--gold)", borderRadius: "var(--radius-md)", padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: "var(--gold)", border: "1px solid var(--gold)", padding: "2px 4px", borderRadius: 3, textTransform: "uppercase" }}>Sponsor</span>
            <p style={{ fontSize: 13, color: "var(--navy)", fontWeight: 500 }}>
              Build premium portfolios. Earning credentials on CertiTask is verified 100% on Neon PostgreSQL.
            </p>
          </div>
          <button onClick={() => setAdClickCount(c => c + 1)} style={{ background: "none", border: "none", fontSize: 12, fontWeight: 700, color: "var(--gold)", cursor: "pointer" }}>
            Neon Postgres ({adClickCount} clicks)
          </button>
        </div>
      </div>

      {/* ── Main Layout Grid ─────────────────────────────────── */}
      <main className="dashboard-main" style={{ maxWidth: 1200, margin: "0 auto", padding: "24px", display: "grid", gridTemplateColumns: "240px 1fr", gap: 24 }}>
        
        {/* Sidebar Nav */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {[
            { id: "projects", label: "Explore Live Projects" },
            { id: "applications", label: `My Applications (${applications.length})` },
            { id: "submissions", label: `My Submissions (${submissions.length})` },
            { id: "certificates", label: `Earned Certificates (${certificates.length})` },
            { id: "pathway", label: "Accreditation Timeline" },
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
            <p style={{ fontSize: 11, color: "var(--ink-muted)", lineHeight: 1.4, marginBottom: 8 }}>Deploy your Next.js apps instantly.</p>
            <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, fontWeight: 700, color: "var(--navy)", textDecoration: "none" }}>Deploy Now</a>
          </div>
        </aside>

        {/* Dynamic Tab Panel */}
        <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "28px", boxShadow: "var(--shadow-sm)" }}>
          
          {/* ── TAB 1: EXPLORE LIVE PROJECTS ────────────────────── */}
          {activeTab === "projects" && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--navy)", marginBottom: 6 }}>Explore Live Projects</h2>
              <p style={{ fontSize: 14, color: "var(--ink-muted)", marginBottom: 24 }}>Apply to live projects from verified employers to earn certifications.</p>

              {projects.length === 0 ? (
                <p style={{ color: "var(--ink-subtle)", textAlign: "center", padding: "40px 0" }}>No active projects available at the moment.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {projects.map((proj) => {
                    const alreadyApplied = applications.some(a => a.projectId === proj.id);
                    const isAccepted = applications.some(a => a.projectId === proj.id && a.status === "Selected");
                    return (
                      <div key={proj.id} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                          <div>
                            <h4 style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)" }}>{proj.title}</h4>
                            <span style={{ fontSize: 13, color: "var(--gold)", fontWeight: 600 }}>Company: {proj.company.name}</span>
                          </div>
                          <span style={{ fontSize: 12, color: "var(--ink-subtle)" }}>Deadline: {proj.deadline}</span>
                        </div>
                        <p style={{ fontSize: 14, color: "var(--ink-muted)", marginBottom: 14 }}>{proj.description}</p>
                        <p style={{ fontSize: 13, color: "var(--ink-muted)", marginBottom: 16 }}><strong>Required Skills:</strong> {proj.requiredSkills}</p>

                        <div style={{ display: "flex", gap: 8 }}>
                          {isAccepted ? (
                            <button
                              onClick={() => {
                                setSubmitForm({ ...submitForm, projectId: proj.id });
                                setShowSubmitModal(true);
                              }}
                              style={{ padding: "8px 16px", background: "var(--success)", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                            >
                              Submit Deliverables
                            </button>
                          ) : alreadyApplied ? (
                            <button disabled style={{ padding: "8px 16px", background: "#EDF2F7", color: "var(--ink-subtle)", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700 }} >
                              Application Pending
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedProject(proj);
                                setShowApplyModal(true);
                              }}
                              className="btn-primary"
                              style={{ width: "auto", padding: "8px 16px" }}
                            >
                              Apply as Team
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── TAB 2: MY APPLICATIONS ────────────────────────── */}
          {activeTab === "applications" && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--navy)", marginBottom: 6 }}>My Applications</h2>
              <p style={{ fontSize: 14, color: "var(--ink-muted)", marginBottom: 24 }}>Check the selection status of your team applications.</p>

              {applications.length === 0 ? (
                <p style={{ color: "var(--ink-subtle)", textAlign: "center", padding: "40px 0" }}>You haven&apos;t applied to any projects yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {applications.map((app) => (
                    <div key={app.id} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 18 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <h4 style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)" }}>{app.project.title}</h4>
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
                      <p style={{ fontSize: 13, color: "var(--ink-muted)" }}><strong>Team Name:</strong> {app.teamName}</p>
                      <p style={{ fontSize: 13, color: "var(--ink-muted)" }}><strong>Members:</strong> {app.members}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TAB 3: MY SUBMISSIONS ─────────────────────────── */}
          {activeTab === "submissions" && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--navy)", marginBottom: 6 }}>My Submissions</h2>
              <p style={{ fontSize: 14, color: "var(--ink-muted)", marginBottom: 24 }}>Deliverables submitted for review and supervisor feedback.</p>

              {submissions.length === 0 ? (
                <p style={{ color: "var(--ink-subtle)", textAlign: "center", padding: "40px 0" }}>No submissions made yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {submissions.map((sub) => (
                    <div key={sub.id} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 18 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <h4 style={{ fontSize: 16, fontWeight: 700, color: "var(--navy)" }}>{sub.project.title}</h4>
                        <span style={{
                          padding: "4px 10px",
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 700,
                          background: sub.status === "Submitted" ? "rgba(49,130,206,0.12)" : sub.status === "Approved" ? "rgba(56,161,105,0.12)" : sub.status === "CompanyApproved" ? "rgba(236,201,75,0.12)" : "rgba(229,62,62,0.12)",
                          color: sub.status === "Submitted" ? "#2B6CB0" : sub.status === "Approved" ? "#276749" : sub.status === "CompanyApproved" ? "#97640E" : "#9B2C2C",
                        }}>
                          {sub.status}
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: "var(--ink-muted)" }}>
                        <strong>Submission Link:</strong>{" "}
                        <a href={sub.submissionUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--gold)", fontWeight: 600 }}>{sub.submissionUrl}</a>
                      </p>
                      {sub.feedback && (
                        <p style={{ marginTop: 10, fontSize: 13, background: "#F7FAFC", padding: 12, borderRadius: 8, borderLeft: "3px solid var(--gold)", color: "var(--ink-muted)" }}>
                          <strong>Feedback:</strong> {sub.feedback}
                        </p>
                      )}

                      {/* Student confirms deliverables after company has marked CompanyApproved */}
                      {sub.status === "CompanyApproved" && (
                        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                          <button
                            onClick={async () => {
                              if (!confirm('Confirm that you accept this approval and agree to certificate issuance?')) return;
                              try {
                                const res = await fetch(`/api/submissions/${sub.id}`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ status: 'StudentConfirmed' }),
                                });
                                if (res.ok) fetchData();
                              } catch (err) {
                                console.error(err);
                              }
                            }}
                            style={{ background: 'var(--gold)', color: '#07203b', padding: '8px 12px', borderRadius: 8, border: 'none', fontWeight: 700, cursor: 'pointer' }}
                          >
                            Confirm & Accept Certificate
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TAB 4: EARNED CERTIFICATES ────────────────────── */}
          {activeTab === "certificates" && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--navy)", marginBottom: 6 }}>Earned Certificates</h2>
              <p style={{ fontSize: 14, color: "var(--ink-muted)", marginBottom: 24 }}>Verified accreditation credentials issued under your name.</p>

              {certificates.length === 0 ? (
                <p style={{ color: "var(--ink-subtle)", textAlign: "center", padding: "40px 0" }}>You haven&apos;t earned any certificates yet. Complete project submissions to earn credentials.</p>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                  {certificates.map((cert) => (
                    <div key={cert.id} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 20, background: "#FFFDF5" }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#276749", background: "rgba(56,161,105,0.12)", padding: "2px 8px", borderRadius: 10 }}>
                        {cert.status}
                      </span>
                      <h4 style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)", marginTop: 12, marginBottom: 4 }}>{cert.title}</h4>
                      <p style={{ fontSize: 12, color: "var(--ink-muted)", marginBottom: 12 }}>Issued by: <strong>{cert.company.name}</strong></p>
                      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10, fontSize: 11, color: "var(--ink-subtle)", fontFamily: "monospace" }}>
                        ID: {cert.certId}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TAB 5: PATHWAY ROADMAP ────────────────────────── */}
          {activeTab === "pathway" && (
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--navy)", marginBottom: 6 }}>Accreditation Timeline</h2>
              <p style={{ fontSize: 14, color: "var(--ink-muted)", marginBottom: 24 }}>Learning and qualification stages tracker.</p>

              <div style={{ display: "flex", flexDirection: "column", gap: 20, position: "relative", paddingLeft: 24 }}>
                <div style={{ position: "absolute", left: 7, top: 12, bottom: 12, width: 2, background: "var(--border)" }} />

                {[
                  { stage: "Stage 1", title: "Join & Explore Live Listings", desc: "Browse available real-world projects posted by verified companies.", status: "Completed" },
                  { stage: "Stage 2", title: "Submit Application & Build Team", desc: "Apply as a student group stating your deliverables pitch.", status: "In Progress" },
                  { stage: "Stage 3", title: "Review Submissions & Earn Verified Credentials", desc: "Succeed in completing goals to unlock direct portfolio certificates.", status: "Upcoming" },
                ].map((step) => (
                  <div key={step.stage} style={{ position: "relative" }}>
                    <div style={{ position: "absolute", left: -24, top: 4, width: 14, height: 14, borderRadius: "50%", background: step.status === "Completed" ? "var(--success)" : step.status === "In Progress" ? "var(--gold)" : "#CBD5E0", border: "2px solid #fff" }} />
                    <div style={{ background: "#F8FAFC", border: "1px solid var(--border)", borderRadius: 10, padding: 16 }}>
                      <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)" }}>{step.stage}: {step.title}</h4>
                      <p style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 4 }}>{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </section>
      </main>

      {/* ── Modal: Apply to Project ─────────────────────────── */}
      {showApplyModal && selectedProject && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,42,74,0.6)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: "var(--radius-xl)", padding: 32, maxWidth: 480, width: "100%", boxShadow: "var(--shadow-lg)" }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: "var(--navy)", marginBottom: 6 }}>Apply as Team</h3>
            <p style={{ fontSize: 13, color: "var(--ink-muted)", marginBottom: 20 }}>Submit application details for {selectedProject.title}</p>

            <form onSubmit={handleApply}>
              <div className="form-group">
                <label className="form-label">Team / Sub-team Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Apex Engineers"
                  value={applyForm.teamName}
                  onChange={(e) => setApplyForm({ ...applyForm, teamName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Team Member Names (Comma separated)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Alex R., Sarah J."
                  value={applyForm.members}
                  onChange={(e) => setApplyForm({ ...applyForm, members: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Application Pitch / Why select us?</label>
                <textarea
                  className="form-input"
                  rows={3}
                  style={{ height: "auto", padding: "10px 14px" }}
                  placeholder="State your tools alignment and deliverables commitment..."
                  value={applyForm.pitch}
                  onChange={(e) => setApplyForm({ ...applyForm, pitch: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                <button type="button" onClick={() => setShowApplyModal(false)} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn-primary btn-gold" style={{ flex: 1 }}>Submit Application</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Submit Deliverables ──────────────────────── */}
      {showSubmitModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,42,74,0.6)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: "var(--radius-xl)", padding: 32, maxWidth: 480, width: "100%", boxShadow: "var(--shadow-lg)" }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: "var(--navy)", marginBottom: 6 }}>Submit Deliverables</h3>
            <p style={{ fontSize: 13, color: "var(--ink-muted)", marginBottom: 20 }}>Post your completed files or GitHub repository URL for reviewer approval.</p>

            <form onSubmit={handleSubmitDeliverables}>
              <div className="form-group">
                <label className="form-label">Team / Sub-team Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Apex Engineers"
                  value={submitForm.teamName}
                  onChange={(e) => setSubmitForm({ ...submitForm, teamName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Submission Link (GitHub URL / File Link)</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://github.com/apex/project"
                  value={submitForm.submissionUrl}
                  onChange={(e) => setSubmitForm({ ...submitForm, submissionUrl: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Additional Notes</label>
                <textarea
                  className="form-input"
                  rows={3}
                  style={{ height: "auto", padding: "10px 14px" }}
                  placeholder="Add any setup details or remarks for the review team..."
                  value={submitForm.notes}
                  onChange={(e) => setSubmitForm({ ...submitForm, notes: e.target.value })}
                />
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                <button type="button" onClick={() => setShowSubmitModal(false)} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Submit Deliverables</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
