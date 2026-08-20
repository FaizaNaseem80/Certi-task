"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/Button";

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const contactCards = [
    {
      title: "Email Support",
      detail: "support@certitask.com",
      description: "Direct email for general inquiries, partner requests, or student disputes.",
      icon: (
        <svg className="h-6 w-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: "Call Helpline",
      detail: "+1 (555) 123-4567",
      description: "Available Mon-Fri, 9am - 5pm PST for corporate partners and institutions.",
      icon: (
        <svg className="h-6 w-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
    },
    {
      title: "Our HQ Office",
      detail: "San Francisco, CA",
      description: "100 Pine Street, Suite 1250, San Francisco, California, 94111.",
      icon: (
        <svg className="h-6 w-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      title: "Support Desk",
      detail: "24/7 Ticketing System",
      description: "Active student users can log in to open priority support queries in their dashboard.",
      icon: (
        <svg className="h-6 w-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.email || !formState.message) {
      alert("Please fill in the required fields (Name, Email, and Message).");
      return;
    }
    setSubmitted(true);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Contact Hero */}
      <section className="bg-gradient-to-b from-navy-dark to-navy text-paper py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#C9A227_1px,transparent_1px),linear-gradient(to_bottom,#C9A227_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider bg-gold/15 text-gold border border-gold/30">
            Get in Touch
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            How Can We Help <span className="text-gold">You?</span>
          </h1>
          <p className="text-paper/85 text-lg max-w-2xl mx-auto leading-relaxed">
            Have questions about certificate verification, partner accounts, or opportunities? Send us a message and our team will reply shortly.
          </p>
        </div>
      </section>

      {/* Main Section */}
      <section className="py-24 bg-paper text-ink flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Contact Form Grid Column */}
            <div className="lg:col-span-7 bg-white p-8 rounded-2xl border border-navy/5 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-navy"></div>
              
              {submitted ? (
                <div className="text-center py-16 space-y-6">
                  <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto border border-green-200 shadow-xs">
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-sans font-bold text-2xl text-navy">Message Received!</h3>
                    <p className="text-sm text-ink/75 max-w-md mx-auto">
                      Thank you for contacting CertiTask. A support specialist will review your inquiry and follow up within 24 business hours.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormState({ name: "", email: "", subject: "", message: "" });
                    }}
                    className="inline-flex items-center text-xs font-semibold text-gold hover:underline cursor-pointer"
                  >
                    Send another message &rarr;
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h3 className="font-sans font-bold text-xl text-navy mb-1">Send a Message</h3>
                    <p className="text-xs text-ink/60">Fields marked with * are required.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Name */}
                    <div className="space-y-2">
                      <label htmlFor="name" className="block text-xs font-bold text-navy/85 uppercase tracking-wide">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        required
                        value={formState.name}
                        onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                        placeholder="John Doe"
                        className="block w-full px-4 py-3 bg-paper border border-navy/15 rounded-lg text-ink font-sans text-sm focus:outline-hidden focus:ring-2 focus:ring-gold/50 focus:border-gold transition-colors"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-xs font-bold text-navy/85 uppercase tracking-wide">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={formState.email}
                        onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                        placeholder="john@example.com"
                        className="block w-full px-4 py-3 bg-paper border border-navy/15 rounded-lg text-ink font-sans text-sm focus:outline-hidden focus:ring-2 focus:ring-gold/50 focus:border-gold transition-colors"
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="space-y-2">
                    <label htmlFor="subject" className="block text-xs font-bold text-navy/85 uppercase tracking-wide">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      value={formState.subject}
                      onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                      placeholder="Verification issue, partnership query, etc."
                      className="block w-full px-4 py-3 bg-paper border border-navy/15 rounded-lg text-ink font-sans text-sm focus:outline-hidden focus:ring-2 focus:ring-gold/50 focus:border-gold transition-colors"
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <label htmlFor="message" className="block text-xs font-bold text-navy/85 uppercase tracking-wide">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      required
                      value={formState.message}
                      onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                      placeholder="Write your message details here..."
                      className="block w-full px-4 py-3 bg-paper border border-navy/15 rounded-lg text-ink font-sans text-sm focus:outline-hidden focus:ring-2 focus:ring-gold/50 focus:border-gold transition-colors resize-none"
                    ></textarea>
                  </div>

                  <Button type="submit" variant="primary" className="w-full py-3.5">
                    Submit Query
                  </Button>
                </form>
              )}
            </div>

            {/* Sidebar Details Column */}
            <div className="lg:col-span-5 space-y-8">
              <div className="bg-navy-dark text-paper p-8 rounded-2xl border border-gold/10 shadow-xs space-y-6">
                <h3 className="font-sans font-bold text-lg text-gold">Frequently Asked</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-sm text-paper mb-1">How long does credential verification take?</h4>
                    <p className="text-xs text-paper/70 leading-relaxed">
                      Verification requests processed by our automatic integration adapters are completed in seconds. Manual uploads take 24–48 hours to be validated by our operations team.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-paper mb-1">How can my company create a partner account?</h4>
                    <p className="text-xs text-paper/70 leading-relaxed">
                      Select "Partner Sign Up" in the Login portal or contact our sales team directly using this form. We offer custom pipelines for enterprises.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-navy/5 text-center">
                <p className="text-xs text-ink/75 font-semibold">Want to browse active projects?</p>
                <Link href="/projects" className="inline-block text-xs text-gold font-bold hover:underline mt-1">
                  View Projects Showcase &rarr;
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Grid Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactCards.map((card) => (
              <div
                key={card.title}
                className="bg-white p-6 rounded-xl border border-navy/5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="h-10 w-10 rounded-lg bg-navy flex items-center justify-center mb-4">
                    {card.icon}
                  </div>
                  <h4 className="font-bold text-navy text-base mb-1">{card.title}</h4>
                  <p className="text-xs font-bold text-gold mb-3">{card.detail}</p>
                </div>
                <p className="text-xs text-ink/70 leading-relaxed pt-2 border-t border-navy/5">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
