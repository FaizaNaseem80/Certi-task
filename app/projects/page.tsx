"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/Button";

interface Project {
  id: string;
  title: string;
  company: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  description: string;
  tags: string[];
  slots: string;
}

const mockProjects: Project[] = [
  {
    id: "proj-001",
    title: "SaaS Analytics Dashboard UI",
    company: "Apex Global Solutions",
    category: "Design & Frontend",
    difficulty: "Intermediate",
    duration: "4 weeks",
    description: "Design and implement a responsive analytics dashboard interface using React and Tailwind CSS. The dashboard must render real-time charts and allow data exporting.",
    tags: ["React", "Tailwind CSS", "Chart.js", "TypeScript"],
    slots: "3/4 slots open",
  },
  {
    id: "proj-002",
    title: "Secure Payment API Integration",
    company: "Summit Financial Tech",
    category: "Backend & Security",
    difficulty: "Advanced",
    duration: "6 weeks",
    description: "Build a middleware bridge connecting a Stripe payment pipeline with custom transaction ledger APIs. Implement validation rules, request signing, and error logging.",
    tags: ["Node.js", "Express", "Stripe API", "Cryptographic Signing"],
    slots: "1/2 slots open",
  },
  {
    id: "proj-003",
    title: "Brand Identity Design Assets",
    company: "Vanguard Creative Labs",
    category: "Design & Frontend",
    difficulty: "Beginner",
    duration: "2 weeks",
    description: "Create standard vector assets, color palettes, and interactive prototypes for a new green-energy branding project. Create responsive layout guidelines for product teams.",
    tags: ["Figma", "UI Design", "Vector Graphics", "Prototyping"],
    slots: "Closed (In Progress)",
  },
  {
    id: "proj-004",
    title: "Genomic Sequence Matcher Algorithm",
    company: "BioHealth Systems",
    category: "Data & Algorithms",
    difficulty: "Advanced",
    duration: "8 weeks",
    description: "Optimize an alignment algorithm in Python to match genome subsequences. Build a lightweight REST API wrapper using FastAPI to process search requests in parallel.",
    tags: ["Python", "FastAPI", "Data Analysis", "Parallel Computing"],
    slots: "2/3 slots open",
  },
  {
    id: "proj-005",
    title: "LMS Classroom Feature Modules",
    company: "EduLearn Networks",
    category: "Backend & Security",
    difficulty: "Intermediate",
    duration: "5 weeks",
    description: "Create backend REST handlers for scheduling virtual classes, managing student attendance registries, and issuing automated digital quiz certificates.",
    tags: ["TypeScript", "Next.js", "PostgreSQL", "Prisma"],
    slots: "4/5 slots open",
  },
  {
    id: "proj-006",
    title: "Quantum Algorithm Simulator",
    company: "Quantum Logix",
    category: "Data & Algorithms",
    difficulty: "Advanced",
    duration: "10 weeks",
    description: "Translate mathematical quantum gates (Hadamard, CNOT) into Python matrix operations, providing a terminal-based simulator for running quantum circuits.",
    tags: ["Python", "NumPy", "Linear Algebra", "Scientific Computing"],
    slots: "1/2 slots open",
  },
];

const categories = ["All", "Design & Frontend", "Backend & Security", "Data & Algorithms"];
const difficulties = ["All", "Beginner", "Intermediate", "Advanced"];

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [showAll, setShowAll] = useState(false);
  const [dbProjects, setDbProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("/api/projects");
        if (res.ok) {
          const data = await res.json();
          const mapped = data.projects.map((p: any) => ({
            id: p.id,
            title: p.title,
            company: p.company?.name || "Unknown Company",
            category: "General",
            difficulty: "Intermediate",
            duration: p.deadline || "TBD",
            description: p.description,
            tags: p.requiredSkills ? p.requiredSkills.split(",").map((s: string) => s.trim()) : [],
            slots: `${p.teamCap} team cap`,
          }));
          setDbProjects(mapped);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const filteredProjects = dbProjects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === "All" || project.category === selectedCategory;

    const matchesDifficulty =
      selectedDifficulty === "All" || project.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const displayedProjects = showAll ? filteredProjects : filteredProjects.slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Page Header */}
      <section className="bg-gradient-to-b from-navy-dark to-navy text-paper py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#C9A227_1px,transparent_1px),linear-gradient(to_bottom,#C9A227_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider bg-gold/15 text-gold border border-gold/30">
            Showcase Listings
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Browse Active <span className="text-gold">Projects</span>
          </h1>
          <p className="text-paper/85 text-lg max-w-2xl mx-auto leading-relaxed">
            Discover real-world engineering, design, and analysis projects posted directly by corporate sponsors. Get ready to prove your skills.
          </p>
        </div>
      </section>

      {/* Directory & Filters Section */}
      <section className="py-20 bg-paper text-ink flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Search and Filters Bar */}
          <div className="bg-white p-6 rounded-xl border border-navy/5 shadow-xs space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search Bar Input */}
              <div className="md:col-span-3 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-navy/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by project title, company, skills tag..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-paper border border-navy/15 rounded-lg text-ink font-sans focus:outline-hidden focus:ring-2 focus:ring-gold/50 focus:border-gold transition-colors text-sm"
                />
              </div>
              <Button
                variant="primary"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                  setSelectedDifficulty("All");
                  setShowAll(false);
                }}
                className="w-full"
              >
                Reset Filters
              </Button>
            </div>

            {/* Category Filters */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-navy/5">
              <div className="space-y-1.5 w-full">
                <span className="block text-xs font-bold text-navy/70 uppercase tracking-wide">Category</span>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        selectedCategory === cat
                          ? "bg-navy text-gold border-navy"
                          : "bg-paper text-navy border-navy/10 hover:border-gold hover:text-gold"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 w-full">
                <span className="block text-xs font-bold text-navy/70 uppercase tracking-wide">Difficulty Level</span>
                <div className="flex flex-wrap gap-2">
                  {difficulties.map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        selectedDifficulty === diff
                          ? "bg-navy text-gold border-navy"
                          : "bg-paper text-navy border-navy/10 hover:border-gold hover:text-gold"
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex justify-between items-center text-sm text-ink/70">
            <p>
              Showing <span className="font-bold text-navy">{filteredProjects.length}</span> {filteredProjects.length === 1 ? "project" : "projects"}
            </p>
          </div>

          {/* Projects Grid */}
          {loading ? (
            <div className="text-center py-16">
              <p className="text-navy font-bold">Loading real-world projects...</p>
            </div>
          ) : filteredProjects.length > 0 ? (
            <div className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {displayedProjects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-white p-6 rounded-xl border border-navy/5 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-bold text-gold uppercase tracking-wider bg-gold/10 px-2 py-0.5 rounded border border-gold/10">
                            {project.category}
                          </span>
                          <h3 className="font-sans font-bold text-xl text-navy mt-2 leading-snug">{project.title}</h3>
                          <p className="text-xs font-semibold text-ink/60">Sponsor: <span className="text-navy">{project.company}</span></p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded border shrink-0 ${
                          project.difficulty === "Beginner"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : project.difficulty === "Intermediate"
                            ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}>
                          {project.difficulty}
                        </span>
                      </div>

                      <p className="text-sm text-ink/80 leading-relaxed">
                        {project.description}
                      </p>

                      {/* Tech Tags */}
                      <div className="flex flex-wrap gap-1.5">
                        {project.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded bg-paper text-navy text-[10px] font-semibold border border-navy/5"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-navy/5 mt-6">
                      <div className="flex justify-between items-center text-xs text-ink/75">
                        <span className="flex items-center gap-1">
                          <svg className="h-4 w-4 text-gold shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {project.duration}
                        </span>
                        <span className="font-semibold text-gold">{project.slots}</span>
                      </div>
                      <button
                        onClick={() => alert(`Login required. To apply or view the workspaces for this project, please click 'Login' or 'Get Started' to sign in to the application.`)}
                        className="w-full py-2.5 rounded-lg bg-navy text-paper text-xs font-bold hover:bg-navy-dark transition-all duration-300 cursor-pointer text-center border border-navy"
                      >
                        Apply to Project
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {!showAll && filteredProjects.length > 3 && (
                <div className="text-center pt-4">
                  <button
                    onClick={() => setShowAll(true)}
                    className="inline-flex items-center justify-center px-10 py-3.5 rounded-lg bg-navy text-gold hover:bg-navy-dark text-sm font-bold transition-all duration-300 cursor-pointer border border-gold/15"
                  >
                    View All Projects ({filteredProjects.length})
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl border border-navy/5">
              <svg className="h-12 w-12 text-gold mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="font-sans font-bold text-xl text-navy mb-2">No Projects Found</h3>
              <p className="text-sm text-ink/70">
                Try widening your search keywords or choosing a different category or difficulty filter.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-navy text-paper text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl font-extrabold text-paper tracking-tight">Looking to Post a Project?</h2>
          <p className="text-paper/85 max-w-xl mx-auto">
            Submit your development tasks or UX audits to the CertiTask student community. Check reviews and scale teams.
          </p>
          <div className="pt-4">
            <Button href="/contact" variant="gold">
              Contact Sales &amp; Onboard
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
