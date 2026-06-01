"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ScrollCard from "@/components/ScrollCard";
import CountUp from "@/components/CountUp";

// ─── Types ────────────────────────────────────────────────

export type CaseStudy = {
  id: string;
  caseId: string;
  sector: string;
  status: "DEPLOYED" | "RESOLVED" | "PILOT" | "INVESTIGATING";
  title: string;
  tagline: string;
  problem: string;
  solution: string;
  impact: { label: string; value: string }[];
  tech: string[];
};

// ─── Dummy Data (15 cases) ────────────────────────────────

const USE_CASES: CaseStudy[] = [
  {
    id: "uc-001", caseId: "KS-UC-001", sector: "Healthcare", status: "DEPLOYED",
    title: "Medical Document Forgery Detection",
    tagline: "Multi-modal document verification pipeline for health claim fraud.",
    problem: "Health claim fraud costs billions annually. Forged prescriptions, tampered lab reports, and altered discharge summaries slip through manual review at scale.",
    solution: "OCR + layout analysis + anomaly scoring. Every document cross-referenced against authentic templates. Flagged for human review only below threshold.",
    impact: [{ label: "Detection Rate", value: "97.3%" }, { label: "Review Time", value: "-68%" }, { label: "False Positives", value: "2.1%" }, { label: "Throughput", value: "12K/hr" }],
    tech: ["PyTorch", "Tesseract", "LayoutLM", "MLflow", "Kafka"],
  },
  {
    id: "uc-002", caseId: "KS-UC-002", sector: "Finance", status: "RESOLVED",
    title: "Real-Time Transaction Fraud",
    tagline: "Sub-50ms ensemble scoring at the payment gateway.",
    problem: "Digital payment platforms face constant attack from synthetic identities, card-not-present fraud, and money-mule networks operating across borders.",
    solution: "Gradient boosting for velocity patterns, graph neural networks for account-linkage analysis, and transformer-based sequence models for behavioral drift.",
    impact: [{ label: "Latency", value: "42ms" }, { label: "Precision", value: "94.8%" }, { label: "Fraud Blocked", value: "$4.2M" }, { label: "Uptime", value: "99.99%" }],
    tech: ["KServe", "Ray", "PyTorch", "Prometheus", "BentoML"],
  },
  {
    id: "uc-003", caseId: "KS-UC-003", sector: "Insurance", status: "PILOT",
    title: "Claims Anomaly Detection",
    tagline: "Unsupervised anomaly detection on claims embeddings.",
    problem: "Insurance claims fraud spans staged accidents, inflated damage reports, and duplicate billing across providers. Traditional rules catch only the obvious cases.",
    solution: "Autoencoders flag statistical outliers. Rule-augmented GNN traces collusion rings between providers, adjusters, and claimants.",
    impact: [{ label: "Anomalies Caught", value: "8,400" }, { label: "Cost Avoided", value: "$1.8M" }, { label: "Accuracy", value: "91.2%" }, { label: "Speedup", value: "18×" }],
    tech: ["PyTorch", "DVC", "Airflow", "Grafana", "Evidently"],
  },
  {
    id: "uc-004", caseId: "KS-UC-004", sector: "Public Sector", status: "DEPLOYED",
    title: "Welfare Beneficiary Verification",
    tagline: "Identity deduplication via probabilistic record linkage.",
    problem: "Government welfare programs struggle with ghost beneficiaries, identity duplication, and ineligible recipients gaming eligibility criteria across jurisdictions.",
    solution: "Probabilistic record linkage + biometric cross-match. Rule engine enforces policy constraints while ML models predict ineligibility likelihood.",
    impact: [{ label: "Duplicates Found", value: "34K" }, { label: "Savings", value: "$12M" }, { label: "Coverage", value: "99.1%" }, { label: "Latency", value: "120ms" }],
    tech: ["Spark", "MLflow", "Kubernetes", "PostgreSQL", "Kafka"],
  },
  {
    id: "uc-005", caseId: "KS-UC-005", sector: "Healthcare", status: "PILOT",
    title: "Radiology Cross-Modality Correlation",
    tagline: "Correlating findings across radiology scans to surface fraud patterns.",
    problem: "Fraudulent health claims often rely on fabricated or duplicated radiology reports that bypass single-modality checks.",
    solution: "Multi-modal vision transformer pipeline correlating CT, MRI, and X-ray findings. Anomaly scoring flags inconsistent cross-reports.",
    impact: [{ label: "Correlation", value: "96.4%" }, { label: "Reports Checked", value: "45K" }, { label: "Fraud Caught", value: "$2.1M" }, { label: "Time", value: "30ms" }],
    tech: ["PyTorch", "MONAI", "DICOM", "MLflow", "KServe"],
  },
  {
    id: "uc-006", caseId: "KS-UC-006", sector: "Finance", status: "DEPLOYED",
    title: "Synthetic Identity Detection",
    tagline: "Graph neural networks uncovering identity fraud rings.",
    problem: "Synthetic identities combine real and fake data to pass KYC checks, then max out credit lines before vanishing.",
    solution: "GNN models map entity relationships across accounts, devices, and transactions. Clustering surfaces synthetic identity factories.",
    impact: [{ label: "Ring Detection", value: "87.5%" }, { label: "Accounts Flagged", value: "12K" }, { label: "Loss Prevented", value: "$8.4M" }, { label: "Latency", value: "55ms" }],
    tech: ["PyTorch Geometric", "Neo4j", "Kafka", "Ray", "BentoML"],
  },
  {
    id: "uc-007", caseId: "KS-UC-007", sector: "Insurance", status: "INVESTIGATING",
    title: "Repair Shop Collusion Network",
    tagline: "Tracing inflated repair billing across provider networks.",
    problem: "Auto repair shops inflate damage estimates and split overpayments with claimants. Traditional audits miss the network effect.",
    solution: "Network graph analysis on repair shop + adjuster + claimant interactions. Statistical anomalies in billing patterns surface collusion rings.",
    impact: [{ label: "Shops Analyzed", value: "3,200" }, { label: "Suspicious", value: "14%" }, { label: "Est. Recovery", value: "$900K" }, { label: "Speedup", value: "22×" }],
    tech: ["NetworkX", "PyTorch", "Airflow", "PostgreSQL", "Grafana"],
  },
  {
    id: "uc-008", caseId: "KS-UC-008", sector: "Public Sector", status: "PILOT",
    title: "Tax Refund Fraud Filter",
    tagline: "Pre-refund anomaly scoring for fraudulent returns.",
    problem: "Fraudulent tax refunds using stolen identities or fabricated W-2s drain public funds before detection.",
    solution: "Pre-refund risk scoring pipeline: identity verification, income consistency checks, and behavioral anomaly detection.",
    impact: [{ label: "Refunds Checked", value: "2.1M" }, { label: "Fraud Blocked", value: "$5.7M" }, { label: "Precision", value: "93.1%" }, { label: "Latency", value: "80ms" }],
    tech: ["Spark", "MLflow", "DVC", "Kafka", "Kubernetes"],
  },
  {
    id: "uc-009", caseId: "KS-UC-009", sector: "Healthcare", status: "RESOLVED",
    title: "Phantom Billing Detection",
    tagline: "Identifying services billed but never rendered.",
    problem: "Providers bill for appointments, procedures, and medications that never happened — especially in high-volume specialties.",
    solution: "Cross-referencing claims against appointment systems, pharmacy fulfillment logs, and patient confirmation channels.",
    impact: [{ label: "Phantom Claims", value: "18K" }, { label: "Recovery", value: "$3.2M" }, { label: "Accuracy", value: "95.7%" }, { label: "Speedup", value: "15×" }],
    tech: ["PyTorch", "Airflow", "PostgreSQL", "Prometheus", "Grafana"],
  },
  {
    id: "uc-010", caseId: "KS-UC-010", sector: "Finance", status: "PILOT",
    title: "Insider Trading Pattern Detection",
    tagline: "Behavioral sequence analysis on trading activity.",
    problem: "Insider trading leaves subtle timing and volume patterns that traditional surveillance rules cannot express.",
    solution: "Transformer-based sequence models on trading behavior. Detects anomalous pre-announcement position changes and coordinated account activity.",
    impact: [{ label: "Patterns Found", value: "1,240" }, { label: "Alerts", value: "89" }, { label: "Investigation Rate", value: "78%" }, { label: "Latency", value: "200ms" }],
    tech: ["PyTorch", "Ray", "Kafka", "MLflow", "Grafana"],
  },
  {
    id: "uc-011", caseId: "KS-UC-011", sector: "Insurance", status: "DEPLOYED",
    title: "Disability Claims Verification",
    tagline: "Activity signal correlation against disability assertions.",
    problem: "Fraudulent disability claims rely on self-reported limitations that are hard to verify against real-world activity.",
    solution: "Anonymized activity signal correlation (with consent) against claim assertions. ML models detect inconsistencies without privacy breach.",
    impact: [{ label: "Claims Verified", value: "56K" }, { label: "Fraud Rate", value: "4.3%" }, { label: "Savings", value: "$6.1M" }, { label: "Accuracy", value: "92.8%" }],
    tech: ["PyTorch", "KServe", "Kubernetes", "PostgreSQL", "Evidently"],
  },
  {
    id: "uc-012", caseId: "KS-UC-012", sector: "Public Sector", status: "INVESTIGATING",
    title: "Procurement Bid Rigging",
    tagline: "Detecting collusion patterns in public tenders.",
    problem: "Bid rigging in government procurement costs taxpayers billions. Colluding vendors rotate wins and inflate prices.",
    solution: "Network analysis on bid submission patterns, pricing correlations, and vendor relationship graphs across procurement cycles.",
    impact: [{ label: "Tenders Analyzed", value: "8,900" }, { label: "Suspicious", value: "6.2%" }, { label: "Est. Overcharge", value: "$4.5M" }, { label: "Speedup", value: "30×" }],
    tech: ["NetworkX", "PyTorch", "Airflow", "DVC", "Grafana"],
  },
  {
    id: "uc-013", caseId: "KS-UC-013", sector: "Healthcare", status: "PILOT",
    title: "Prescription Fraud Network",
    tagline: "Tracing pill-mill patterns across pharmacies and prescribers.",
    problem: "Opioid and controlled substance fraud involves colluding prescribers, pharmacies, and patients creating artificial demand.",
    solution: "Graph analysis on prescriber-pharmacy-patient triangles. Anomaly detection on dosage patterns, refill frequency, and geographic clustering.",
    impact: [{ label: "Networks Found", value: "23" }, { label: "Prescribers Flagged", value: "187" }, { label: "Pills Tracked", value: "4.2M" }, { label: "Accuracy", value: "94.1%" }],
    tech: ["Neo4j", "PyTorch", "Kafka", "MLflow", "Prometheus"],
  },
  {
    id: "uc-014", caseId: "KS-UC-014", sector: "Finance", status: "DEPLOYED",
    title: "Cross-Border Money Laundering",
    tagline: "Entity resolution across fragmented transaction records.",
    problem: "Money launderers fragment transactions across borders, currencies, and shell entities to evade detection thresholds.",
    solution: "Entity resolution pipeline unifies fragmented records. GNN models trace fund flow through shell company layers.",
    impact: [{ label: "Entities Resolved", value: "1.8M" }, { label: "Suspicious Flows", value: "$14M" }, { label: "Precision", value: "89.3%" }, { label: "Latency", value: "150ms" }],
    tech: ["Spark", "PyTorch Geometric", "Kafka", "MLflow", "Grafana"],
  },
  {
    id: "uc-015", caseId: "KS-UC-015", sector: "Insurance", status: "RESOLVED",
    title: "Catastrophe Claim Inflation",
    tagline: "Post-disaster claim surge anomaly detection.",
    problem: "After natural disasters, fraudulent claims spike — from completely fabricated damage to inflated repair estimates.",
    solution: "Baseline property damage models compared against post-event claims. Satellite imagery + claims data fusion for ground-truth verification.",
    impact: [{ label: "Claims Checked", value: "89K" }, { label: "Fraudulent", value: "7.8%" }, { label: "Savings", value: "$11M" }, { label: "Speedup", value: "12×" }],
    tech: ["PyTorch", "Satellite Imagery", "Airflow", "DVC", "KServe"],
  },
];

// ─── Sector Filter ────────────────────────────────────────

const ALL_SECTORS = ["All", ...Array.from(new Set(USE_CASES.map((c) => c.sector)))];

const STATUS_COLORS: Record<string, string> = {
  DEPLOYED: "border-emerald-500/40 text-emerald-400",
  RESOLVED: "border-blue-500/40 text-blue-400",
  PILOT: "border-amber-500/40 text-amber-400",
  INVESTIGATING: "border-[var(--accent)]/40 text-[var(--accent)]",
};

// ─── Components ───────────────────────────────────────────

function CompactCard({
  study,
  onClick,
}: {
  study: CaseStudy;
  onClick: () => void;
}) {
  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16, scale: 0.98 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      onClick={onClick}
      className="group relative w-full overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 text-left transition-all duration-200 hover:border-[var(--accent)]/40 hover:shadow-[0_0_24px_rgba(255,77,0,0.06)] md:p-6"
    >
      {/* Status stamp */}
      <div className="absolute -right-3 -top-2 rotate-[14deg] select-none opacity-60 transition-opacity group-hover:opacity-100">
        <div className={`rounded-sm border px-2 py-0.5 backdrop-blur-sm ${STATUS_COLORS[study.status]}`}>
          <span className="font-mono text-[8px] font-bold uppercase tracking-[0.25em]">
            {study.status}
          </span>
        </div>
      </div>

      {/* Top row: ID + Sector */}
      <div className="mb-3 flex items-center gap-2">
        <span className="font-mono text-[9px] tracking-wider text-[var(--accent)]/70">
          {study.caseId}
        </span>
        <span className="h-3 w-px bg-[var(--border)]" />
        <span className="rounded-full border border-[var(--border)] bg-[var(--bg)] px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
          {study.sector}
        </span>
      </div>

      {/* Title */}
      <h3 className="mb-2 font-mono text-sm font-bold leading-snug text-[var(--text)] transition-colors group-hover:text-[var(--accent)] md:text-base">
        {study.title}
      </h3>

      {/* Tagline */}
      <p className="mb-4 font-mono text-[11px] leading-relaxed text-[var(--text-muted)] line-clamp-2">
        {study.tagline}
      </p>

      {/* 2 key metrics */}
      <div className="mb-4 flex gap-4">
        {study.impact.slice(0, 2).map((m) => (
          <div key={m.label}>
            <div className="font-mono text-lg font-bold text-[var(--accent)]">
              <CountUp value={m.value} />
            </div>
            <div className="font-mono text-[8px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
              {m.label}
            </div>
          </div>
        ))}
      </div>

      {/* Tech pills */}
      <div className="flex flex-wrap gap-1.5">
        {study.tech.slice(0, 4).map((t) => (
          <span
            key={t}
            className="rounded border border-[var(--border)] px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider text-[var(--text-muted)] transition-colors group-hover:border-[var(--accent)]/20 group-hover:text-[var(--accent)]/60"
          >
            {t}
          </span>
        ))}
        {study.tech.length > 4 && (
          <span className="font-mono text-[8px] text-[var(--text-muted)]">
            +{study.tech.length - 4}
          </span>
        )}
      </div>
    </motion.button>
  );
}

function DetailPanel({
  study,
  onClose,
}: {
  study: CaseStudy | null;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  if (!study) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[200] flex justify-end bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          ref={panelRef}
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative h-full w-full max-w-2xl overflow-y-auto border-l border-[var(--border)] bg-[var(--bg)] p-8 md:p-12"
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute right-6 top-6 font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)] transition-colors hover:text-[var(--accent)]"
          >
            [ CLOSE ]
          </button>

          {/* Header */}
          <div className="mb-10 mt-4">
            <div className="mb-4 flex items-center gap-3">
              <span className="font-mono text-[10px] tracking-wider text-[var(--accent)]">
                {study.caseId}
              </span>
              <span className="h-3 w-px bg-[var(--border)]" />
              <span className={`rounded-sm border px-2 py-0.5 font-mono text-[8px] font-bold uppercase tracking-[0.25em] ${STATUS_COLORS[study.status]}`}>
                {study.status}
              </span>
            </div>
            <h2 className="mb-3 font-mono text-2xl font-bold text-[var(--text)] md:text-3xl">
              {study.title}
            </h2>
            <p className="font-mono text-sm leading-relaxed text-[var(--text-muted)]">
              {study.tagline}
            </p>
          </div>

          {/* Problem & Solution */}
          <div className="mb-10 space-y-6">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)]">
                Problem
              </p>
              <p className="font-mono text-sm leading-relaxed text-[var(--text)]">
                {study.problem}
              </p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)]">
                Solution
              </p>
              <p className="font-mono text-sm leading-relaxed text-[var(--text)]">
                {study.solution}
              </p>
            </div>
          </div>

          {/* Metrics */}
          <div className="mb-10">
            <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.4em] text-[var(--accent)]/70">
              Impact Metrics
            </p>
            <div className="grid grid-cols-2 gap-4">
              {study.impact.map((m) => (
                <div
                  key={m.label}
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 transition-colors hover:border-[var(--accent)]/30"
                >
                  <div className="font-mono text-2xl font-bold text-[var(--accent)]">
                    <CountUp value={m.value} />
                  </div>
                  <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.3em] text-[var(--text-muted)]">
                    {m.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tech */}
          <div className="mb-10">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.4em] text-[var(--accent)]/70">
              Technology Stack
            </p>
            <div className="flex flex-wrap gap-2">
              {study.tech.map((t) => (
                <span
                  key={t}
                  className="rounded border border-[var(--border)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center">
            <p className="mb-3 font-mono text-sm text-[var(--text-muted)]">
              Want similar results in {study.sector.toLowerCase()}?
            </p>
            <a
              href="/contact"
              className="inline-block rounded-full border border-[var(--accent)] px-6 py-2 font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--accent)] transition-all duration-200 hover:bg-[var(--accent)] hover:text-white"
            >
              Initiate Contact →
            </a>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Page ─────────────────────────────────────────────────

export default function UseCasesPage() {
  const [activeSector, setActiveSector] = useState("All");
  const [selectedCase, setSelectedCase] = useState<CaseStudy | null>(null);

  const filtered =
    activeSector === "All"
      ? USE_CASES
      : USE_CASES.filter((c) => c.sector === activeSector);

  return (
    <main className="relative min-h-screen pt-32 pb-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <ScrollCard className="mb-12">
          <div className="mb-2 flex items-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[var(--accent)]/35" />
            <span className="font-mono text-[9px] tracking-[0.45em] uppercase text-[var(--accent)]/75">
              Chamber 03 // Classified Archive
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[var(--accent)]/35" />
          </div>

          <div className="grid gap-6 md:grid-cols-[1fr_300px] md:items-end">
            <div>
              <span className="pointer-events-none select-none font-mono text-[100px] font-bold leading-none text-[var(--text)]/[0.03] md:text-[140px]">
                03
              </span>
              <h1 className="-mt-8 font-mono text-4xl font-bold text-[var(--text)] md:text-5xl">
                Use Cases
              </h1>
              <p className="mt-4 max-w-xl font-mono text-sm leading-relaxed text-[var(--text-muted)]">
                Real-world deployments where fraud was identified, traced, and neutralized.
                Each dossier represents a live operation — from incident detection to governed resolution.
              </p>
            </div>

            <div className="grid gap-px overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
              {[
                { label: "Total Cases", value: String(USE_CASES.length) },
                { label: "Sectors", value: String(ALL_SECTORS.length - 1) },
                { label: "Active", value: String(USE_CASES.filter((c) => c.status === "DEPLOYED" || c.status === "PILOT").length) },
              ].map((item) => (
                <div
                  key={item.label}
                  className="grid grid-cols-[100px_1fr] items-center gap-4 border-b border-[var(--border)]/80 px-4 py-3 last:border-b-0"
                >
                  <span className="font-mono text-[9px] tracking-[0.35em] uppercase text-[var(--text-muted)]">
                    {item.label}
                  </span>
                  <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-[var(--text)]">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </ScrollCard>

        {/* Sector Filters */}
        <ScrollCard delay={0.1} className="mb-10">
          <div className="flex flex-wrap gap-2">
            {ALL_SECTORS.map((sector) => (
              <button
                key={sector}
                onClick={() => setActiveSector(sector)}
                className={`rounded-full border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] transition-all duration-200 ${
                  activeSector === sector
                    ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                    : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)]/40 hover:text-[var(--text)]"
                }`}
              >
                {sector}
                {sector !== "All" && (
                  <span className="ml-2 opacity-60">
                    {USE_CASES.filter((c) => c.sector === sector).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </ScrollCard>

        {/* Results count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)]">
            Showing {filtered.length} dossier{filtered.length !== 1 ? "s" : ""}
          </p>
          <div className="h-px flex-1 bg-gradient-to-r from-[var(--border)] to-transparent ml-4" />
        </div>

        {/* Grid */}
        <motion.div layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((study) => (
              <CompactCard
                key={study.id}
                study={study}
                onClick={() => setSelectedCase(study)}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="py-24 text-center">
            <p className="font-mono text-sm text-[var(--text-muted)]">
              No dossiers found in this sector.
            </p>
          </div>
        )}
      </div>

      {/* Detail Panel */}
      <AnimatePresence>
        {selectedCase && (
          <DetailPanel
            study={selectedCase}
            onClose={() => setSelectedCase(null)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
