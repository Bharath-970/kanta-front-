"use client";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/Accordion";

const PILLARS = [
  {
    id: "detect",
    question: "How do we detect fraud at scale?",
    answer:
      "We deploy ensemble models — gradient boosting, graph neural networks, and transformer-based anomaly detectors — trained on real transaction patterns. Detection runs in <50ms per event via KServe inference endpoints, with real-time alerting through Kafka streams.",
  },
  {
    id: "trace",
    question: "How do we trace fraud back to its source?",
    answer:
      "Every flagged event is linked to a full audit trail: data lineage (DVC), model version (MLflow), and decision rationale (SHAP explanations). Investigators get a complete chain of evidence — from raw input to final verdict.",
  },
  {
    id: "govern",
    question: "How do we ensure model governance?",
    answer:
      "Models are gated by a multi-stage registry: development → staging → shadow mode → production. Drift detection runs continuously via Evidently. Rollbacks are automated when performance degrades past defined thresholds.",
  },
  {
    id: "deploy",
    question: "What does the deployment pipeline look like?",
    answer:
      "Airflow orchestrates training DAGs. Ray Tune handles hyperparameter optimization across distributed workers. BentoML packages models into reproducible services. Kubernetes manages scaling and health. Prometheus + Grafana surface everything in real time.",
  },
  {
    id: "why",
    question: "Why Kantaka Śodhana — what does the name mean?",
    answer:
      "In Kautilya's Arthashastra (300 BCE), Kantaka Śodhana means 'removal of thorns' — the proactive purging of corrupt elements from the marketplace to protect honest commerce. We've brought this 2,300-year-old concept into the 21st century. Fraud is the thorn. We extract it.",
  },
];

export default function WhatWeDoPage() {
  return (
    <main className="min-h-screen pt-32 pb-24 px-6">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-20">
          <p className="font-mono text-[10px] tracking-[0.5em] text-[var(--accent)] uppercase mb-4">
            Philosophy &amp; Approach
          </p>
          <h1 className="font-mono text-5xl md:text-7xl font-bold text-[var(--text)] leading-tight mb-8">
            What We Do
          </h1>
          <p className="font-mono text-sm text-[var(--text-muted)] max-w-xl leading-relaxed">
            Fraud is not a data problem. It is a governance problem. We solve
            both — with AI pipelines built for production from day one.
          </p>
        </div>

        {/* Manifesto block */}
        <div className="mb-20 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent" />
          <p className="font-mono text-[10px] tracking-[0.4em] uppercase text-[var(--accent)] mb-6">
            The Arthashastra Principle
          </p>
          <blockquote className="font-mono text-2xl md:text-3xl font-bold text-[var(--text)] leading-tight mb-6">
            &ldquo;The removal of thorns — proactive, systematic, complete.&rdquo;
          </blockquote>
          <p className="font-mono text-sm text-[var(--text-muted)] leading-relaxed max-w-2xl">
            Kautilya understood that corruption left unchecked compounds. A
            single bad actor emboldens others. The system must root out fraud at
            the source — not react to it after the damage is done. That is
            Kantaka Śodhana. That is us.
          </p>
        </div>

        {/* Process steps */}
        <div className="mb-20 grid grid-cols-1 md:grid-cols-2 gap-px border border-[var(--border)] rounded-2xl overflow-hidden">
          {[
            { step: "01", label: "Ingest", desc: "Raw data, real time, any source" },
            { step: "02", label: "Detect", desc: "Sub-50ms inference at event stream" },
            { step: "03", label: "Trace", desc: "Full audit trail, SHAP explanations" },
            { step: "04", label: "Govern", desc: "Drift detection, automated rollback" },
          ].map((p) => (
            <div key={p.step} className="bg-[var(--surface)] px-8 py-7">
              <div className="font-mono text-[10px] tracking-[0.4em] uppercase text-[var(--accent)] mb-2">
                {p.step}
              </div>
              <div className="font-mono text-lg font-bold text-[var(--text)] mb-1">
                {p.label}
              </div>
              <div className="font-mono text-xs text-[var(--text-muted)]">
                {p.desc}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Accordion */}
        <div className="mb-12">
          <p className="font-mono text-[10px] tracking-[0.5em] text-[var(--accent)] uppercase mb-8">
            Deep Dive
          </p>
          <Accordion type="single" collapsible className="w-full">
            {PILLARS.map((p) => (
              <AccordionItem key={p.id} value={p.id}>
                <AccordionTrigger>{p.question}</AccordionTrigger>
                <AccordionContent>{p.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Bottom CTA */}
        <div className="text-center pt-12 border-t border-[var(--border)]">
          <p className="font-mono text-[10px] tracking-[0.4em] uppercase text-[var(--text-muted)] mb-6">
            See the stack that makes this possible
          </p>
          <a
            href="/what-we-build"
            className="inline-block rounded-full border border-[var(--accent)] px-8 py-3 font-mono text-[11px] tracking-[0.2em] uppercase text-[var(--accent)] transition-all duration-200 hover:bg-[var(--accent)] hover:text-white"
          >
            What We Build →
          </a>
        </div>
      </div>
    </main>
  );
}
