import React from "react";
import { Button } from "@/components/Button";

export default function AboutPage() {
  const whyCertiTask = [
    {
      title: "Easy Opportunity Discovery",
      description: "Filter and match directly with positions matching your verified credentials and coursework, skipping the traditional resume black hole.",
      icon: (
        <svg className="h-6 w-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      title: "Professional Student Profiles",
      description: "Build an interactive, modular CV highlighting portfolio works, certifications, and grades verified directly by your educators.",
      icon: (
        <svg className="h-6 w-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      title: "Direct Company Connections",
      description: "Communicate directly with corporate representatives from featured employers without recruiters playing gatekeeper.",
      icon: (
        <svg className="h-6 w-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
    {
      title: "Certificate Visibility",
      description: "A centralized depository for all your academic badges, course credits, and hackathon certificates with single-click verification.",
      icon: (
        <svg className="h-6 w-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
    },
    {
      title: "Career Development",
      description: "Acquire actionable feedback, skills mapping guidance, and benchmark profiles of successful alumni in your target fields.",
      icon: (
        <svg className="h-6 w-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
    },
  ];

  const stats = [
    { value: "25,000+", label: "Students Registered" },
    { value: "150+", label: "Featured Companies" },
    { value: "45,000+", label: "Certificates Earned" },
    { value: "1,200+", label: "Active Opportunities" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* About Hero Section */}
      <section className="bg-gradient-to-b from-navy-dark to-navy text-paper py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#C9A227_1px,transparent_1px),linear-gradient(to_bottom,#C9A227_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider bg-gold/15 text-gold border border-gold/30">
            About CertiTask
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Bridging the Gap Between <br />
            <span className="text-gold">Education and Career</span>
          </h1>
          <p className="text-paper/85 text-lg max-w-2xl mx-auto leading-relaxed font-sans">
            We are dedicated to building a transparent platform where students can showcase verified credentials and directly access game-changing job opportunities.
          </p>
        </div>
      </section>

      {/* Mission and Vision Section */}
      <section className="py-24 bg-paper text-ink">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
            {/* Our Mission */}
            <div className="space-y-6 bg-white p-8 rounded-xl border border-navy/5 shadow-xs">
              <div className="h-12 w-12 rounded-lg bg-navy flex items-center justify-center">
                <svg className="h-6 w-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-extrabold text-navy">Our Mission</h2>
              <p className="text-ink/80 leading-relaxed">
                To empower students by giving them full control over their professional credentials and linking them directly to verified, high-impact career opportunities. We believe hiring should be based on transparent, authenticated achievements, not subjective networks.
              </p>
              <p className="text-ink/80 leading-relaxed">
                By partnering with colleges, certification authorities, and industries, we facilitate a merit-based pipeline where raw student talent can be easily searched and hired.
              </p>
            </div>

            {/* Our Vision */}
            <div className="space-y-6 bg-white p-8 rounded-xl border border-navy/5 shadow-xs">
              <div className="h-12 w-12 rounded-lg bg-navy flex items-center justify-center">
                <svg className="h-6 w-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-extrabold text-navy">Our Vision</h2>
              <p className="text-ink/80 leading-relaxed">
                To create a global digital ecosystem where every student’s achievements are instantly verifiable, portable, and valued. We envision a future where universities and employers share a unified language of skill mastery, making transition from classroom to boardroom frictionless.
              </p>
              <p className="text-ink/80 leading-relaxed">
                In this future, career opportunities are distributed equitably, based on what you have proven you can do, rather than who you know or where you reside.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why CertiTask? Section */}
      <section className="py-24 bg-navy-dark text-paper relative">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#C9A227_1px,transparent_1px)] [background-size:24px_24px]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-xs font-bold text-gold tracking-widest uppercase">The CertiTask Advantage</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-paper tracking-tight">Why CertiTask?</h3>
            <p className="text-lg text-paper/75">
              Traditional networks fail students. Here is how CertiTask changes the paradigm.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {whyCertiTask.map((item) => (
              <div key={item.title} className="bg-navy p-8 rounded-xl border border-gold/10">
                <div className="h-12 w-12 rounded-lg bg-navy-dark flex items-center justify-center mb-6">
                  {item.icon}
                </div>
                <h4 className="font-sans font-bold text-xl text-paper mb-3">{item.title}</h4>
                <p className="text-sm text-paper/70 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-paper text-navy border-b border-navy/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label} className="space-y-2">
                <div className="text-4xl sm:text-5xl font-black text-gold tracking-tight">{stat.value}</div>
                <div className="text-sm text-navy/70 font-semibold tracking-wide uppercase">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-navy-dark to-navy text-paper text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Start Discovering Matches Today
          </h2>
          <p className="text-lg text-paper/80 max-w-xl mx-auto">
            Ready to explore verified student profiles or find active company openings? Join CertiTask now.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button href="/auth/login" variant="gold" className="w-full sm:w-auto px-8 py-3.5">
              Sign Up As Student
            </Button>
            <Button href="/companies" variant="outline" className="w-full sm:w-auto px-8 py-3.5 border-paper text-paper hover:bg-paper hover:text-navy">
              View Featured Companies
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
