"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Student {
  id: string;
  name: string;
  email: string;
  bio: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  universityName: string;
  degreeProgram: string;
  currentSemester: string;
  gpa: number;
  skillsArray: string;
  portfolioUrl: string;
  resumeUrl: string;
  cnicNumber: string;
  cnicVerified: boolean;
  location: string;
  createdAt: string;
  _count: {
    applications: number;
    submissions: number;
    issuedCertificates: number;
  };
  applications: Array<{
    id: string;
    status: string;
    project: {
      id: string;
      title: string;
    };
  }>;
}

export default function StudentProfilePage() {
  const params = useParams();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const res = await fetch(`/api/students/${params.id}`);
        if (!res.ok) throw new Error("Student not found");
        const data = await res.json();
        setStudent(data.student);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDetails();
  }, [params.id]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-navy font-bold">Loading student profile...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 font-bold">{error}</p>
          <Link href="/" className="text-gold hover:underline mt-4 inline-block">
            Back to Home
          </Link>
        </div>
      </div>
    );

  if (!student)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-navy font-bold">Student not found</p>
      </div>
    );

  let skills: string[] = [];
  if (student?.skillsArray) {
    try {
      const parsed = JSON.parse(student.skillsArray);
      skills = Array.isArray(parsed) ? parsed : String(parsed).split(',').map((s) => s.trim()).filter(Boolean);
    } catch {
      skills = student.skillsArray.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }

  const age = student.dateOfBirth 
    ? Math.floor((new Date().getTime() - new Date(student.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
    : null;

  return (
    <div className="min-h-screen bg-paper">
      {/* Header */}
      <section className="bg-gradient-to-b from-navy-dark to-navy text-paper py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-gold hover:underline text-sm mb-4 inline-block">
            ← Back to Home
          </Link>
          <div className="flex items-start gap-6">
            <div className="h-20 w-20 rounded-lg bg-gold flex items-center justify-center text-navy font-bold text-2xl shrink-0">
              {student.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{student.name}</h1>
              <div className="flex flex-wrap gap-4 text-paper/90">
                {student.universityName && (
                  <span className="flex items-center gap-1">
                    <span className="text-gold">●</span> {student.universityName}
                  </span>
                )}
                {student.degreeProgram && (
                  <span className="flex items-center gap-1">
                    <span className="text-gold">●</span> {student.degreeProgram}
                  </span>
                )}
                {student.location && (
                  <span className="flex items-center gap-1">
                    <span className="text-gold">●</span> {student.location}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* About Section */}
              <div className="bg-white rounded-xl border border-navy/5 p-8">
                <h2 className="text-2xl font-bold text-navy mb-4">About</h2>
                <p className="text-ink/80 leading-relaxed">
                  {student.bio || "No bio provided"}
                </p>
              </div>

              {/* Education Section */}
              {(student.universityName || student.degreeProgram || student.gpa || student.currentSemester) && (
                <div className="bg-white rounded-xl border border-navy/5 p-8">
                  <h2 className="text-2xl font-bold text-navy mb-6">Education</h2>
                  <div className="space-y-4">
                    {student.universityName && (
                      <div>
                        <p className="text-xs text-ink/70 uppercase tracking-wide font-semibold">University</p>
                        <p className="text-navy font-semibold mt-1">{student.universityName}</p>
                      </div>
                    )}
                    {student.degreeProgram && (
                      <div>
                        <p className="text-xs text-ink/70 uppercase tracking-wide font-semibold">Degree Program</p>
                        <p className="text-navy font-semibold mt-1">{student.degreeProgram}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      {student.currentSemester && (
                        <div>
                          <p className="text-xs text-ink/70 uppercase tracking-wide font-semibold">Current Semester</p>
                          <p className="text-navy font-semibold mt-1">{student.currentSemester}</p>
                        </div>
                      )}
                      {student.gpa && (
                        <div>
                          <p className="text-xs text-ink/70 uppercase tracking-wide font-semibold">GPA</p>
                          <p className="text-navy font-semibold mt-1">{student.gpa.toFixed(2)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Skills Section */}
              {skills.length > 0 && (
                <div className="bg-white rounded-xl border border-navy/5 p-8">
                  <h2 className="text-2xl font-bold text-navy mb-4">Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 bg-gold/10 border border-gold/30 text-navy text-sm font-semibold rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Applications Section */}
              {student.applications.length > 0 && (
                <div className="bg-white rounded-xl border border-navy/5 p-8">
                  <h2 className="text-2xl font-bold text-navy mb-6">Recent Applications</h2>
                  <div className="space-y-3">
                    {student.applications.map((app) => (
                      <Link
                        key={app.id}
                        href={`/projects/${app.project.id}`}
                        className="block p-4 border border-navy/10 rounded-lg hover:border-gold hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-bold text-navy hover:text-gold transition-colors">
                              {app.project.title}
                            </h3>
                            <p className="text-sm text-ink/70 mt-1">
                              Application ID: {app.id.substring(0, 8)}...
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 ml-4 ${
                              app.status === "Selected"
                                ? "bg-green-100 text-green-700"
                                : app.status === "Shortlisted"
                                ? "bg-blue-100 text-blue-700"
                                : app.status === "Rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {app.status}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Card */}
              <div className="bg-white rounded-xl border border-navy/5 p-6 space-y-4">
                <h3 className="font-bold text-navy text-lg">Contact Information</h3>
                {student.email && (
                  <div>
                    <p className="text-xs text-ink/70 uppercase tracking-wide font-semibold">Email</p>
                    <a
                      href={`mailto:${student.email}`}
                      className="text-gold hover:underline font-mono text-sm mt-1 break-all"
                    >
                      {student.email}
                    </a>
                  </div>
                )}
                {student.phone && (
                  <div>
                    <p className="text-xs text-ink/70 uppercase tracking-wide font-semibold">Phone</p>
                    <p className="text-navy font-mono text-sm mt-1">{student.phone}</p>
                  </div>
                )}
                {student.location && (
                  <div>
                    <p className="text-xs text-ink/70 uppercase tracking-wide font-semibold">Location</p>
                    <p className="text-navy text-sm mt-1">{student.location}</p>
                  </div>
                )}
                {student.gender && (
                  <div>
                    <p className="text-xs text-ink/70 uppercase tracking-wide font-semibold">Gender</p>
                    <p className="text-navy text-sm mt-1">{student.gender}</p>
                  </div>
                )}
                {age !== null && (
                  <div>
                    <p className="text-xs text-ink/70 uppercase tracking-wide font-semibold">Age</p>
                    <p className="text-navy text-sm mt-1">{age} years</p>
                  </div>
                )}
              </div>

              {/* Verification Card */}
              <div className="bg-white rounded-xl border border-navy/5 p-6">
                <h3 className="font-bold text-navy text-lg mb-4">Verification</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-paper rounded-lg">
                    <span className="text-sm font-semibold text-navy">CNIC Verified</span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        student.cnicVerified
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {student.cnicVerified ? "✓ Verified" : "✗ Not Verified"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Card */}
              <div className="bg-white rounded-xl border border-navy/5 p-6">
                <h3 className="font-bold text-navy text-lg mb-4">Activity Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-navy/10">
                    <span className="text-ink/70">Applications</span>
                    <span className="font-bold text-navy text-lg">{student._count.applications}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-navy/10">
                    <span className="text-ink/70">Submissions</span>
                    <span className="font-bold text-navy text-lg">{student._count.submissions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-ink/70">Certificates</span>
                    <span className="font-bold text-navy text-lg">{student._count.issuedCertificates}</span>
                  </div>
                </div>
              </div>

              {/* Links Card */}
              {(student.portfolioUrl || student.resumeUrl) && (
                <div className="bg-white rounded-xl border border-navy/5 p-6 space-y-3">
                  <h3 className="font-bold text-navy text-lg mb-4">Links</h3>
                  {student.portfolioUrl && (
                    <a
                      href={student.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-2 px-4 bg-gold/10 border border-gold/30 text-gold text-sm font-bold rounded-lg hover:bg-gold hover:text-navy transition-all text-center"
                    >
                      View Portfolio →
                    </a>
                  )}
                  {student.resumeUrl && (
                    <a
                      href={student.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-2 px-4 bg-navy border border-navy text-paper text-sm font-bold rounded-lg hover:bg-navy-dark transition-all text-center"
                    >
                      Download Resume →
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
