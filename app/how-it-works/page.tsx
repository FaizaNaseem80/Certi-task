import React from "react";
import Link from "next/link";
import { Button } from "@/components/Button";

const stages = [
  { number: "01", title: "A real brief", body: "Clients post focused work with an outcome, context, and the skills they need." },
  { number: "02", title: "The right people", body: "Talent finds a project that matches how they want to grow, then applies solo or as a team." },
  { number: "03", title: "Visible progress", body: "The work moves through clear submissions, feedback, and review instead of disappearing into a black box." },
  { number: "04", title: "A lasting record", body: "When the client approves the work, every contributor receives a certificate with a public verification trail." },
];

export default function HowItWorksPage() {
  return (
    <div className="bg-paper text-ink">
      <section className="relative overflow-hidden bg-navy-dark text-paper">
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#C9A227_1px,transparent_1px),linear-gradient(to_bottom,#C9A227_1px,transparent_1px)] bg-[size:5rem_5rem]" />
        <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-20 sm:px-10 lg:pb-32 lg:pt-28">
          <div className="max-w-4xl">
            <p className="mb-8 flex items-center gap-3 text-xs font-mono uppercase tracking-[0.2em] text-gold"><span className="h-px w-10 bg-gold" /> The CertiTask method</p>
            <h1 className="text-5xl font-black leading-[0.98] tracking-[-0.04em] sm:text-7xl lg:text-[6.5rem]">From brief to <span className="text-gold">proof.</span></h1>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-paper/75 sm:text-xl">A simple, accountable loop for doing meaningful work and turning the result into something a future client can trust.</p>
          </div>
          <div className="mt-20 grid border-t border-paper/20 pt-6 sm:grid-cols-3 sm:gap-8"><div><span className="font-mono text-3xl text-gold">01</span><p className="mt-2 text-sm text-paper/65">Choose work with a real outcome.</p></div><div><span className="font-mono text-3xl text-gold">02</span><p className="mt-2 text-sm text-paper/65">Get feedback from the person who asked.</p></div><div><span className="font-mono text-3xl text-gold">03</span><p className="mt-2 text-sm text-paper/65">Carry proof that can be checked.</p></div></div>
        </div>
      </section>

      <section className="py-20 sm:py-28"><div className="mx-auto max-w-7xl px-6 sm:px-10"><div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">The workflow</p><h2 className="mt-4 text-4xl font-black tracking-tight text-navy sm:text-5xl">Good work should be easy to explain.</h2><p className="mt-6 max-w-md text-base leading-relaxed text-ink/65">CertiTask keeps the important parts visible: the brief, the contribution, the review, and the proof at the end.</p></div><div className="divide-y divide-navy/15 border-y border-navy/15">{stages.map((stage) => <article key={stage.number} className="grid gap-4 py-7 sm:grid-cols-[80px_1fr] sm:gap-8"><span className="font-mono text-sm text-navy/40">{stage.number}</span><div><h3 className="text-2xl font-bold text-navy">{stage.title}</h3><p className="mt-3 max-w-xl text-sm leading-relaxed text-ink/65">{stage.body}</p></div></article>)}</div></div></div></section>

      <section className="bg-navy py-20 text-paper sm:py-28"><div className="mx-auto grid max-w-7xl gap-12 px-6 sm:px-10 lg:grid-cols-2 lg:items-center"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Two sides, one record</p><h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Built for talent. Useful for clients.</h2></div><div className="grid gap-px bg-paper/20 sm:grid-cols-2"><div className="bg-navy p-6"><p className="text-xs font-bold uppercase tracking-[0.14em] text-gold">For talent</p><p className="mt-4 text-sm leading-relaxed text-paper/70">Build a portfolio from work someone genuinely needed, not only from practice exercises.</p></div><div className="bg-navy p-6"><p className="text-xs font-bold uppercase tracking-[0.14em] text-gold">For clients</p><p className="mt-4 text-sm leading-relaxed text-paper/70">Get scoped work done and leave contributors with a precise record of what they delivered.</p></div></div></div></section>

      <section className="bg-navy-dark py-24 text-center text-paper sm:py-32"><div className="mx-auto max-w-3xl px-6"><p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Ready when you are</p><h2 className="mt-5 text-4xl font-black tracking-tight sm:text-6xl">Put your skills in motion.</h2><p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-paper/70">Explore open projects or post the brief your team needs next.</p><div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row"><Button href="/projects" variant="gold">Explore projects</Button><Button href="/auth/signup" variant="outline" className="border-paper text-paper hover:bg-paper hover:text-navy">Join CertiTask</Button></div><Link href="/verify" className="mt-8 inline-block text-sm font-semibold text-paper/60 hover:text-gold">Already have a certificate? Verify it ↗</Link></div></section>
    </div>
  );
}
