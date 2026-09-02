"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function StudentProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [apiError, setApiError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    dateOfBirth: "",
    gender: "",
    universityName: "",
    degreeProgram: "",
    currentSemester: "",
    gpa: "",
    cnicNumber: "",
    bio: "",
    skills: "",
    portfolioUrl: "",
    resumeUrl: "",
  });

  const [cnicVerified, setCnicVerified] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
          const u = data.user;
          setFormData({
            name: u.name || "",
            email: u.email || "",
            phone: u.phone || "",
            location: u.location || "",
            dateOfBirth: u.dateOfBirth || "",
            gender: u.gender || "",
            universityName: u.universityName || "",
            degreeProgram: u.degreeProgram || "",
            currentSemester: u.currentSemester || "",
            gpa: u.gpa !== null && u.gpa !== undefined ? String(u.gpa) : "",
            cnicNumber: u.cnicNumber || "",
            bio: u.bio || "",
            skills: u.skillsArray || "",
            portfolioUrl: u.portfolioUrl || "",
            resumeUrl: u.resumeUrl || "",
          });
          setCnicVerified(!!u.cnicVerified);
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateCNIC = (cnic: string) => {
    return /^\d{5}-\d{7}-\d{1}$/.test(cnic);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    setSaved(false);

    // Client-side validation
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Full name is required";
    if (formData.cnicNumber) {
      const cleanDigits = formData.cnicNumber.replace(/\D/g, "");
      if (!validateCNIC(formData.cnicNumber) && cleanDigits.length !== 13) {
        newErrors.cnicNumber = "Enter 13-digit CNIC (e.g., 12345-1234567-1 or 1234512345671)";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);

    try {
      const payload: Record<string, unknown> = {
        name: formData.name,
        bio: formData.bio,
        phone: formData.phone,
        location: formData.location,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        universityName: formData.universityName,
        degreeProgram: formData.degreeProgram,
        currentSemester: formData.currentSemester,
        skillsArray: formData.skills,
        portfolioUrl: formData.portfolioUrl,
        resumeUrl: formData.resumeUrl,
      };

      if (formData.gpa) payload.gpa = parseFloat(formData.gpa);

      // Send CNIC number — backend will validate and set cnicVerified
      if (formData.cnicNumber && !cnicVerified) {
        payload.cnicNumber = formData.cnicNumber;
      }

      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user?.cnicVerified) {
          setCnicVerified(true);
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const data = await res.json();
        setApiError(data.error || "Failed to save profile");
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      setApiError("Network error. Please try again.");
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

  const inputStyle = (hasError?: boolean): React.CSSProperties => ({
    width: "100%",
    padding: "10px 14px",
    border: `1px solid ${hasError ? "#E53E3E" : "var(--border)"}`,
    borderRadius: 8,
    fontSize: 14,
    outline: "none",
    transition: "border-color 0.2s",
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)", fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <section style={{ background: "linear-gradient(180deg, #0a1628, #0f2a4a)", color: "#fff", padding: "48px 0" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px" }}>
          <Link href="/student/dashboard" style={{ color: "var(--gold)", fontSize: 13, textDecoration: "none", marginBottom: 12, display: "inline-block" }}>
            ← Back to Dashboard
          </Link>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 6 }}>Complete Your Student Profile</h1>
          <p style={{ opacity: 0.85, fontSize: 15 }}>Build your verified profile and start applying to projects</p>
        </div>
      </section>

      {/* Form */}
      <section style={{ padding: "40px 0" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px" }}>
          <form onSubmit={handleSubmit}>
            {/* Personal Information */}
            <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 12, padding: 32, marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--navy)", marginBottom: 20, paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>Personal Information</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--navy)", marginBottom: 6 }}>Full Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} style={inputStyle(!!errors.name)} placeholder="Your full name" />
                  {errors.name && <p style={{ color: "#E53E3E", fontSize: 12, marginTop: 4 }}>{errors.name}</p>}
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--navy)", marginBottom: 6 }}>Email</label>
                  <input type="email" name="email" value={formData.email} disabled
                    style={{ ...inputStyle(), background: "#f7f8fa", cursor: "not-allowed", color: "var(--ink-muted)" }} />
                  <p style={{ fontSize: 11, color: "var(--ink-subtle)", marginTop: 4 }}>Email cannot be changed</p>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--navy)", marginBottom: 6 }}>Phone Number</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} style={inputStyle()} placeholder="+92 300 1234567" />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--navy)", marginBottom: 6 }}>Location</label>
                  <input type="text" name="location" value={formData.location} onChange={handleChange} style={inputStyle()} placeholder="City, Country" />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--navy)", marginBottom: 6 }}>Date of Birth</label>
                  <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} style={inputStyle()} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--navy)", marginBottom: 6 }}>Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange}
                    style={{ ...inputStyle(), background: "#fff" }}>
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* CNIC Verification */}
            <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 12, padding: 32, marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--navy)", marginBottom: 20, paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>CNIC Verification</h2>

              {cnicVerified ? (
                <div style={{ background: "rgba(56,161,105,0.08)", border: "1px solid rgba(56,161,105,0.25)", borderRadius: 10, padding: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(56,161,105,0.15)", color: "#276749", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700 }}>✓</span>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#276749" }}>CNIC Verified</h3>
                  </div>
                  <p style={{ fontSize: 13, color: "#276749" }}>
                    Your CNIC <strong>{formData.cnicNumber}</strong> has been submitted and verified. This helps build trust with employers.
                  </p>
                </div>
              ) : (
                <div>
                  <div style={{ background: "rgba(236,201,75,0.1)", border: "1px solid rgba(236,201,75,0.3)", borderRadius: 10, padding: 14, marginBottom: 20 }}>
                    <p style={{ fontSize: 13, color: "#744210", fontWeight: 600 }}>
                      📋 CNIC verification is required to build trust with employers. Enter your CNIC number below and save your profile.
                    </p>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--navy)", marginBottom: 6 }}>CNIC Number *</label>
                    <input type="text" name="cnicNumber" value={formData.cnicNumber} onChange={handleChange}
                      style={inputStyle(!!errors.cnicNumber)} placeholder="XXXXX-XXXXXXX-X" />
                    {errors.cnicNumber && <p style={{ color: "#E53E3E", fontSize: 12, marginTop: 4 }}>{errors.cnicNumber}</p>}
                    <p style={{ fontSize: 11, color: "var(--ink-subtle)", marginTop: 4 }}>Format: XXXXX-XXXXXXX-X. Once verified, CNIC cannot be changed.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Education Information */}
            <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 12, padding: 32, marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--navy)", marginBottom: 20, paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>Education Information</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--navy)", marginBottom: 6 }}>University Name *</label>
                  <input type="text" name="universityName" value={formData.universityName} onChange={handleChange}
                    style={inputStyle(!!errors.universityName)} placeholder="Your university name" />
                  {errors.universityName && <p style={{ color: "#E53E3E", fontSize: 12, marginTop: 4 }}>{errors.universityName}</p>}
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--navy)", marginBottom: 6 }}>Degree Program *</label>
                  <input type="text" name="degreeProgram" value={formData.degreeProgram} onChange={handleChange}
                    style={inputStyle(!!errors.degreeProgram)} placeholder="e.g., BS Computer Science" />
                  {errors.degreeProgram && <p style={{ color: "#E53E3E", fontSize: 12, marginTop: 4 }}>{errors.degreeProgram}</p>}
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--navy)", marginBottom: 6 }}>Current Semester</label>
                  <select name="currentSemester" value={formData.currentSemester} onChange={handleChange}
                    style={{ ...inputStyle(), background: "#fff" }}>
                    <option value="">Select semester</option>
                    {[1,2,3,4,5,6,7,8].map(s => (
                      <option key={s} value={String(s)}>{s}{s===1?'st':s===2?'nd':s===3?'rd':'th'} Semester</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--navy)", marginBottom: 6 }}>GPA / CGPA</label>
                  <input type="number" name="gpa" value={formData.gpa} onChange={handleChange}
                    step="0.01" min="0" max="4" style={inputStyle()} placeholder="e.g., 3.5" />
                </div>
              </div>
            </div>

            {/* Skills, Experience & Portfolio */}
            <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 12, padding: 32, marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--navy)", marginBottom: 20, paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>Skills, Experience & Links</h2>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--navy)", marginBottom: 6 }}>Skills (comma-separated)</label>
                <textarea name="skills" value={formData.skills} onChange={handleChange} rows={3}
                  style={{ ...inputStyle(), resize: "vertical" as const }}
                  placeholder="e.g., React, Next.js, TypeScript, Node.js, Python" />
                <p style={{ fontSize: 11, color: "var(--ink-subtle)", marginTop: 4 }}>Separate skills with commas</p>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--navy)", marginBottom: 6 }}>Bio / Experience</label>
                <textarea name="bio" value={formData.bio} onChange={handleChange} rows={5}
                  style={{ ...inputStyle(), resize: "vertical" as const }}
                  placeholder="Tell companies about yourself, your experience, projects you&apos;ve worked on, and what you&apos;re looking for..." />
                <p style={{ fontSize: 11, color: "var(--ink-subtle)", marginTop: 4 }}>Share your experience, achievements, and career goals</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--navy)", marginBottom: 6 }}>Portfolio URL</label>
                  <input type="url" name="portfolioUrl" value={formData.portfolioUrl} onChange={handleChange}
                    style={inputStyle()} placeholder="https://yourportfolio.com" />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--navy)", marginBottom: 6 }}>Resume URL</label>
                  <input type="url" name="resumeUrl" value={formData.resumeUrl} onChange={handleChange}
                    style={inputStyle()} placeholder="https://drive.google.com/your-resume" />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div style={{ display: "flex", gap: 16 }}>
              <button type="submit" disabled={saving}
                style={{ flex: 1, padding: "14px 0", background: saving ? "#a0a0a0" : "var(--gold)", color: "var(--navy)", fontWeight: 800, fontSize: 15, border: "none", borderRadius: 10, cursor: saving ? "not-allowed" : "pointer", transition: "all 0.2s" }}>
                {saving ? "Saving..." : "Save Profile"}
              </button>
              <Link href="/student/dashboard"
                style={{ flex: 1, padding: "14px 0", border: "1px solid var(--border)", color: "var(--navy)", fontWeight: 700, fontSize: 15, borderRadius: 10, textDecoration: "none", textAlign: "center", display: "block" }}>
                Cancel
              </Link>
            </div>

            {saved && (
              <div style={{ marginTop: 16, padding: 14, background: "rgba(56,161,105,0.1)", border: "1px solid rgba(56,161,105,0.3)", borderRadius: 10, color: "#276749", fontWeight: 600, fontSize: 14, textAlign: "center" }}>
                ✓ Profile saved successfully!{!cnicVerified && formData.cnicNumber ? " CNIC has been submitted for verification." : ""}
              </div>
            )}

            {apiError && (
              <div style={{ marginTop: 16, padding: 14, background: "rgba(229,62,62,0.1)", border: "1px solid rgba(229,62,62,0.3)", borderRadius: 10, color: "#9B2C2C", fontWeight: 600, fontSize: 14, textAlign: "center" }}>
                ⚠ {apiError}
              </div>
            )}
          </form>
        </div>
      </section>
    </div>
  );
}
