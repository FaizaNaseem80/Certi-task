"use client";

import { Suspense } from "react";
import { DashboardShell, LoadingScreen, SidebarStats, type TabDef } from "@/components/dashboard/DashboardShell";
import { VerificationBadge } from "@/components/dashboard/ui";
import { signOut, useDashboardData, useTabParam } from "@/components/dashboard/useDashboardData";
import { CLIENT_TYPE_LABEL } from "@/lib/enums";
import { OverviewTab } from "@/components/client/OverviewTab";
import { PostProjectTab } from "@/components/client/PostProjectTab";
import { ProjectsTab } from "@/components/client/ProjectsTab";
import { ApplicationsTab } from "@/components/client/ApplicationsTab";
import { SubmissionsTab } from "@/components/client/SubmissionsTab";
import { CertificatesTab } from "@/components/client/CertificatesTab";
import { ProfileTab } from "@/components/client/ProfileTab";

const TAB_IDS = ["overview", "post-project", "projects", "applications", "submissions", "certificates", "profile"] as const;
export type ClientTab = (typeof TAB_IDS)[number];

function ClientDashboard() {
  const { data, loading, error, refresh } = useDashboardData();
  const [tab, setTab] = useTabParam<ClientTab>(TAB_IDS, "overview");

  if (loading) return <LoadingScreen text="Loading your client workspace…" />;
  if (error || !data) return <LoadingScreen text={error ?? "Something went wrong."} />;

  const { profile, projects, applications, submissions, certificates } = data;
  const pendingApps = applications.filter(a => a.status === "PENDING" || a.status === "SHORTLISTED").length;
  const reviewQueue = submissions.filter(s => s.status === "SUBMITTED").length;
  const activeProjects = projects.filter(p => p.status === "ACTIVE").length;

  const tabs: TabDef<ClientTab>[] = [
    { id: "overview",     label: "Overview",          icon: "🏠" },
    { id: "post-project", label: "Post a Project",    icon: "➕" },
    { id: "projects",     label: "My Projects",       icon: "🚀", badge: activeProjects },
    { id: "applications", label: "Applications",      icon: "📋", badge: pendingApps },
    { id: "submissions",  label: "Review Submissions", icon: "📤", badge: reviewQueue, badgeColor: "#E53E3E" },
    { id: "certificates", label: "Issued Certificates", icon: "🏅" },
    { id: "profile",      label: "Edit Profile",      icon: "✏️" },
  ];

  return (
    <DashboardShell
      navId="client-dashboard-navigation"
      workspaceLabel="Client Workspace"
      userName={profile.name}
      userSubline={profile.clientType ? CLIENT_TYPE_LABEL[profile.clientType] : profile.email}
      userBadge={<VerificationBadge status={profile.verificationStatus} />}
      tabs={tabs}
      activeTab={tab}
      onTabChange={setTab}
      onSignOut={signOut}
      headerActions={
        <>
          <button onClick={() => setTab("post-project")} style={{ marginLeft: 8, padding: "6px 14px", background: "var(--gold)", color: "var(--navy)", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>+ Post project</button>
          <button onClick={() => setTab("profile")} style={{ padding: "6px 14px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Edit profile</button>
        </>
      }
      sidebarExtra={
        <SidebarStats title="Summary" rows={[
          { label: "Active projects", value: activeProjects },
          { label: "Applications", value: applications.length, color: "#3182CE" },
          { label: "Review queue", value: reviewQueue, color: reviewQueue > 0 ? "#E53E3E" : "var(--ink-subtle)" },
          { label: "Certificates", value: certificates.length, color: "var(--success)" },
        ]} />
      }
    >
      {tab === "overview"     && <OverviewTab data={data} goTo={setTab} onChanged={refresh} />}
      {tab === "post-project" && <PostProjectTab clientName={profile.name} onCreated={() => { void refresh(); setTab("projects"); }} />}
      {tab === "projects"     && <ProjectsTab projects={projects} applications={applications} goTo={setTab} onChanged={refresh} />}
      {tab === "applications" && <ApplicationsTab applications={applications} projects={projects} onChanged={refresh} />}
      {tab === "submissions"  && <SubmissionsTab submissions={submissions} onChanged={refresh} />}
      {tab === "certificates" && <CertificatesTab certificates={certificates} onChanged={refresh} />}
      {tab === "profile"      && <ProfileTab profile={profile} onSaved={refresh} />}
    </DashboardShell>
  );
}

export default function ClientDashboardPage() {
  return (
    <Suspense fallback={<LoadingScreen text="Loading your client workspace…" />}>
      <ClientDashboard />
    </Suspense>
  );
}
