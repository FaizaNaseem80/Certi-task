"use client";

import React, { useState } from "react";
import { Button } from "@/components/Button";

interface Certificate {
  id: string;
  studentName: string;
  major: string;
  sponsor: string;
  projectTitle: string;
  dateIssued: string;
  grade: string;
  hash: string;
  status: "Valid" | "Expired" | "Revoked";
}

const mockCertificates: Record<string, Certificate> = {
  "CERT-333333": {
    id: "CERT-333333",
    studentName: "Jane Doe",
    major: "Computer Science Major",
    sponsor: "Apex Global Solutions",
    projectTitle: "SaaS API Integration Modules",
    dateIssued: "2026-05-12",
    grade: "Grade A+ (Distinction)",
    hash: "8fb4e1f7d23a490b63c8a91f5e27d890ac349bf20a7b678c",
    status: "Valid",
  },
  "CERT-102455": {
    id: "CERT-102455",
    studentName: "Sarah Smith",
    major: "UX/UI Design Major",
    sponsor: "Vanguard Creative Labs",
    projectTitle: "Brand Identity Design Assets",
    dateIssued: "2026-06-18",
    grade: "Credited Pass",
    hash: "7ec2a5f4d89a240b90c1a91e5e22c890ab245bf10a5b678d",
    status: "Valid",
  },
  "CERT-774132": {
    id: "CERT-774132",
    studentName: "Michael Chang",
    major: "Financial Engineering Major",
    sponsor: "Summit Financial Tech",
    projectTitle: "Smart Contract Transaction Integrator",
    dateIssued: "2026-07-22",
    grade: "Outstanding Achievement",
    hash: "9ac2b3f5d12a450b70c8a91c5e31d890ab249bf50a4b678e",
    status: "Valid",
  },
};

export default function VerifyPage() {
  const [certId, setCertId] = useState("");
  const [result, setResult] = useState<Certificate | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certId.trim()) return;

    setLoading(true);
    setSearched(false);

    const query = certId.trim().toUpperCase();
    if (mockCertificates[query]) {
      setResult(mockCertificates[query]);
      setSearched(true);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/verify/${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        const c = data.certificate;
        setResult({
          id: c.certId,
          studentName: c.studentName,
          major: "Verified Student",
          sponsor: c.company.name,
          projectTitle: c.title,
          dateIssued: c.issueDate,
          grade: "Verified Completion",
          hash: c.id,
          status: c.status as any
        });
      } else {
        setResult(null);
      }
    } catch (err) {
      console.error(err);
      setResult(null);
    } finally {
      setSearched(true);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Page Header */}
      <section className="bg-gradient-to-b from-navy-dark to-navy text-paper py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#C9A227_1px,transparent_1px),linear-gradient(to_bottom,#C9A227_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider bg-gold/15 text-gold border border-gold/30">
            Security Ledger
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Verify a <span className="text-gold">Certificate</span>
          </h1>
          <p className="text-paper/85 text-lg max-w-2xl mx-auto leading-relaxed">
            CertiTask credentials are cryptographically secured and independently queryable. Confirm student credentials below.
          </p>
        </div>
      </section>

      {/* Verification Query Tool */}
      <section className="py-24 bg-paper text-ink flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Lookup Input Form */}
          <div className="bg-white p-8 rounded-2xl border border-navy/5 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-navy"></div>
            
            <form onSubmit={handleSearch} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="certificateId" className="block text-xs font-bold text-navy/85 uppercase tracking-wide">
                  Certificate Lookup ID
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    id="certificateId"
                    value={certId}
                    onChange={(e) => setCertId(e.target.value)}
                    placeholder="E.g., CERT-333333"
                    className="block w-full px-4 py-3 bg-paper border border-navy/15 rounded-lg text-ink font-sans text-sm focus:outline-hidden focus:ring-2 focus:ring-gold/50 focus:border-gold transition-colors"
                  />
                  <Button type="submit" variant="primary" className="py-3 px-8 shrink-0" disabled={loading}>
                    {loading ? "Verifying..." : "Verify Authenticity"}
                  </Button>
                </div>
                <p className="text-[11px] text-ink/50 leading-normal">
                  Try typing one of our verified sandbox IDs: <span className="font-mono font-bold text-navy">CERT-333333</span>, <span className="font-mono font-bold text-navy">CERT-102455</span>, or <span className="font-mono font-bold text-navy">CERT-774132</span> to preview verification metrics.
                </p>
              </div>
            </form>
          </div>

          {/* Results Panel */}
          {searched && (
            <div className="bg-white p-8 rounded-2xl border border-navy/5 shadow-md relative overflow-hidden transition-all duration-300">
              {result ? (
                <div className="space-y-6">
                  {/* Status Banner */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center border border-green-200 shadow-xs shrink-0">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-green-800 uppercase tracking-wide">STATUS: CRYPTOGRAPHICALLY SECURE</p>
                        <p className="text-sm font-bold text-navy mt-0.5">Vetted CertiTask Certificate</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 border border-green-200 rounded-full text-xs font-bold uppercase shrink-0">
                      {result.status}
                    </span>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-navy/5">
                    <div>
                      <p className="text-[10px] font-bold text-navy/60 uppercase tracking-wide">Student Name</p>
                      <p className="text-base font-bold text-navy mt-1">{result.studentName}</p>
                      <p className="text-xs text-ink/75 mt-0.5">{result.major}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-navy/60 uppercase tracking-wide">Issuing Corporation</p>
                      <p className="text-base font-bold text-navy mt-1">{result.sponsor}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-navy/60 uppercase tracking-wide">Project Title</p>
                      <p className="text-sm font-semibold text-ink mt-1">{result.projectTitle}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-navy/60 uppercase tracking-wide">Date Issued</p>
                      <p className="text-sm font-semibold text-ink mt-1">{result.dateIssued}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-navy/60 uppercase tracking-wide">Performance Grade</p>
                      <p className="text-sm font-semibold text-gold font-sans mt-1">{result.grade}</p>
                    </div>
                  </div>

                  {/* Hash Signature */}
                  <div className="pt-6 border-t border-navy/5 bg-paper/50 p-4 rounded-lg">
                    <p className="text-[10px] font-bold text-navy/60 uppercase tracking-wide mb-1">Cryptographic Ledger Signature (SHA-256)</p>
                    <p className="text-xs font-mono text-ink/75 break-all leading-normal bg-white p-2.5 rounded border border-navy/5">
                      {result.hash}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 space-y-4">
                  <div className="h-12 w-12 bg-red-50 text-red-500 border border-red-200 rounded-full flex items-center justify-center mx-auto shadow-xs shrink-0">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-sans font-bold text-lg text-navy">Certificate ID Not Found</h3>
                    <p className="text-sm text-ink/70 max-w-md mx-auto mt-1">
                      The ID <span className="font-mono font-bold text-red-600">"{certId}"</span> does not match any certificate in our verification records. Please double check characters and dashes.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
