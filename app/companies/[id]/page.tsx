"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Company {
  id: string;
  name: string;
  email: string;
  bio: string;
  domain: string;
  website: string;
  logoUrl: string;
  phone: string;
  location: string;
  companySize: string;
  industry: string;
  foundedYear: number;
  companyDescription: string;
  companyWebsite: string;
  linkedinUrl: string;
  createdAt: string;
  _count: {
    projects: number;
  };
  projects: Array<{
    id: string;
    title: string;
    description: string;
    status: string;
    deadline: string;
    _count: {
      applications: number;
      submissions: number;
    };
  }>;
}

export default function CompanyDetailPage() {
  const params = useParams();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const res = await fetch(`/api/companies/${params.id}`);
        if (!res.ok) throw new Error("Company not found");
        const data = await res.json();
        setCompany(data.company);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyDetails();
  }, [params.id]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-navy font-bold">Loading company details...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 font-bold">{error}</p>
          <Link href="/companies" className="text-gold hover:underline mt-4 inline-block">
            Back to Companies
          </Link>
        </div>
      </div>
    );

  if (!company)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-navy font-bold">Company not found</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-paper">
      {/* Header */}
      <section className="bg-gradient-to-b from-navy-dark to-navy text-paper py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/companies" className="text-gold hover:underline text-sm mb-4 inline-block">
            ← Back to Companies
          </Link>
          <div className="flex items-start gap-6">
            <div className="h-20 w-20 rounded-lg bg-gold flex items-center justify-center text-navy font-bold text-2xl shrink-0">
              {company.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{company.name}</h1>
              <div className="flex flex-wrap gap-4 text-paper/90">
                {company.industry && (
                  <span className="flex items-center gap-1">
                    <span className="text-gold">●</span> {company.industry}
                  </span>
                )}
                {company.location && (
                  <span className="flex items-center gap-1">
                    <span className="text-gold">●</span> {company.location}
                  </span>
                )}
                {company.companySize && (
                  <span className="flex items-center gap-1">
                    <span className="text-gold">●</span> {company.companySize} employees
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* About Section */}
              <div className="bg-white rounded-xl border border-navy/5 p-8">
                <h2 className="text-2xl font-bold text-navy mb-4">About {company.name}</h2>
                <p className="text-ink/80 leading-relaxed mb-6">
                  {company.companyDescription || company.bio || "No description available"}
                </p>
                {company.foundedYear && (
                  <p className="text-sm text-ink/70">
                    <span className="font-semibold text-navy">Founded:</span> {company.foundedYear}
                  </p>
                )}
              </div>

              {/* Projects Section */}
              <div className="bg-white rounded-xl border border-navy/5 p-8">
                <h2 className="text-2xl font-bold text-navy mb-6">
                  Open Projects ({company.projects.length})
                </h2>
                {company.projects.length > 0 ? (
                  <div className="space-y-4">
                    {company.projects.map((project) => (
                      <Link
                        key={project.id}
                        href={`/projects/${project.id}`}
                        className="block p-4 border border-navy/10 rounded-lg hover:border-gold hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-bold text-navy hover:text-gold transition-colors">
                              {project.title}
                            </h3>
                            <p className="text-sm text-ink/70 mt-2">
                              {project.description.substring(0, 100)}...
                            </p>
                            <div className="flex gap-4 mt-3 text-xs text-ink/60">
                              <span>Deadline: {project.deadline}</span>
                              <span>•</span>
                              <span>{project._count.applications} applications</span>
                            </div>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 ml-4 ${
                              project.status === "Active"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {project.status}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-ink/70">No active projects at this time</p>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Card */}
              <div className="bg-white rounded-xl border border-navy/5 p-6 space-y-4">
                <h3 className="font-bold text-navy text-lg">Contact Information</h3>
                {company.email && (
                  <div>
                    <p className="text-xs text-ink/70 uppercase tracking-wide font-semibold">Email</p>
                    <a
                      href={`mailto:${company.email}`}
                      className="text-gold hover:underline font-mono text-sm mt-1 break-all"
                    >
                      {company.email}
                    </a>
                  </div>
                )}
                {company.phone && (
                  <div>
                    <p className="text-xs text-ink/70 uppercase tracking-wide font-semibold">Phone</p>
                    <p className="text-navy font-mono text-sm mt-1">{company.phone}</p>
                  </div>
                )}
                {company.companyWebsite && (
                  <div>
                    <p className="text-xs text-ink/70 uppercase tracking-wide font-semibold">Website</p>
                    <a
                      href={company.companyWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gold hover:underline text-sm mt-1 break-all"
                    >
                      {company.companyWebsite}
                    </a>
                  </div>
                )}
                {company.linkedinUrl && (
                  <div>
                    <p className="text-xs text-ink/70 uppercase tracking-wide font-semibold">LinkedIn</p>
                    <a
                      href={company.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gold hover:underline text-sm mt-1 block"
                    >
                      View Profile →
                    </a>
                  </div>
                )}
              </div>

              {/* Stats Card */}
              <div className="bg-white rounded-xl border border-navy/5 p-6">
                <h3 className="font-bold text-navy text-lg mb-4">Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-navy/10">
                    <span className="text-ink/70">Total Projects</span>
                    <span className="font-bold text-navy text-lg">{company._count.projects}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-navy/10">
                    <span className="text-ink/70">Member Since</span>
                    <span className="text-sm font-semibold text-navy">
                      {new Date(company.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button className="w-full py-3 bg-gold text-navy font-bold rounded-lg hover:bg-gold/90 transition-all">
                Apply to Projects
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
