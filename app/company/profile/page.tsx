"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/Button";

export default function CompanyProfilePage() {
  const [formData, setFormData] = useState({
    companyName: "",
    industry: "",
    companySize: "",
    website: "",
    phone: "",
    location: "",
    bio: "",
    foundedYear: new Date().getFullYear(),
    linkedinUrl: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Here you would submit to an API endpoint
      console.log("Company Profile Data:", formData);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <div className="min-h-screen bg-paper">
      {/* Header */}
      <section className="bg-gradient-to-b from-navy-dark to-navy text-paper py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/companies" className="text-gold hover:underline text-sm mb-4 inline-block">
            ← Back to Companies
          </Link>
          <h1 className="text-4xl font-bold mb-2">Complete Your Company Profile</h1>
          <p className="text-paper/90">Enhance your company visibility with a complete profile</p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl border border-navy/5 p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div>
                <h2 className="text-2xl font-bold text-navy mb-6 pb-4 border-b border-navy/10">
                  Basic Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-navy mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-navy/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-colors"
                      placeholder="Enter your company name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-navy mb-2">
                      Industry *
                    </label>
                    <select
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-navy/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-colors"
                    >
                      <option value="">Select an industry</option>
                      <option value="Technology">Technology</option>
                      <option value="Finance">Finance</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Education">Education</option>
                      <option value="Retail">Retail</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-navy mb-2">
                      Company Size *
                    </label>
                    <select
                      name="companySize"
                      value={formData.companySize}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-navy/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-colors"
                    >
                      <option value="">Select company size</option>
                      <option value="1-50">1-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-1000">201-1000 employees</option>
                      <option value="1001+">1001+ employees</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-navy mb-2">
                      Founded Year
                    </label>
                    <input
                      type="number"
                      name="foundedYear"
                      value={formData.foundedYear}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-navy/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-colors"
                      placeholder="YYYY"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h2 className="text-2xl font-bold text-navy mb-6 pb-4 border-b border-navy/10">
                  Contact Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-navy mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-navy/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-colors"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-navy mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-navy/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-colors"
                      placeholder="City, Country"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-navy mb-2">
                      Website URL
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-navy/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-colors"
                      placeholder="https://www.example.com"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-navy mb-2">
                      LinkedIn URL
                    </label>
                    <input
                      type="url"
                      name="linkedinUrl"
                      value={formData.linkedinUrl}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-navy/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-colors"
                      placeholder="https://www.linkedin.com/company/..."
                    />
                  </div>
                </div>
              </div>

              {/* About Section */}
              <div>
                <h2 className="text-2xl font-bold text-navy mb-6 pb-4 border-b border-navy/10">
                  About Your Company
                </h2>
                <label className="block text-sm font-semibold text-navy mb-2">
                  Company Description
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-navy/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-colors"
                  placeholder="Tell students about your company, culture, and what you're looking for..."
                  rows={6}
                />
                <p className="text-xs text-ink/70 mt-2">Maximum 500 characters recommended</p>
              </div>

              {/* Submit Section */}
              <div className="flex gap-4 pt-6 border-t border-navy/10">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gold text-navy font-bold rounded-lg hover:bg-gold/90 transition-all"
                >
                  Save Profile
                </button>
                <Link
                  href="/companies"
                  className="flex-1 py-3 border border-navy/15 text-navy font-bold rounded-lg hover:bg-navy hover:text-paper transition-all text-center"
                >
                  Cancel
                </Link>
              </div>

              {submitted && (
                <div className="p-4 bg-green-100 border border-green-300 rounded-lg text-green-700 font-semibold">
                  ✓ Profile saved successfully!
                </div>
              )}
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
