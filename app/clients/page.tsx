"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/Button";
import { CLIENT_TYPE_LABEL, type ClientType, type VerificationStatus } from "@/lib/enums";

interface ApiClient {
  id: string;
  name: string;
  clientType: ClientType | null;
  verificationStatus: VerificationStatus;
  bio: string | null;
  website: string | null;
  avatarUrl: string | null;
  location: string | null;
  industry: string | null;
  _count: { projectsPosted: number; certificatesIssued: number };
}

const TYPE_FILTERS = ["All", "Organization", "Individual"] as const;

export default function ClientsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<(typeof TYPE_FILTERS)[number]>("All");
  const [showAll, setShowAll] = useState(false);
  const [clients, setClients] = useState<ApiClient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/clients");
        if (res.ok) {
          const data = await res.json();
          setClients(data.clients as ApiClient[]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const needle = searchQuery.trim().toLowerCase();
  const filtered = clients.filter((c) => {
    const matchesSearch = !needle ||
      c.name.toLowerCase().includes(needle) ||
      (c.bio ?? "").toLowerCase().includes(needle) ||
      (c.location ?? "").toLowerCase().includes(needle) ||
      (c.industry ?? "").toLowerCase().includes(needle);
    const matchesType = typeFilter === "All" || (c.clientType && CLIENT_TYPE_LABEL[c.clientType] === typeFilter);
    return matchesSearch && matchesType;
  });
  const displayed = showAll ? filtered : filtered.slice(0, 6);

  return (
    <div className="flex flex-col min-h-screen">
      <section className="bg-gradient-to-b from-navy-dark to-navy text-paper py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#C9A227_1px,transparent_1px),linear-gradient(to_bottom,#C9A227_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider bg-gold/15 text-gold border border-gold/30">Clients</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Who posts projects on <span className="text-gold">CertiTask</span></h1>
          <p className="text-paper/85 text-lg max-w-2xl mx-auto leading-relaxed">
            Organizations and individuals who post real work and issue certificates when it&apos;s done well.
          </p>
        </div>
      </section>

      <section className="py-20 bg-paper text-ink flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="bg-white p-6 rounded-xl border border-navy/5 shadow-xs space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-3 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-navy/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  id="client-search"
                  type="text"
                  placeholder="Search by name, industry or location…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-paper border border-navy/15 rounded-lg text-ink font-sans focus:outline-hidden focus:ring-2 focus:ring-gold/50 focus:border-gold transition-colors text-sm"
                />
              </div>
              <Button variant="primary" onClick={() => { setSearchQuery(""); setTypeFilter("All"); setShowAll(false); }} className="w-full">Reset</Button>
            </div>
            <div className="flex flex-wrap gap-2 pt-2 border-t border-navy/5">
              {TYPE_FILTERS.map((t) => (
                <button key={t} onClick={() => setTypeFilter(t)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide border transition-all cursor-pointer ${typeFilter === t ? "bg-navy text-gold border-navy" : "bg-paper text-navy border-navy/10 hover:border-gold hover:text-gold"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center text-sm text-ink/70">
            <p>Showing <span className="font-bold text-navy">{filtered.length}</span> client{filtered.length === 1 ? "" : "s"}</p>
          </div>

          {loading ? (
            <div className="text-center py-16"><p className="text-navy font-bold">Loading clients…</p></div>
          ) : filtered.length > 0 ? (
            <div className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayed.map((c) => (
                  <div key={c.id} className="bg-white p-6 rounded-xl border border-navy/5 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="h-12 w-12 rounded-lg bg-navy flex items-center justify-center text-gold font-bold text-lg shrink-0">{c.name.charAt(0).toUpperCase()}</div>
                        <div className="min-w-0">
                          <h3 className="font-sans font-bold text-lg text-navy leading-tight truncate">{c.name}</h3>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {c.clientType && <span className="inline-block text-[10px] font-semibold text-gold bg-gold/10 px-2 py-0.5 rounded border border-gold/10">{CLIENT_TYPE_LABEL[c.clientType]}</span>}
                            {c.verificationStatus === "VERIFIED" && <span className="inline-block text-[10px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">✓ Verified</span>}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-ink/80 leading-relaxed mb-6">{c.bio || "No description yet."}</p>
                    </div>
                    <div className="space-y-4 pt-4 border-t border-navy/5">
                      <div className="flex items-center justify-between text-xs text-ink/75">
                        <span>{[c.industry, c.location].filter(Boolean).join(" · ") || "—"}</span>
                        <span className="font-semibold text-gold">{c._count.projectsPosted} open · {c._count.certificatesIssued} issued</span>
                      </div>
                      <Link href={`/clients/${c.id}`} className="w-full py-2.5 rounded-lg border border-navy/15 text-navy text-xs font-bold hover:bg-navy hover:text-paper hover:border-navy transition-all duration-300 cursor-pointer text-center inline-block">
                        View profile
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              {!showAll && filtered.length > 6 && (
                <div className="text-center pt-4">
                  <button onClick={() => setShowAll(true)} className="inline-flex items-center justify-center px-10 py-3.5 rounded-lg bg-navy text-gold hover:bg-navy-dark text-sm font-bold transition-all duration-300 cursor-pointer border border-gold/15">
                    Show all ({filtered.length})
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl border border-navy/5">
              <h3 className="font-sans font-bold text-xl text-navy mb-2">No clients found</h3>
              <p className="text-sm text-ink/70">Try a different search or filter.</p>
            </div>
          )}
        </div>
      </section>

      <section className="py-20 bg-navy text-paper text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl font-extrabold text-paper tracking-tight">Have a project that needs doing?</h2>
          <p className="text-paper/80 max-w-xl mx-auto">Post it, pick a team, review the work, and issue a certificate anyone can verify. Individuals and organizations welcome.</p>
          <div className="pt-4"><Button href="/auth/signup" variant="gold">Post a project</Button></div>
        </div>
      </section>
    </div>
  );
}
