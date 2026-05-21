"use client";

import TeamShowcase, { TeamMember } from "@/components/TeamShowcase";

const TEAM: TeamMember[] = [
  {
    id: "1",
    name: "Member 1",
    role: "Founder & CEO",
    image: "",
    social: { linkedin: "#", twitter: "#" },
  },
  {
    id: "2",
    name: "Member 2",
    role: "CTO",
    image: "",
    social: { linkedin: "#", twitter: "#" },
  },
  {
    id: "3",
    name: "Member 3",
    role: "ML Engineer",
    image: "",
    social: { linkedin: "#" },
  },
  {
    id: "4",
    name: "Member 4",
    role: "Full-Stack Developer",
    image: "",
    social: { linkedin: "#" },
  },
  {
    id: "5",
    name: "Member 5",
    role: "Data Scientist",
    image: "",
    social: { linkedin: "#" },
  },
  {
    id: "6",
    name: "Member 6",
    role: "DevOps Engineer",
    image: "",
    social: { linkedin: "#" },
  },
];

export default function TeamPage() {
  return (
    <main className="min-h-screen pt-32 pb-24 px-6">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-20 text-center">
          <p className="font-mono text-[10px] tracking-[0.5em] text-[var(--accent)] uppercase mb-4">
            The People
          </p>
          <h1 className="font-mono text-5xl md:text-7xl font-bold text-[var(--text)] leading-tight mb-6">
            Our Team
          </h1>
          <p className="font-mono text-sm text-[var(--text-muted)] max-w-md mx-auto leading-relaxed">
            Six people. One mission. Remove the thorns.
          </p>
        </div>

        {/* Team showcase */}
        <TeamShowcase members={TEAM} />

        {/* Bottom note */}
        <div className="mt-20 text-center border-t border-[var(--border)] pt-12">
          <p className="font-mono text-[10px] tracking-[0.4em] uppercase text-[var(--text-muted)] mb-6">
            Want to join us?
          </p>
          <a
            href="/contact"
            className="inline-block rounded-full border border-[var(--accent)] px-8 py-3 font-mono text-[11px] tracking-[0.2em] uppercase text-[var(--accent)] transition-all duration-200 hover:bg-[var(--accent)] hover:text-white"
          >
            Get in Touch →
          </a>
        </div>
      </div>
    </main>
  );
}
