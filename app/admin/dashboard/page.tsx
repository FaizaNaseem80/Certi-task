"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Overview {
  companies: number;
  students: number;
  projects: number;
  applications: number;
  submissionsThisWeek: number;
  certificatesIssued: number;
  certificatesRevoked: number;
  unreadMessages: number;
  totalMessages: number;
}

interface Company {
  id: string;
  name: string;
  email: string;
  domain: string | null;
  website: string | null;
  createdAt: string;
  _count: { projects: number };
}

interface Student {
  id: string;
  name: string;
  email: string;
  bio: string | null;
  createdAt: string;
  _count: { applications: number; submissions: number };
}

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

type Tab = "overview" | "companies" | "students" | "messages";

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [overview, setOverview] = useState<Overview | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    setError("");
    try {
      const [ovRes, usRes, msgRes] = await Promise.all([
        fetch("/api/admin/overview"),
        fetch("/api/admin/users"),
        fetch("/api/admin/messages"),
      ]);

      if (ovRes.status === 401 || usRes.status === 401 || msgRes.status === 401) {
        setError("Unauthorized. Please login as Super Admin.");
        router.push("/auth/login");
        return;
      }

      const ovData = await ovRes.json();
      const usData = await usRes.json();
      const msgData = await msgRes.json();

      setOverview(ovData.counts);
      setCompanies(usData.companies || []);
      setStudents(usData.students || []);
      setMessages(msgData.messages || []);
    } catch {
      setError("Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
    router.refresh();
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "overview", label: "Overview", icon: "📊" },
    { key: "companies", label: "Companies", icon: "🏢" },
    { key: "students", label: "Students", icon: "🎓" },
    { key: "messages", label: "Messages", icon: "✉️" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <p className="text-navy font-bold text-lg">Loading Super Admin Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <p className="text-red-600 font-bold">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      {/* Top Bar */}
      <header className="bg-navy text-paper shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gold flex items-center justify-center text-navy font-extrabold text-sm">
              SA
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight">Super Admin Panel</h1>
              <p className="text-[10px] text-paper/60 font-mono">CertiTask Platform Control Center</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg hover:bg-red-500 hover:text-white transition-all cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === tab.key
                  ? "bg-navy text-gold shadow-md"
                  : "bg-white text-navy border border-navy/10 hover:border-gold hover:text-gold"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
              {tab.key === "messages" && overview && overview.unreadMessages > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full">
                  {overview.unreadMessages}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && overview && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                { label: "Registered Companies", value: overview.companies, color: "text-blue-600" },
                { label: "Registered Students", value: overview.students, color: "text-green-600" },
                { label: "Total Projects", value: overview.projects, color: "text-purple-600" },
                { label: "Applications", value: overview.applications, color: "text-orange-600" },
                { label: "Submissions (7d)", value: overview.submissionsThisWeek, color: "text-cyan-600" },
                { label: "Certificates Issued", value: overview.certificatesIssued, color: "text-gold" },
                { label: "Certificates Revoked", value: overview.certificatesRevoked, color: "text-red-600" },
                { label: "Contact Messages", value: overview.totalMessages, color: "text-navy" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white p-5 rounded-xl border border-navy/5 shadow-xs hover:shadow-md transition-shadow"
                >
                  <p className="text-[11px] font-semibold text-ink/60 uppercase tracking-wide mb-1">
                    {stat.label}
                  </p>
                  <p className={`text-3xl font-extrabold ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Quick Recent Activity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl border border-navy/5 shadow-xs">
                <h3 className="font-bold text-navy text-sm mb-4">Latest Companies</h3>
                {companies.length === 0 ? (
                  <p className="text-xs text-ink/50">No companies registered yet.</p>
                ) : (
                  <div className="space-y-3">
                    {companies.slice(0, 5).map((c) => (
                      <div key={c.id} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded bg-navy text-gold flex items-center justify-center font-bold text-[10px]">
                            {c.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-navy">{c.name}</p>
                            <p className="text-ink/50">{c.email}</p>
                          </div>
                        </div>
                        <span className="text-ink/50">{c._count.projects} projects</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white p-6 rounded-xl border border-navy/5 shadow-xs">
                <h3 className="font-bold text-navy text-sm mb-4">Latest Messages</h3>
                {messages.length === 0 ? (
                  <p className="text-xs text-ink/50">No messages received yet.</p>
                ) : (
                  <div className="space-y-3">
                    {messages.slice(0, 5).map((m) => (
                      <div key={m.id} className="flex items-start gap-2 text-xs">
                        <div className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${m.isRead ? "bg-gray-300" : "bg-red-500"}`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-navy truncate">{m.subject || "No Subject"}</p>
                          <p className="text-ink/50 truncate">{m.name} — {m.email}</p>
                        </div>
                        <span className="text-ink/40 shrink-0">{formatDate(m.createdAt)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── COMPANIES TAB ── */}
        {activeTab === "companies" && (
          <div className="bg-white rounded-xl border border-navy/5 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-navy/5 flex items-center justify-between">
              <h3 className="font-bold text-navy">All Registered Companies ({companies.length})</h3>
            </div>
            {companies.length === 0 ? (
              <div className="p-12 text-center text-ink/50 text-sm">No companies registered yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-navy/[0.03] text-left">
                      <th className="px-6 py-3 font-bold text-navy/70 uppercase tracking-wide">Company</th>
                      <th className="px-6 py-3 font-bold text-navy/70 uppercase tracking-wide">Email</th>
                      <th className="px-6 py-3 font-bold text-navy/70 uppercase tracking-wide">Domain</th>
                      <th className="px-6 py-3 font-bold text-navy/70 uppercase tracking-wide">Website</th>
                      <th className="px-6 py-3 font-bold text-navy/70 uppercase tracking-wide">Projects</th>
                      <th className="px-6 py-3 font-bold text-navy/70 uppercase tracking-wide">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy/5">
                    {companies.map((c) => (
                      <tr key={c.id} className="hover:bg-gold/5 transition-colors">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-navy text-gold flex items-center justify-center font-bold text-xs shrink-0">
                              {c.name.charAt(0)}
                            </div>
                            <span className="font-bold text-navy">{c.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-ink/70">{c.email}</td>
                        <td className="px-6 py-3 text-ink/70">{c.domain || "—"}</td>
                        <td className="px-6 py-3 text-ink/70">{c.website || "—"}</td>
                        <td className="px-6 py-3">
                          <span className="px-2 py-0.5 bg-gold/10 text-gold font-bold rounded text-[10px]">
                            {c._count.projects}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-ink/50">{formatDate(c.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── STUDENTS TAB ── */}
        {activeTab === "students" && (
          <div className="bg-white rounded-xl border border-navy/5 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-navy/5">
              <h3 className="font-bold text-navy">All Registered Students ({students.length})</h3>
            </div>
            {students.length === 0 ? (
              <div className="p-12 text-center text-ink/50 text-sm">No students registered yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-navy/[0.03] text-left">
                      <th className="px-6 py-3 font-bold text-navy/70 uppercase tracking-wide">Student</th>
                      <th className="px-6 py-3 font-bold text-navy/70 uppercase tracking-wide">Email</th>
                      <th className="px-6 py-3 font-bold text-navy/70 uppercase tracking-wide">Bio</th>
                      <th className="px-6 py-3 font-bold text-navy/70 uppercase tracking-wide">Applications</th>
                      <th className="px-6 py-3 font-bold text-navy/70 uppercase tracking-wide">Submissions</th>
                      <th className="px-6 py-3 font-bold text-navy/70 uppercase tracking-wide">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy/5">
                    {students.map((s) => (
                      <tr key={s.id} className="hover:bg-gold/5 transition-colors">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-green-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                              {s.name.charAt(0)}
                            </div>
                            <span className="font-bold text-navy">{s.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-ink/70">{s.email}</td>
                        <td className="px-6 py-3 text-ink/70 max-w-[200px] truncate">{s.bio || "—"}</td>
                        <td className="px-6 py-3">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 font-bold rounded text-[10px]">
                            {s._count.applications}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <span className="px-2 py-0.5 bg-purple-50 text-purple-600 font-bold rounded text-[10px]">
                            {s._count.submissions}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-ink/50">{formatDate(s.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── MESSAGES TAB ── */}
        {activeTab === "messages" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-navy text-lg">
                Contact Messages & Queries ({messages.length})
              </h3>
            </div>
            {messages.length === 0 ? (
              <div className="bg-white p-12 text-center text-ink/50 text-sm rounded-xl border border-navy/5">
                No messages received yet.
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`bg-white p-5 rounded-xl border shadow-xs transition-all ${
                      m.isRead ? "border-navy/5" : "border-gold/30 shadow-gold/10"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        {!m.isRead && (
                          <span className="h-2.5 w-2.5 rounded-full bg-gold shrink-0" />
                        )}
                        <div>
                          <p className="font-bold text-navy text-sm">
                            {m.subject || "No Subject"}
                          </p>
                          <p className="text-[11px] text-ink/60">
                            From: <span className="font-semibold text-navy">{m.name}</span> ({m.email})
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          m.type === "company_query"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}>
                          {m.type === "company_query" ? "Company Query" : "Contact"}
                        </span>
                        <span className="text-[10px] text-ink/40">{formatDate(m.createdAt)}</span>
                      </div>
                    </div>
                    <p className="text-sm text-ink/80 leading-relaxed bg-[#f8f7f4] p-3 rounded-lg border border-navy/5">
                      {m.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
