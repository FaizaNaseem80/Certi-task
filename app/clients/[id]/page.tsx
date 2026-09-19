"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CLIENT_TYPE_LABEL, PROJECT_CATEGORY_LABEL, statusLabel, type ClientType, type ProjectCategory, type VerificationStatus } from "@/lib/enums";

interface ClientDetail {
  id: string;
  name: string;
  clientType: ClientType | null;
  verificationStatus: VerificationStatus;
  bio: string | null;
  website: string | null;
  avatarUrl: string | null;
  location: string | null;
  industry: string | null;
  organizationSize: string | null;
  foundedYear: number | null;
  linkedinUrl: string | null;
  createdAt: string;
  _count: { projectsPosted: number; certificatesIssued: number };
  projectsPosted: Array<{
    id: string; title: string; description: string; category: ProjectCategory; requiredSkills: string[];
    status: string; deadline: string; teamCap: number; _count: { applications: number; submissions: number };
  }>;
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function ClientDetailPage() {
  const params = useParams();
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/clients/${params.id}`);
        if (!res.ok) throw new Error("Client not found");
        const data = await res.json();
        setClient(data.client);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Client not found");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.id]);

  if (loading) return <div className="flex justify-center items-center min-h-screen"><p className="text-navy font-bold">Loading…</p></div>;
  if (error || !client) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <p className="text-red-600 font-bold">{error || "Client not found"}</p>
        <Link href="/clients" className="text-gold hover:underline mt-4 inline-block">← Back to clients</Link>
      </div>
    </div>
  );

  const verified = client.verificationStatus === "VERIFIED";
  const open = client.projectsPosted.filter(p => p.status === "ACTIVE");
  const past = client.projectsPosted.filter(p => p.status !== "ACTIVE");

  const ProjectCard = ({ p }: { p: ClientDetail["projectsPosted"][number] }) => (
    <Link href={`/projects/${p.id}`} className="block border border-navy/10 rounded-lg p-5 hover:border-gold transition-colors">
      <div className="flex justify-between items-start gap-3 mb-2 flex-wrap">
        <div>
          <span className="text-[10px] font-bold text-gold uppercase">{PROJECT_CATEGORY_LABEL[p.category]}</span>
          <h3 className="font-bold text-navy text-lg">{p.title}</h3>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-semibold ${p.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>{statusLabel(p.status)}</span>
      </div>
      <p className="text-sm text-ink/80 mb-3 line-clamp-2">{p.description}</p>
      <div className="flex flex-wrap gap-1 mb-3">
        {p.requiredSkills.slice(0, 6).map(s => <span key={s} className="text-[11px] font-semibold text-navy bg-navy/5 border border-navy/10 rounded px-2 py-0.5">{s}</span>)}
      </div>
      <div className="flex gap-4 text-xs text-ink/70 flex-wrap">
        <span>📅 {fmt(p.deadline)}</span>
        <span>👥 Team up to {p.teamCap}</span>
        <span>📋 {p._count.applications} applications</span>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-paper">
      <section className="bg-gradient-to-b from-navy-dark to-navy text-paper py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/clients" className="text-gold hover:underline text-sm mb-4 inline-block">← Back to clients</Link>
          <div className="flex items-start gap-6 flex-wrap">
            <div className="h-20 w-20 rounded-lg bg-gold flex items-center justify-center text-navy font-bold text-2xl shrink-0">{client.name.charAt(0).toUpperCase()}</div>
            <div className="flex-1 min-w-0">
              <h1 className="text-4xl font-bold mb-2 break-words">{client.name}</h1>
              <div className="flex flex-wrap gap-3 text-paper/90 text-sm items-center">
                {client.clientType && <span className="px-2 py-0.5 rounded bg-gold/15 text-gold text-xs font-bold">{CLIENT_TYPE_LABEL[client.clientType]}</span>}
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${verified ? "bg-green-500/20 text-green-200" : "bg-white/10 text-paper/70"}`}>{verified ? "✓ Verified" : "Not yet verified"}</span>
                {client.industry && <span>● {client.industry}</span>}
                {client.location && <span>● {client.location}</span>}
                {client.organizationSize && <span>● {client.organizationSize} people</span>}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-xl border border-navy/5 p-8">
                <h2 className="text-2xl font-bold text-navy mb-4">About</h2>
                <p className="text-ink/80 leading-relaxed whitespace-pre-wrap">{client.bio || "No description yet."}</p>
                {client.foundedYear && <p className="text-sm text-ink/70 mt-4"><span className="font-semibold text-navy">Founded:</span> {client.foundedYear}</p>}
              </div>

              <div className="bg-white rounded-xl border border-navy/5 p-8">
                <h2 className="text-2xl font-bold text-navy mb-6">Open projects ({open.length})</h2>
                {open.length > 0 ? <div className="space-y-4">{open.map(p => <ProjectCard key={p.id} p={p} />)}</div> : <p className="text-ink/70">No open projects right now.</p>}
              </div>

              {past.length > 0 && (
                <div className="bg-white rounded-xl border border-navy/5 p-8">
                  <h2 className="text-2xl font-bold text-navy mb-6">Past projects ({past.length})</h2>
                  <div className="space-y-4">{past.map(p => <ProjectCard key={p.id} p={p} />)}</div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-navy/5 p-6">
                <h3 className="font-bold text-navy mb-4">Links</h3>
                <div className="space-y-3 text-sm">
                  {client.website && <a href={client.website} target="_blank" rel="noopener noreferrer" className="block text-gold hover:underline break-all">🌐 {client.website.replace(/^https?:\/\//, "")}</a>}
                  {client.linkedinUrl && <a href={client.linkedinUrl} target="_blank" rel="noopener noreferrer" className="block text-gold hover:underline">💼 LinkedIn</a>}
                  {!client.website && !client.linkedinUrl && <p className="text-ink/60">No links added.</p>}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-navy/5 p-6">
                <h3 className="font-bold text-navy mb-4">Activity</h3>
                <div className="space-y-3">
                  <div className="flex justify-between"><span className="text-ink/70 text-sm">Projects posted</span><span className="font-bold text-navy">{client._count.projectsPosted}</span></div>
                  <div className="flex justify-between"><span className="text-ink/70 text-sm">Certificates issued</span><span className="font-bold text-navy">{client._count.certificatesIssued}</span></div>
                  <div className="flex justify-between"><span className="text-ink/70 text-sm">Member since</span><span className="font-bold text-navy">{fmt(client.createdAt)}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
