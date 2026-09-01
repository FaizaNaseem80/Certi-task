"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CompanyProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    companySize: "",
    website: "",
    phone: "",
    location: "",
    bio: "",
    foundedYear: "",
    linkedinUrl: "",
    companyDescription: "",
    companyWebsite: "",
    domain: "",
    logoUrl: "",
  });

  // Load existing profile on mount
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/auth/profile");
        if (!res.ok) {
          router.push("/auth/login");
          return;
        }
        const data = await res.json();
        if (data.user) {
          setFormData({
            name: data.user.name || "",
            industry: data.user.industry || "",
            companySize: data.user.companySize || "",
            website: data.user.website || "",
            phone: data.user.phone || "",
            location: data.user.location || "",
            bio: data.user.bio || "",
            foundedYear: data.user.foundedYear ? String(data.user.foundedYear) : "",
            linkedinUrl: data.user.linkedinUrl || "",
            companyDescription: data.user.companyDescription || "",
            companyWebsite: data.user.companyWebsite || "",
            domain: data.user.domain || "",
            logoUrl: data.user.logoUrl || "",
          });
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          bio: formData.bio,
          website: formData.website,
          phone: formData.phone,
          location: formData.location,
          domain: formData.domain,
          logoUrl: formData.logoUrl,
          industry: formData.industry,
          companySize: formData.companySize,
          foundedYear: formData.foundedYear ? parseInt(formData.foundedYear) : undefined,
          linkedinUrl: formData.linkedinUrl,
          companyDescription: formData.companyDescription,
          companyWebsite: formData.companyWebsite,
        }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save profile");
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--paper)", fontFamily: "Inter, sans-serif" }}>
        <p style={{ color: "var(--ink-muted)", fontSize: 16 }}>Loading profile...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)", fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <section style={{ background: "linear-gradient(180deg, #0a1628, #0f2a4a)", color: "#fff", padding: "48px 0" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px" }}>
          <Link href="/company/dashboard" style={{ color: "var(--gold)", fontSize: 13, textDecoration: "none", marginBottom: 12, display: "inline-block" }}>
            ← Back to Dashboard
          </Link>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 6 }}>Edit Company Profile</h1>
          <p style={{ opacity: 0.85, fontSize: 15 }}>Keep your company information up to date for students and employers</p>
        </div>
      </section>

      {/* Form */}
      <section style={{ padding: "40px 0" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px" }}>
          <form onSubmit={handleSubmit}>
            {/* Basic Information */}
            <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 12, padding: 32, marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--navy)", marginBottom: 20, paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>Basic Information</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--navy)", marginBottom: 6 }}>Company Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required
                    style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 8, fontSize: 14, outline: "none" }}
                    placeholder="Your company name" />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--navy)", marginBottom: 6 }}>Industry *</label>
                  <select name="industry" value={formData.industry} onChange={handleChange} required
                    style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 8, fontSize: 14, outline: "none", background: "#fff" }}>
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
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--navy)", marginBottom: 6 }}>Company Size *</label>
                  <select name="companySize" value={formData.companySize} onChange={handleChange} required
                    style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 8, fontSize: 14, outline: "none", background: "#fff" }}>
                    <option value="">Select company size</option>
                    <option value="1-50">1-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-1000">201-1000 employees</option>
                    <option value="1001+">1001+ employees</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--navy)", marginBottom: 6 }}>Founded Year</label>
                  <input type="number" name="foundedYear" value={formData.foundedYear} onChange={handleChange}
                    style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 8, fontSize: 14, outline: "none" }}
                    placeholder="e.g., 2020" min="1800" max={new Date().getFullYear()} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--navy)", marginBottom: 6 }}>Domain</label>
                  <input type="text" name="domain" value={formData.domain} onChange={handleChange}
                    style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 8, fontSize: 14, outline: "none" }}
                    placeholder="e.g., software, consulting" />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--navy)", marginBottom: 6 }}>Logo URL</label>
                  <input type="url" name="logoUrl" value={formData.logoUrl} onChange={handleChange}
                    style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 8, fontSize: 14, outline: "none" }}
                    placeholder="https://example.com/logo.png" />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 12, padding: 32, marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--navy)", marginBottom: 20, paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>Contact Information</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--navy)", marginBottom: 6 }}>Phone Number</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                    style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 8, fontSize: 14, outline: "none" }}
                    placeholder="+1 (555) 000-0000" />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--navy)", marginBottom: 6 }}>Location</label>
                  <input type="text" name="location" value={formData.location} onChange={handleChange}
                    style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 8, fontSize: 14, outline: "none" }}
                    placeholder="City, Country" />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--navy)", marginBottom: 6 }}>Website URL</label>
                  <input type="url" name="website" value={formData.website} onChange={handleChange}
                    style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 8, fontSize: 14, outline: "none" }}
                    placeholder="https://www.example.com" />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--navy)", marginBottom: 6 }}>LinkedIn URL</label>
                  <input type="url" name="linkedinUrl" value={formData.linkedinUrl} onChange={handleChange}
                    style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 8, fontSize: 14, outline: "none" }}
                    placeholder="https://www.linkedin.com/company/..." />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--navy)", marginBottom: 6 }}>Company Website</label>
                  <input type="url" name="companyWebsite" value={formData.companyWebsite} onChange={handleChange}
                    style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 8, fontSize: 14, outline: "none" }}
                    placeholder="https://corporate.example.com" />
                </div>
              </div>
            </div>

            {/* About Section */}
            <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 12, padding: 32, marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--navy)", marginBottom: 20, paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>About Your Company</h2>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--navy)", marginBottom: 6 }}>Short Bio</label>
                <textarea name="bio" value={formData.bio} onChange={handleChange} rows={3}
                  style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 8, fontSize: 14, outline: "none", resize: "vertical" }}
                  placeholder="A short tagline about your company..." />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--navy)", marginBottom: 6 }}>Company Description</label>
                <textarea name="companyDescription" value={formData.companyDescription} onChange={handleChange} rows={5}
                  style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 8, fontSize: 14, outline: "none", resize: "vertical" }}
                  placeholder="Tell students about your company, culture, and what you're looking for..." />
                <p style={{ fontSize: 12, color: "var(--ink-subtle)", marginTop: 4 }}>Maximum 1000 characters recommended</p>
              </div>
            </div>

            {/* Submit */}
            <div style={{ display: "flex", gap: 16 }}>
              <button type="submit" disabled={saving}
                style={{ flex: 1, padding: "14px 0", background: saving ? "#a0a0a0" : "var(--gold)", color: "var(--navy)", fontWeight: 800, fontSize: 15, border: "none", borderRadius: 10, cursor: saving ? "not-allowed" : "pointer", transition: "all 0.2s" }}>
                {saving ? "Saving..." : "Save Profile"}
              </button>
              <Link href="/company/dashboard"
                style={{ flex: 1, padding: "14px 0", border: "1px solid var(--border)", color: "var(--navy)", fontWeight: 700, fontSize: 15, borderRadius: 10, textDecoration: "none", textAlign: "center", display: "block" }}>
                Cancel
              </Link>
            </div>

            {saved && (
              <div style={{ marginTop: 16, padding: 14, background: "rgba(56,161,105,0.1)", border: "1px solid rgba(56,161,105,0.3)", borderRadius: 10, color: "#276749", fontWeight: 600, fontSize: 14, textAlign: "center" }}>
                ✓ Profile saved successfully!
              </div>
            )}

            {error && (
              <div style={{ marginTop: 16, padding: 14, background: "rgba(229,62,62,0.1)", border: "1px solid rgba(229,62,62,0.3)", borderRadius: 10, color: "#9B2C2C", fontWeight: 600, fontSize: 14, textAlign: "center" }}>
                ⚠ {error}
              </div>
            )}
          </form>
        </div>
      </section>
    </div>
  );
}
