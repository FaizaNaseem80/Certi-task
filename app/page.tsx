import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/Button";



export default async function Home() {
  const dbCompanies = await prisma.user.findMany({
    where: { role: "COMPANY" },
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  const featuredCompanies = dbCompanies.map((c) => ({
    name: c.name,
    industry: c.domain || "Technology",
    description: c.bio || "Corporate sponsor actively hiring through CertiTask.",
    location: c.website || "Global",
    logoChar: c.name.charAt(0).toUpperCase(),
  }));

  const displayCompanies = featuredCompanies;

  const steps = [
    {
      number: "01",
      title: "Companies Post Real Projects",
      description: "Companies post short, well-defined real-world projects outlining exactly what needs to be built.",
    },
    {
      number: "02",
      title: "Students Apply & Build",
      description: "Students find suitable projects, assemble teams, and work on them using real developer workflows.",
    },
    {
      number: "03",
      title: "Companies Review the Work",
      description: "Completed features are submitted directly to company sponsors for review, feedback, and signoff.",
    },
    {
      number: "04",
      title: "Earn Verified Proof",
      description: "Once approved, students receive an immutable digital CertiTask certificate listing their direct contributions.",
    },
  ];

  const benefits = [
    {
      title: "Real-world Project Experience",
      description: "Graduate beyond generic tutorial apps. Build actual product components that companies run.",
      icon: (
        <svg className="h-6 w-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: "Verified Certificates",
      description: "Every achievement is backed by corporate signoff, preventing resume inflation.",
      icon: (
        <svg className="h-6 w-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      title: "Faster Than Internships",
      description: "Compact, project-based timelines that fit around your class schedules and semester workloads.",
      icon: (
        <svg className="h-6 w-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "Team-based Work",
      description: "Collaborate in cross-functional student teams, imitating real-world corporate agile environments.",
      icon: (
        <svg className="h-6 w-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      title: "Recruiter-Verifiable Proof",
      description: "Provide third parties with direct, secure, and authenticated access to review your exact contributions.",
      icon: (
        <svg className="h-6 w-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
        </svg>
      ),
    },
    {
      title: "Free for Students",
      description: "Absolutely zero application fees or registration costs for students. Work and earn without barriers.",
      icon: (
        <svg className="h-6 w-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 16V3" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative bg-gradient-to-b from-navy-dark to-navy text-paper pt-24 pb-28 md:py-36 overflow-hidden">
        {/* Aesthetic Grid Background */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#C9A227_1px,transparent_1px),linear-gradient(to_bottom,#C9A227_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-gold/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-gold/5 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Heading, Subtext, Buttons */}
            <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider bg-gold/15 text-gold border border-gold/30">
                🚀 A Modern Experience Ecosystem
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight sm:leading-none">
                Ready to Build Your <br />
                <span className="text-gold">Verified Future?</span>
              </h1>
              <p className="text-paper/85 text-lg sm:text-xl max-w-2xl mx-auto lg:mx-0 leading-relaxed font-sans">
                Work on real projects. Build real experience. Earn certificates that recruiters can actually verify.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <Button href="/projects" variant="gold" className="w-full sm:w-auto px-8 py-3.5 text-base">
                  Explore Projects
                </Button>
                <Button href="/contact" variant="outline" className="w-full sm:w-auto px-8 py-3.5 text-base border-paper text-paper hover:bg-paper hover:text-navy">
                  For Companies
                </Button>
              </div>
            </div>

            {/* Right Column: Visual Dashboard Mock */}
            <div className="lg:col-span-5 relative mt-8 lg:mt-0">
              <div className="relative mx-auto max-w-md lg:max-w-none bg-navy-dark/60 backdrop-blur-md rounded-2xl border border-gold/20 shadow-2xl p-6 overflow-hidden">
                <div className="flex items-center justify-between pb-4 border-b border-paper/10 mb-6">
                  <div className="flex space-x-1.5">
                    <span className="h-3 w-3 rounded-full bg-red-500"></span>
                    <span className="h-3 w-3 rounded-full bg-yellow-500"></span>
                    <span className="h-3 w-3 rounded-full bg-green-500"></span>
                  </div>
                  <span className="text-[10px] font-mono text-gold/80 bg-gold/10 px-2 py-0.5 rounded">certitask-public_showcase</span>
                </div>

                <div className="space-y-4 font-sans text-xs">
                  <div className="bg-navy/80 p-3 rounded-lg border border-gold/15 flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-paper text-sm">Certificate #CERT-333333</h4>
                      <p className="text-[10px] text-paper/60">Issued to: Jane Doe (CS Major)</p>
                    </div>
                    <span className="text-[10px] px-2 py-1 bg-gold/10 text-gold border border-gold/30 rounded font-semibold">Verify</span>
                  </div>

                  <div className="bg-navy/55 p-3 rounded-lg border border-paper/5 space-y-2">
                    <div className="flex justify-between items-center text-paper/85 font-semibold text-xs">
                      <span>Apex Global: API Integration Project</span>
                      <span className="text-gold font-bold">100% Verified</span>
                    </div>
                    <p className="text-[10px] text-paper/60">Skills demonstrated: Next.js, Node.js, REST APIs, TypeScript.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-24 bg-navy-dark text-paper relative scroll-mt-20">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#C9A227_1px,transparent_1px)] [background-size:24px_24px]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-xs font-bold text-gold tracking-widest uppercase">The Pipeline</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-paper tracking-tight">How It Works</p>
            <p className="text-lg text-paper/75">
              CertiTask provides a simple, structured method for students to gain verified experience.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
              <div key={step.title} className="relative bg-navy p-6 rounded-xl border border-gold/10">
                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 translate-x-1/2 z-20">
                    <svg className="h-6 w-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
                <div className="font-mono text-4xl font-black text-gold/30 mb-4">{step.number}</div>
                <h3 className="font-sans font-bold text-lg text-paper mb-2">{step.title}</h3>
                <p className="text-sm text-paper/70 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. WHY CERTITASK SECTION */}
      <section className="py-24 bg-paper text-ink">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-xs font-bold text-gold tracking-widest uppercase">Value Proposition</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">Why CertiTask?</h3>
            <p className="text-lg text-ink/75 leading-relaxed">
              We bridge the gap between classroom learnings and industry demands with high-fidelity proof.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((feat) => (
              <div
                key={feat.title}
                className="bg-white p-8 rounded-xl border border-navy/5 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="h-12 w-12 rounded-lg bg-navy flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feat.icon}
                </div>
                <h3 className="font-sans font-bold text-xl text-navy mb-3">{feat.title}</h3>
                <p className="text-sm text-ink/80 leading-relaxed">{feat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FEATURED COMPANIES SHOWCASE SECTION */}
      <section className="py-24 bg-paper text-ink border-t border-navy/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div className="space-y-3">
              <h2 className="text-xs font-bold text-gold tracking-widest uppercase">Trusted Partners</h2>
              <h3 className="text-3xl font-extrabold text-navy tracking-tight">Featured Companies</h3>
              <p className="text-sm text-ink/75 max-w-xl">
                Explore profiles, ongoing roles, and verification requirements set by our partnered firms.
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Button href="/companies" variant="outline">
                View All Companies
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {displayCompanies.length > 0 ? (
              displayCompanies.map((comp) => (
                <div
                  key={comp.name}
                  className="bg-white p-6 rounded-xl border border-navy/5 shadow-xs hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-lg bg-navy flex items-center justify-center text-gold font-bold text-lg">
                      {comp.logoChar}
                    </div>
                    <div>
                      <h4 className="font-bold text-navy text-base">{comp.name}</h4>
                      <span className="inline-block text-[10px] font-semibold text-gold bg-gold/10 px-2 py-0.5 rounded border border-gold/10 mt-1">
                        {comp.industry}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-ink/85 leading-relaxed mb-6">
                    {comp.description}
                  </p>
                  <div className="flex justify-between items-center text-xs text-ink/65 pt-4 border-t border-navy/5">
                    <span className="flex items-center gap-1">
                      <svg className="h-4 w-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {comp.location}
                    </span>
                    <Link href="/companies" className="text-gold font-semibold hover:underline">
                      View Profile &rarr;
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-1 md:col-span-3 text-center py-12 bg-white rounded-xl border border-navy/5">
                <p className="text-navy font-bold text-lg mb-2">More partners joining soon!</p>
                <p className="text-ink/60 text-sm">Check back later to see our newly featured corporate sponsors.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. FOR STUDENTS SECTION */}
      <section className="py-20 bg-navy text-paper border-t border-gold/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gold/10 text-gold border border-gold/20">
                For Students
              </span>
              <h3 className="text-3xl font-extrabold tracking-tight">
                Build your portfolio with real work, <br />
                <span className="text-gold">not just course certificates.</span>
              </h3>
              <p className="text-paper/80 leading-relaxed font-sans text-sm">
                Apply your theoretical knowledge to direct corporate project tasks. Complete real-world components, collaborate with student teammates, and walk away with verifiable proof of your skill.
              </p>
              <div className="pt-2">
                <Button href="/projects" variant="gold" className="px-6 py-3">
                  Explore Projects
                </Button>
              </div>
            </div>
            <div className="bg-navy-dark/40 p-6 rounded-xl border border-paper/10 text-xs font-mono text-paper/70 space-y-2">
              <p className="text-gold font-bold">// CERTITASK STUDENT PERKS:</p>
              <p>&gt; Work on actual company codebase branches.</p>
              <p>&gt; Collaborate in agile sprint pipelines.</p>
              <p>&gt; Receive direct feedback from tech sponsors.</p>
              <p>&gt; Build verifiable credential badges.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FOR COMPANIES SECTION */}
      <section className="py-20 bg-paper text-ink">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 bg-navy p-6 rounded-xl border border-gold/10 text-xs font-mono text-paper/85 space-y-2">
              <p className="text-gold font-bold">// RECRUITMENT SIMPLIFIED:</p>
              <p>&gt; Filter candidate pools by verified project signoffs.</p>
              <p>&gt; Inspect code quality & pull request metrics directly.</p>
              <p>&gt; Reduce typical interview vetting costs by 60%.</p>
            </div>
            <div className="order-1 md:order-2 space-y-6">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-navy/5 text-navy border border-navy/10">
                For Companies
              </span>
              <h3 className="text-3xl font-extrabold tracking-tight text-navy">
                Get focused real-world work completed <br />
                <span className="text-gold">by motivated student teams.</span>
              </h3>
              <p className="text-ink/80 leading-relaxed text-sm">
                Submit specific development tasks, UX redesigns, or integration projects. Review top student implementations and build a direct pipeline to qualified entry-level candidates.
              </p>
              <div className="pt-2">
                <Button href="/contact" variant="primary" className="px-6 py-3">
                  Post a Project
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CERTIFICATE VERIFICATION SECTION */}
      <section className="py-24 bg-navy-dark text-paper border-t border-gold/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gold/15 text-gold border border-gold/20">
                Security & Trust
              </span>
              <h3 className="text-3xl font-extrabold text-paper tracking-tight">
                Publicly Verifiable Credentials
              </h3>
              <p className="text-sm text-paper/75 leading-relaxed">
                Every project certificate issued on CertiTask features a unique public verification hash. Employers can query our database instantly without login requirements to confirm the legitimacy, institution, and project sign-off metrics.
              </p>
              <div className="pt-2">
                <Button href="/verify" variant="outline" className="border-paper text-paper hover:bg-paper hover:text-navy">
                  Verify a Certificate
                </Button>
              </div>
            </div>

            <div className="lg:col-span-5 bg-navy border border-gold/15 p-6 rounded-xl space-y-4">
              <h4 className="font-bold text-gold text-sm font-sans">Verification Query Simulator</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Certificate ID..."
                  disabled
                  value="CERT-333333"
                  className="bg-navy-dark text-paper/50 border border-gold/15 px-3 py-2 rounded text-xs w-full cursor-not-allowed font-mono"
                />
                <Button href="/verify" variant="gold" className="text-xs py-2 px-4 shrink-0">
                  Query
                </Button>
              </div>
              <div className="bg-navy-dark p-3 rounded text-[10px] font-mono text-green-400 border border-green-950">
                STATUS: VALID<br />
                STUDENT: JANE DOE<br />
                ISSUED: APEX GLOBAL SOLUTIONS<br />
                HASH: 8fb4e1f7...
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FINAL CTA SECTION */}
      <section className="py-24 bg-gradient-to-br from-navy-dark via-navy to-navy-dark text-paper text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gold/5 rounded-full blur-3xl"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Stop saying you have the skills. <br />
            <span className="text-gold">Start proving them.</span>
          </h2>
          <p className="text-lg text-paper/85 max-w-xl mx-auto leading-relaxed">
            Join the CertiTask network today. Showcase verified experience, earn certificates, and connect directly with companies.
          </p>
          <div className="pt-4">
            <Button href="/auth/login" variant="gold" className="px-10 py-4 text-lg">
              Get Started
            </Button>
          </div>
          <div className="text-xs text-paper/50 font-mono">
            CertiTask platform — build verified skills.
          </div>
        </div>
      </section>
    </div>
  );
}
