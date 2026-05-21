"use client";

import RulerCarousel, { CarouselItem } from "@/components/RulerCarousel";

const ACHIEVEMENTS: CarouselItem[] = [
  {
    id: 1,
    badge: "Runner-up · 2nd Place",
    title: "NHA Hackathon — Problem Statement 2",
    subtitle: "National Health Authority",
    description:
      "Radiological image-based correlation — built an AI pipeline to detect anomalies across radiology scans, correlating findings across modalities to surface fraud patterns in health claim submissions.",
    year: "2024",
    meta: "PS-02 · Radiology",
  },
  {
    id: 2,
    badge: "3rd Place",
    title: "NHA Hackathon — Problem Statement 3",
    subtitle: "National Health Authority",
    description:
      "Document forgery detection — engineered a multi-modal verification system to identify tampered or forged medical documents, combining OCR, layout analysis, and anomaly scoring.",
    year: "2024",
    meta: "PS-03 · Document Integrity",
  },
  {
    id: 3,
    badge: "Coming Soon",
    title: "More Achievements Incoming",
    subtitle: "Kantaka Śodhana",
    description:
      "We are actively competing, publishing, and deploying. Watch this space.",
    year: "2025–",
    meta: "TBA",
  },
];

export default function AchievementsPage() {
  return (
    <main className="min-h-screen pt-32 pb-24 px-6">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-20 text-center">
          <p className="font-mono text-[10px] tracking-[0.5em] text-[var(--accent)] uppercase mb-4">
            Track Record
          </p>
          <h1 className="font-mono text-5xl md:text-7xl font-bold text-[var(--text)] leading-tight mb-6">
            Achievements
          </h1>
          <p className="font-mono text-sm text-[var(--text-muted)] max-w-md mx-auto leading-relaxed">
            Every thorn removed is proof of the system. These are our filed records.
          </p>
        </div>

        {/* Stat strip */}
        <div className="mb-20 grid grid-cols-3 gap-px border border-[var(--border)] rounded-2xl overflow-hidden">
          {[
            { value: "2", label: "Hackathon Podiums" },
            { value: "NHA", label: "National Health Authority" },
            { value: "2024", label: "Year of Recognition" },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-[var(--surface)] px-8 py-6 text-center"
            >
              <div className="font-mono text-3xl font-bold text-[var(--accent)] mb-1">
                {s.value}
              </div>
              <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-[var(--text-muted)]">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Carousel */}
        <RulerCarousel items={ACHIEVEMENTS} />

        {/* Bottom note */}
        <div className="mt-20 text-center border-t border-[var(--border)] pt-12">
          <p className="font-mono text-[10px] tracking-[0.4em] uppercase text-[var(--text-muted)]">
            Kantaka Śodhana · Recognition Log · Updated 2024
          </p>
        </div>
      </div>
    </main>
  );
}
