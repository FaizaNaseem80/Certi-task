"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function StudentProfilePage() {
  const [formData, setFormData] = useState({
    fullName: "",
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
  });

  const [cnicFile, setCnicFile] = useState<File | null>(null);
  const [cnicVerified, setCnicVerified] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCnicFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          cnicFile: "File size must be less than 5MB",
        }));
      } else {
        setCnicFile(file);
        setErrors((prev) => ({
          ...prev,
          cnicFile: "",
        }));
      }
    }
  };

  const validateCNIC = (cnic: string) => {
    // Simple CNIC validation pattern (12345-1234567-1 format for Pakistan)
    const cnicPattern = /^\d{5}-\d{7}-\d{1}$/;
    return cnicPattern.test(cnic);
  };

  const handleVerifyCNIC = async () => {
    if (!formData.cnicNumber) {
      setErrors((prev) => ({
        ...prev,
        cnic: "CNIC number is required",
      }));
      return;
    }

    if (!validateCNIC(formData.cnicNumber)) {
      setErrors((prev) => ({
        ...prev,
        cnic: "Invalid CNIC format. Use: XXXXX-XXXXXXX-X",
      }));
      return;
    }

    if (!cnicFile) {
      setErrors((prev) => ({
        ...prev,
        cnicFile: "CNIC image is required",
      }));
      return;
    }

    // Simulate CNIC verification
    try {
      setCnicVerified(true);
      setErrors((prev) => ({
        ...prev,
        cnic: "",
        cnicFile: "",
      }));
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        cnic: "Failed to verify CNIC. Please try again.",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Record<string, string> = {};

    if (!formData.fullName) newErrors.fullName = "Full name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.universityName) newErrors.universityName = "University name is required";
    if (!formData.degreeProgram) newErrors.degreeProgram = "Degree program is required";
    if (!cnicVerified) newErrors.cnic = "CNIC verification is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // Here you would submit to an API endpoint
      console.log("Student Profile Data:", {
        ...formData,
        cnicVerified,
        skills: formData.skills.split(",").map((s) => s.trim()),
      });
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
          <Link href="/" className="text-gold hover:underline text-sm mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold mb-2">Complete Your Student Profile</h1>
          <p className="text-paper/90">Build your verified profile and start applying to projects</p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div className="bg-white rounded-xl border border-navy/5 p-8">
              <h2 className="text-2xl font-bold text-navy mb-6 pb-4 border-b border-navy/10">
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      errors.fullName
                        ? "border-red-500 focus:ring-red-200"
                        : "border-navy/15 focus:ring-gold/50 focus:border-gold"
                    }`}
                    placeholder="Your full name"
                  />
                  {errors.fullName && (
                    <p className="text-red-600 text-xs mt-1">{errors.fullName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      errors.email
                        ? "border-red-500 focus:ring-red-200"
                        : "border-navy/15 focus:ring-gold/50 focus:border-gold"
                    }`}
                    placeholder="your.email@example.com"
                  />
                  {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
                </div>
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
                    placeholder="+92 300 1234567"
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
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-navy/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-navy/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-colors"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* CNIC Verification */}
            <div className="bg-white rounded-xl border border-navy/5 p-8">
              <h2 className="text-2xl font-bold text-navy mb-6 pb-4 border-b border-navy/10">
                CNIC Verification *
              </h2>
              <div className="space-y-6">
                <div className="bg-gold/10 border border-gold/20 rounded-lg p-4">
                  <p className="text-sm text-navy font-semibold">
                    📋 CNIC verification is required to build trust and complete your profile.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">
                    CNIC Number *
                  </label>
                  <input
                    type="text"
                    name="cnicNumber"
                    value={formData.cnicNumber}
                    onChange={handleChange}
                    placeholder="XXXXX-XXXXXXX-X"
                    disabled={cnicVerified}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      cnicVerified
                        ? "bg-paper cursor-not-allowed"
                        : "border-navy/15 focus:ring-gold/50 focus:border-gold"
                    } ${errors.cnic ? "border-red-500" : ""}`}
                  />
                  {errors.cnic && <p className="text-red-600 text-xs mt-1">{errors.cnic}</p>}
                  <p className="text-xs text-ink/70 mt-1">Format: XXXXX-XXXXXXX-X</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">
                    Upload CNIC Image *
                  </label>
                  <div className="border-2 border-dashed border-navy/20 rounded-lg p-6 text-center hover:border-gold transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleCnicFileChange}
                      disabled={cnicVerified}
                      className="hidden"
                      id="cnic-file"
                    />
                    <label htmlFor="cnic-file" className="cursor-pointer">
                      <p className="text-navy font-semibold">
                        {cnicFile ? cnicFile.name : "Click to upload or drag and drop"}
                      </p>
                      <p className="text-xs text-ink/70 mt-1">
                        PNG, JPG, or PDF (Max 5MB)
                      </p>
                    </label>
                  </div>
                  {errors.cnicFile && (
                    <p className="text-red-600 text-xs mt-1">{errors.cnicFile}</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleVerifyCNIC}
                  disabled={cnicVerified}
                  className={`w-full py-3 font-bold rounded-lg transition-all ${
                    cnicVerified
                      ? "bg-green-100 text-green-700 cursor-not-allowed"
                      : "bg-navy text-paper hover:bg-navy-dark"
                  }`}
                >
                  {cnicVerified ? "✓ CNIC Verified" : "Verify CNIC"}
                </button>
              </div>
            </div>

            {/* Education Information */}
            <div className="bg-white rounded-xl border border-navy/5 p-8">
              <h2 className="text-2xl font-bold text-navy mb-6 pb-4 border-b border-navy/10">
                Education Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">
                    University Name *
                  </label>
                  <input
                    type="text"
                    name="universityName"
                    value={formData.universityName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      errors.universityName
                        ? "border-red-500 focus:ring-red-200"
                        : "border-navy/15 focus:ring-gold/50 focus:border-gold"
                    }`}
                    placeholder="Your university name"
                  />
                  {errors.universityName && (
                    <p className="text-red-600 text-xs mt-1">{errors.universityName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">
                    Degree Program *
                  </label>
                  <input
                    type="text"
                    name="degreeProgram"
                    value={formData.degreeProgram}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      errors.degreeProgram
                        ? "border-red-500 focus:ring-red-200"
                        : "border-navy/15 focus:ring-gold/50 focus:border-gold"
                    }`}
                    placeholder="e.g., BS Computer Science"
                  />
                  {errors.degreeProgram && (
                    <p className="text-red-600 text-xs mt-1">{errors.degreeProgram}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">
                    Current Semester
                  </label>
                  <select
                    name="currentSemester"
                    value={formData.currentSemester}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-navy/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-colors"
                  >
                    <option value="">Select semester</option>
                    <option value="1">1st Semester</option>
                    <option value="2">2nd Semester</option>
                    <option value="3">3rd Semester</option>
                    <option value="4">4th Semester</option>
                    <option value="5">5th Semester</option>
                    <option value="6">6th Semester</option>
                    <option value="7">7th Semester</option>
                    <option value="8">8th Semester</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">
                    GPA / CGPA
                  </label>
                  <input
                    type="number"
                    name="gpa"
                    value={formData.gpa}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    max="4"
                    className="w-full px-4 py-3 border border-navy/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-colors"
                    placeholder="e.g., 3.5"
                  />
                </div>
              </div>
            </div>

            {/* Skills & Portfolio */}
            <div className="bg-white rounded-xl border border-navy/5 p-8">
              <h2 className="text-2xl font-bold text-navy mb-6 pb-4 border-b border-navy/10">
                Skills & Links
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">
                    Skills (comma-separated)
                  </label>
                  <textarea
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-navy/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-colors"
                    placeholder="e.g., React, Next.js, TypeScript, Node.js"
                    rows={3}
                  />
                  <p className="text-xs text-ink/70 mt-1">Separate skills with commas</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">
                    Portfolio URL
                  </label>
                  <input
                    type="url"
                    name="portfolioUrl"
                    value={formData.portfolioUrl}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-navy/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-colors"
                    placeholder="https://yourportfolio.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-navy/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-colors"
                    placeholder="Tell companies about yourself..."
                    rows={4}
                  />
                </div>
              </div>
            </div>

            {/* Submit Section */}
            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 py-3 bg-gold text-navy font-bold rounded-lg hover:bg-gold/90 transition-all"
              >
                Complete Profile
              </button>
              <Link
                href="/"
                className="flex-1 py-3 border border-navy/15 text-navy font-bold rounded-lg hover:bg-navy hover:text-paper transition-all text-center"
              >
                Cancel
              </Link>
            </div>

            {submitted && (
              <div className="p-4 bg-green-100 border border-green-300 rounded-lg text-green-700 font-semibold">
                ✓ Profile completed successfully!
              </div>
            )}

            {errors.cnic && !cnicVerified && (
              <div className="p-4 bg-red-100 border border-red-300 rounded-lg text-red-700 font-semibold">
                ⚠ CNIC verification is required to complete your profile
              </div>
            )}
          </form>
        </div>
      </section>
    </div>
  );
}
