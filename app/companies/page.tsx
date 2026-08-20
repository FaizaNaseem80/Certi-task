"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/Button";

interface Company {
  id: string;
  name: string;
  industry: string;
  description: string;
  location: string;
  logoChar: string;
  jobsCount: number;
}

const categories = ["All", "Technology", "Fintech", "Design & Media", "Healthcare & Biotech", "Edtech", "Energy & Tech"];

export default function CompaniesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showAll, setShowAll] = useState(false);
  const [dbCompanies, setDbCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await fetch("/api/companies");
        if (res.ok) {
          const data = await res.json();
          const mapped = data.companies.map((c: any) => ({
            id: c.id,
            name: c.name,
            industry: c.domain || "Technology",
            description: c.bio || "Corporate sponsor actively hiring through CertiTask.",
            location: c.website || "Global",
            logoChar: c.name.charAt(0).toUpperCase(),
            jobsCount: c._count.projects,
          }));
          setDbCompanies(mapped);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  const filteredCompanies = dbCompanies.filter((company) => {
    const matchesSearch =
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || company.industry === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const displayedCompanies = showAll ? filteredCompanies : filteredCompanies.slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Page Header */}
      <section className="bg-gradient-to-b from-navy-dark to-navy text-paper py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#C9A227_1px,transparent_1px),linear-gradient(to_bottom,#C9A227_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider bg-gold/15 text-gold border border-gold/30">
            Featured Companies
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Discover Our <span className="text-gold">Corporate Partners</span>
          </h1>
          <p className="text-paper/85 text-lg max-w-2xl mx-auto leading-relaxed">
            CertiTask partners with leading enterprises to deliver vetted opportunities directly to you. Filter, search, and view profiles.
          </p>
        </div>
      </section>

      {/* Directory & Filters Section */}
      <section className="py-20 bg-paper text-ink flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Search and Filters Bar */}
          <div className="bg-white p-6 rounded-xl border border-navy/5 shadow-xs space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search Bar Input */}
              <div className="md:col-span-3 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-navy/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by company name, keywords, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-paper border border-navy/15 rounded-lg text-ink font-sans focus:outline-hidden focus:ring-2 focus:ring-gold/50 focus:border-gold transition-colors text-sm"
                />
              </div>
              <Button
                variant="primary"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                  setShowAll(false);
                }}
                className="w-full"
              >
                Reset Filters
              </Button>
            </div>

            {/* Category Tags */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-navy/5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide border transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-navy text-gold border-navy"
                      : "bg-paper text-navy border-navy/10 hover:border-gold hover:text-gold"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex justify-between items-center text-sm text-ink/70">
            <p>
              Showing <span className="font-bold text-navy">{filteredCompanies.length}</span> {filteredCompanies.length === 1 ? "company" : "companies"}
            </p>
            {selectedCategory !== "All" && (
              <p>
                Filtered by: <span className="font-bold text-gold">{selectedCategory}</span>
              </p>
            )}
          </div>

          {/* Company Cards Grid */}
          {loading ? (
            <div className="text-center py-16">
              <p className="text-navy font-bold">Loading registered companies...</p>
            </div>
          ) : filteredCompanies.length > 0 ? (
            <div className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayedCompanies.map((company) => (
                  <div
                    key={company.name}
                    className="bg-white p-6 rounded-xl border border-navy/5 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="h-12 w-12 rounded-lg bg-navy flex items-center justify-center text-gold font-bold text-lg shrink-0">
                          {company.logoChar}
                        </div>
                        <div>
                          <h3 className="font-sans font-bold text-lg text-navy leading-tight">{company.name}</h3>
                          <span className="inline-block text-[10px] font-semibold text-gold bg-gold/10 px-2 py-0.5 rounded border border-gold/10 mt-1">
                            {company.industry}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-ink/80 leading-relaxed mb-6">
                        {company.description}
                      </p>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-navy/5">
                      <div className="flex items-center justify-between text-xs text-ink/75">
                        <span className="flex items-center gap-1">
                          <svg className="h-4 w-4 text-gold shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          {company.location}
                        </span>
                        <span className="font-semibold text-gold">{company.jobsCount} open roles</span>
                      </div>
                      <button
                        onClick={() => alert(`Redirecting to details page for ${company.name} (API and Profile details are mock for this phase)`)}
                        className="w-full py-2.5 rounded-lg border border-navy/15 text-navy text-xs font-bold hover:bg-navy hover:text-paper hover:border-navy transition-all duration-300 cursor-pointer text-center"
                      >
                        View Company
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {!showAll && filteredCompanies.length > 3 && (
                <div className="text-center pt-4">
                  <button
                    onClick={() => setShowAll(true)}
                    className="inline-flex items-center justify-center px-10 py-3.5 rounded-lg bg-navy text-gold hover:bg-navy-dark text-sm font-bold transition-all duration-300 cursor-pointer border border-gold/15"
                  >
                    View All Companies ({filteredCompanies.length})
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl border border-navy/5">
              <svg className="h-12 w-12 text-gold mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="font-sans font-bold text-xl text-navy mb-2">No Companies Found</h3>
              <p className="text-sm text-ink/70">
                Try widening your search keywords or choosing a different category.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-navy text-paper text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl font-extrabold text-paper tracking-tight">Are You A Company Partner?</h2>
          <p className="text-paper/80 max-w-xl mx-auto">
            Find vetted talent fast. Post roles, view candidate verification status, and create custom pipelines.
          </p>
          <div className="pt-4">
            <Button href="/contact" variant="gold">
              Get in Touch with Sales
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
