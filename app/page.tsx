import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/Button";

type Client = {
  id: string;
  name: string;
  tag: string;
  description: string;
  location: string;
  openProjects: number;
  logoChar: string;
};

export default async function Home() {
  let dbClients: Array<{
    id: string;
    name: string;
    clientType: "INDIVIDUAL" | "ORGANIZATION" | null;
    industry: string | null;
    bio: string | null;
    location: string | null;
    _count: { projectsPosted: number };
  }> = [];

  try {
    dbClients = await prisma.user.findMany({
      where: { role: "CLIENT", suspendedAt: null, projectsPosted: { some: { status: "ACTIVE" } } },
      take: 3,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        clientType: true,
        industry: true,
        bio: true,
        location: true,
        _count: { select: { projectsPosted: { where: { status: "ACTIVE" } } } },
      },
    });
  } catch (error) {
    console.error("Failed to fetch featured clients from database:", error);
  }

  const clients: Client[] = dbClients.map((client) => ({
    id: client.id,
    name: client.name,
    tag: client.industry || (client.clientType === "ORGANIZATION" ? "Organization" : "Individual"),
    description: client.bio || "Posting real projects on CertiTask.",
    location: client.location || "Remote",
    openProjects: client._count.projectsPosted,
    logoChar: client.name.charAt(0).toUpperCase(),
  }));

  const steps = [
    ["01", "Find the brief", "Choose a real project that fits your skills and ambition."],
    ["02", "Do the work", "Work solo or with a team, with a clear client outcome in view."],
    ["03", "Get the sign-off", "The client reviews the deliverable and records what you made."],
    ["04", "Carry the proof", "Your certificate becomes a public record of the work."],
  ];

  return (
    <div className="bg-paper text-ink">
      <section className="relative overflow-hidden bg-navy-dark text-paper">
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#C9A227_1px,transparent_1px),linear-gradient(to_bottom,#C9A227_1px,transparent_1px)] bg-[size:5rem_5rem]" />
        <div className="relative mx-auto grid max-w-7xl gap-16 px-6 pb-24 pt-20 sm:px-10 lg:grid-cols-12 lg:items-center lg:gap-8 lg:pb-32 lg:pt-28">
          <div className="lg:col-span-7">
            <div className="mb-8 flex items-center gap-3 text-xs font-mono uppercase tracking-[0.2em] text-gold"><span className="h-px w-10 bg-gold" /> The experience ledger</div>
            <h1 className="max-w-4xl text-5xl font-black leading-[0.98] tracking-[-0.04em] sm:text-7xl lg:text-[6.8rem]">Make your work <span className="text-gold">count.</span></h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-paper/75 sm:text-xl">CertiTask turns real projects into proof that travels. Find meaningful work, ship it, and leave with a certificate anyone can verify.</p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row"><Button href="/projects" variant="gold" className="px-7 py-4">Explore live projects <span aria-hidden="true" className="ml-2 text-xl">↗</span></Button><Button href="/auth/signup" variant="outline" className="border-paper text-paper hover:bg-paper hover:text-navy px-7 py-4">Post a brief</Button></div>
            <div className="mt-14 grid max-w-lg grid-cols-3 border-t border-paper/20 pt-5 text-xs text-paper/55"><div><strong className="block text-2xl text-paper">01</strong> real work</div><div><strong className="block text-2xl text-paper">02</strong> clear feedback</div><div><strong className="block text-2xl text-paper">03</strong> public proof</div></div>
          </div>
          <div className="relative lg:col-span-5 lg:pl-10">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full border border-gold/30" />
            <div className="relative rotate-2 bg-paper p-3 text-ink shadow-2xl transition-transform duration-500 hover:rotate-0"><div className="border border-navy/20 p-6 sm:p-8"><div className="flex items-start justify-between border-b border-navy/20 pb-6"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-navy/55">Certificate of contribution</p><p className="mt-2 font-mono text-xs text-navy/60">CERT-AP4Q-5FM7-ZL3U</p></div><div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-gold text-xl text-navy">✓</div></div><p className="mt-12 text-xs uppercase tracking-[0.18em] text-navy/50">Issued to</p><h2 className="mt-2 text-4xl font-black tracking-tight text-navy">Jane Doe</h2><p className="mt-2 text-sm text-ink/65">for shipping the API integration at Apex Global</p><div className="mt-12 grid grid-cols-2 gap-4 border-t border-navy/20 pt-5 text-xs"><div><span className="block text-navy/45">Skills recorded</span><span className="mt-1 block font-semibold">Next.js · TypeScript</span></div><div><span className="block text-navy/45">Status</span><span className="mt-1 block font-semibold text-green-700">Verified by client</span></div></div><div className="mt-8 flex items-center justify-between border-t border-navy/20 pt-4 text-[10px] font-mono text-navy/50"><span>certitask.com/verify</span><span>2026 / 0148</span></div></div></div>
            <div className="absolute -bottom-8 -left-2 bg-gold px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-navy shadow-lg">Anyone can verify this</div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-20 border-b border-navy/10 bg-paper py-20 sm:py-28"><div className="mx-auto max-w-7xl px-6 sm:px-10"><div className="flex flex-col justify-between gap-5 border-b border-navy/15 pb-8 md:flex-row md:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-navy/50">The simple loop</p><h2 className="mt-3 max-w-xl text-4xl font-black tracking-tight text-navy sm:text-5xl">Experience, with a paper trail.</h2></div><p className="max-w-sm text-sm leading-relaxed text-ink/65">A clean route from a good brief to a credential with enough detail to mean something.</p></div><div className="mt-12 grid grid-cols-1 divide-y divide-navy/15 border-y border-navy/15 md:grid-cols-4 md:divide-x md:divide-y-0">{steps.map(([number, title, description]) => <div key={number} className="group px-0 py-7 md:px-6 md:first:pl-0 md:last:pr-0"><span className="font-mono text-sm text-navy/40">{number}</span><h3 className="mt-12 text-xl font-bold text-navy">{title}</h3><p className="mt-3 text-sm leading-relaxed text-ink/65">{description}</p><span className="mt-8 block text-2xl text-gold transition-transform duration-300 group-hover:translate-x-2">→</span></div>)}</div></div></section>

      <section className="bg-paper py-20 sm:py-28"><div className="mx-auto max-w-7xl px-6 sm:px-10"><div className="flex items-end justify-between border-b border-navy/15 pb-6"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Open briefs</p><h2 className="mt-2 text-4xl font-black tracking-tight text-navy">Work already in motion</h2></div><Link href="/clients" className="hidden text-sm font-bold text-navy hover:text-gold sm:block">View all clients ↗</Link></div><div className="mt-2 divide-y divide-navy/15 border-b border-navy/15">{clients.length > 0 ? clients.map((client) => <Link href={`/clients/${client.id}`} key={client.id} className="group grid grid-cols-[auto_1fr_auto] items-center gap-5 py-6 transition-colors hover:bg-white/50 sm:grid-cols-[auto_1fr_1fr_auto]"><div className="flex h-12 w-12 items-center justify-center bg-navy text-xl font-black text-gold">{client.logoChar}</div><div><h3 className="font-bold text-navy">{client.name}</h3><p className="mt-1 text-xs text-ink/55">{client.tag} · {client.location}</p></div><p className="hidden max-w-xs text-sm text-ink/65 sm:block">{client.description}</p><div className="text-right"><span className="block font-mono text-sm text-navy">{client.openProjects.toString().padStart(2, "0")}</span><span className="text-[10px] uppercase tracking-wider text-ink/50">open</span></div></Link>) : <div className="py-12 text-center text-sm text-ink/60">More partners joining soon. Check back for new briefs.</div>}</div><Link href="/clients" className="mt-6 block text-sm font-bold text-navy sm:hidden">View all clients ↗</Link></div></section>

      <section className="bg-navy py-20 text-paper sm:py-28"><div className="mx-auto grid max-w-7xl gap-12 px-6 sm:px-10 lg:grid-cols-2 lg:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">For the people doing the work</p><h2 className="mt-4 max-w-2xl text-4xl font-black leading-tight tracking-tight sm:text-6xl">Your next opportunity should leave evidence.</h2></div><div><p className="max-w-md text-base leading-relaxed text-paper/70">Stop collecting certificates that describe a course. Build a record that describes what you actually delivered, who reviewed it, and which skills you used.</p><Button href="/auth/signup" variant="gold" className="mt-8">Build your record <span aria-hidden="true" className="ml-2 text-xl">↗</span></Button></div></div></section>

      <section className="relative overflow-hidden bg-navy-dark py-24 text-center text-paper sm:py-32"><div className="absolute left-1/2 top-0 h-px w-40 -translate-x-1/2 bg-gold" /><div className="mx-auto max-w-3xl px-6"><p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">The last mile</p><h2 className="mt-5 text-4xl font-black tracking-tight sm:text-6xl">Make proof easy to trust.</h2><p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-paper/70">Every CertiTask certificate has a unique ID, a client sign-off, and a public verification page.</p><div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row"><Button href="/verify" variant="outline" className="border-paper text-paper hover:bg-paper hover:text-navy">Verify a certificate</Button><Button href="/auth/signup" variant="gold">Get started <span aria-hidden="true" className="ml-2 text-xl">↗</span></Button></div></div></section>
    </div>
  );
}
