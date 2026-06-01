"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ScrollCard from "./ScrollCard";

export type CaseStudy = {
  id: string;
  caseId: string;
  sector: string;
  status: string;
  title: string;
  problem: string;
  solution: string;
  impact: { label: string; value: string }[];
  tech: string[];
};

function ClassifiedStamp({ status }: { status: string }) {
  return (
    <div className="absolute -right-6 -top-4 rotate-[18deg] select-none">
      <div className="rounded-sm border-2 border-[var(--accent)]/60 bg-[var(--accent)]/10 px-3 py-1 backdrop-blur-sm">
        <span className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-[var(--accent)]">
          {status}
        </span>
      </div>
    </div>
  );
}

function Redacted({ children }: { children: React.ReactNode }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <span
      onMouseEnter={() => setRevealed(true)}
      onMouseLeave={() => setRevealed(false)}
      className="relative cursor-crosshair"
    >
      {revealed ? (
        <span className="relative font-mono text-xs text-[var(--text)] transition-all duration-200">
          {children}
        </span>
      ) : (
        <span className="inline-block h-[1.2em] w-[8ch] rounded-sm bg-[var(--text)]/[0.15] align-middle" />
      )}
    </span>
  );
}

export default function CaseStudyCard({
  study,
  index,
  reverse = false,
}: {
  study: CaseStudy;
  index: number;
  reverse?: boolean;
}) {
  return (
    <ScrollCard
      direction={reverse ? "right" : "left"}
      delay={0.1}
      className="relative"
    >
      <div
        className={`group relative grid gap-8 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] transition-all duration-300 hover:border-[var(--accent)]/40 hover:shadow-[0_0_40px_rgba(255,77,0,0.08)] md:grid-cols-2 md:gap-0 ${
          reverse ? "md:direction-rtl" : ""
        }`}
      >
        {/* Declassified flash on hover */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
        >
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.5em] text-[var(--accent)]/40">
            DECLASSIFIED
          </span>
        </motion.div>

        {/* Left / Image side */}
        <div
          className={`relative flex flex-col justify-center p-8 md:p-12 ${
            reverse ? "md:order-2" : "md:order-1"
          }`}
        >
          <ClassifiedStamp status={study.status} />

          <div className="mb-6 flex items-center gap-3">
            <span className="rounded-full border border-[var(--border)] bg-[var(--bg)] px-3 py-1 font-mono text-[9px] uppercase tracking-[0.3em] text-[var(--text-muted)]">
              {study.sector}
            </span>
            <span className="font-mono text-[9px] tracking-wider text-[var(--accent)]/60">
              {study.caseId}
            </span>
          </div>

          <h3 className="mb-4 font-mono text-2xl font-bold leading-tight text-[var(--text)] md:text-3xl">
            {study.title}
          </h3>

          <div className="mb-6">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)]">
              Problem
            </p>
            <p className="font-mono text-sm leading-relaxed text-[var(--text-muted)]">
              {study.problem}
            </p>
          </div>

          <div className="mb-8">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)]">
              Solution
            </p>
            <p className="font-mono text-sm leading-relaxed text-[var(--text)]">
              {study.solution}
            </p>
          </div>

          {/* Tech pills */}
          <div className="flex flex-wrap gap-2">
            {study.tech.map((t) => (
              <span
                key={t}
                className="rounded border border-[var(--border)] px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-[var(--text-muted)] transition-colors duration-200 group-hover:border-[var(--accent)]/30 group-hover:text-[var(--accent)]/70"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Right / Metrics side */}
        <div
          className={`relative flex flex-col justify-center border-t border-[var(--border)] bg-[var(--bg)]/50 p-8 md:border-t-0 md:border-l md:border-[var(--border)] md:p-12 ${
            reverse ? "md:order-1 md:border-l-0 md:border-r" : "md:order-2"
          }`}
        >
          {/* Scan line effect */}
          <motion.div
            initial={{ top: "0%", opacity: 0 }}
            whileInView={{ top: ["0%", "100%", "0%"], opacity: [0, 0.15, 0] }}
            viewport={{ once: false, amount: 0.5 }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "loop",
              ease: "linear",
            }}
            className="pointer-events-none absolute inset-x-0 z-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent"
          />

          <p className="mb-8 font-mono text-[10px] uppercase tracking-[0.4em] text-[var(--accent)]/70">
            Impact Metrics
          </p>

          <div className="grid grid-cols-2 gap-6">
            {study.impact.map((metric) => (
              <div key={metric.label} className="group/metric">
                <div className="font-mono text-3xl font-bold text-[var(--accent)] transition-transform duration-300 group-hover/metric:scale-110 md:text-4xl">
                  <Redacted>{metric.value}</Redacted>
                </div>
                <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.3em] text-[var(--text-muted)]">
                  {metric.label}
                </div>
              </div>
            ))}
          </div>

          {/* Decorative fingerprint pattern */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.03]">
            <svg width="100%" height="100%">
              <defs>
                <pattern
                  id={`fp-${study.id}`}
                  x="0"
                  y="0"
                  width="60"
                  height="60"
                  patternUnits="userSpaceOnUse"
                >
                  <circle
                    cx="30"
                    cy="30"
                    r="28"
                    fill="none"
                    stroke="var(--text)"
                    strokeWidth="0.5"
                  />
                  <circle
                    cx="30"
                    cy="30"
                    r="20"
                    fill="none"
                    stroke="var(--text)"
                    strokeWidth="0.5"
                  />
                  <circle
                    cx="30"
                    cy="30"
                    r="12"
                    fill="none"
                    stroke="var(--text)"
                    strokeWidth="0.5"
                  />
                  <line
                    x1="2"
                    y1="30"
                    x2="58"
                    y2="30"
                    stroke="var(--text)"
                    strokeWidth="0.5"
                  />
                  <line
                    x1="30"
                    y1="2"
                    x2="30"
                    y2="58"
                    stroke="var(--text)"
                    strokeWidth="0.5"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill={`url(#fp-${study.id})`} />
            </svg>
          </div>
        </div>
      </div>
    </ScrollCard>
  );
}
