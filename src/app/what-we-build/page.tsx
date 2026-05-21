"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SegmentedControl, { Segment } from "@/components/SegmentedControl";

const SEGMENTS: Segment[] = [
  { id: "pipelines", label: "Data Pipelines" },
  { id: "training", label: "Training" },
  { id: "deployment", label: "Deployment" },
];

const PIPELINE_STEPS = [
  { id: "ingest", label: "Ingest", tech: "Kafka", desc: "Real-time event streams from any source. Sub-10ms latency." },
  { id: "validate", label: "Validate", tech: "Great Expectations", desc: "Schema enforcement, null checks, distribution monitoring at ingestion." },
  { id: "transform", label: "Transform", tech: "Airflow + dbt", desc: "DAG-orchestrated feature engineering. Versioned with DVC." },
  { id: "store", label: "Store", tech: "Feature Store", desc: "Point-in-time correct feature retrieval for training and serving." },
];

const TRAINING_STEPS = [
  { id: "experiment", label: "Experiment", tech: "MLflow", desc: "Every run tracked: params, metrics, artifacts, environment." },
  { id: "tune", label: "Tune", tech: "Ray Tune", desc: "Distributed hyperparameter search across GPU workers." },
  { id: "evaluate", label: "Evaluate", tech: "Evidently + SHAP", desc: "Model performance, bias, and explainability reports per run." },
  { id: "register", label: "Register", tech: "MLflow Registry", desc: "Staged model promotion: Staging → Shadow → Production." },
];

const DEPLOYMENT_STEPS = [
  { id: "package", label: "Package", tech: "BentoML", desc: "Reproducible model services. Docker-native, API-first." },
  { id: "serve", label: "Serve", tech: "KServe", desc: "Kubernetes-native inference. <50ms p99 at production load." },
  { id: "monitor", label: "Monitor", tech: "Prometheus + Grafana", desc: "Real-time latency, drift, and error dashboards. Auto-alerts." },
  { id: "rollback", label: "Rollback", tech: "Airflow", desc: "Automated rollback when drift or performance thresholds breach." },
];

const CONTENT: Record<string, typeof PIPELINE_STEPS> = {
  pipelines: PIPELINE_STEPS,
  training: TRAINING_STEPS,
  deployment: DEPLOYMENT_STEPS,
};

const TECH_BY_SEGMENT: Record<string, string[]> = {
  pipelines: ["Apache Kafka", "Apache Airflow", "dbt", "DVC", "Great Expectations"],
  training: ["MLflow", "Ray Tune", "PyTorch", "SHAP", "Evidently"],
  deployment: ["BentoML", "KServe", "Kubernetes", "Prometheus", "Grafana"],
};

export default function WhatWeBuildPage() {
  const [active, setActive] = useState("pipelines");

  const steps = CONTENT[active];

  return (
    <main className="min-h-screen pt-32 pb-24 px-6">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-16 text-center">
          <p className="font-mono text-[10px] tracking-[0.5em] text-[var(--accent)] uppercase mb-4">
            The Stack
          </p>
          <h1 className="font-mono text-5xl md:text-7xl font-bold text-[var(--text)] leading-tight mb-6">
            What We Build
          </h1>
          <p className="font-mono text-sm text-[var(--text-muted)] max-w-md mx-auto leading-relaxed">
            Three interconnected systems. One unified platform.
            Built for production from the first commit.
          </p>
        </div>

        {/* Segmented control */}
        <div className="mb-12 flex justify-center">
          <SegmentedControl
            segments={SEGMENTS}
            value={active}
            onChange={setActive}
          />
        </div>

        {/* Pipeline steps */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {/* Horizontal pipeline */}
            <div className="mb-12 overflow-x-auto pb-4">
              <div className="flex items-stretch gap-0 min-w-max mx-auto" style={{ width: "fit-content" }}>
                {steps.map((step, i) => (
                  <div key={step.id} className="flex items-center">
                    <div className="relative rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 w-52">
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/40 to-transparent" />
                      <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-[var(--accent)] mb-2">
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      <div className="font-mono text-base font-bold text-[var(--text)] mb-1">
                        {step.label}
                      </div>
                      <div className="font-mono text-[10px] tracking-wider uppercase text-[var(--accent)]/70 mb-3">
                        {step.tech}
                      </div>
                      <p className="font-mono text-[11px] text-[var(--text-muted)] leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                    {i < steps.length - 1 && (
                      <div className="flex items-center px-2">
                        <div className="h-px w-6 bg-[var(--accent)]/30" />
                        <div
                          className="w-0 h-0"
                          style={{
                            borderTop: "5px solid transparent",
                            borderBottom: "5px solid transparent",
                            borderLeft: "6px solid rgba(255,77,0,0.3)",
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Tech badges */}
            <div className="flex flex-wrap gap-2 justify-center mb-12">
              {TECH_BY_SEGMENT[active].map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-1.5 font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--text-muted)]"
                >
                  {tech}
                </span>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Full stack strip */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
          <p className="font-mono text-[10px] tracking-[0.4em] uppercase text-[var(--accent)] mb-6 text-center">
            Full Stack
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              "Airflow", "Kafka", "DVC", "MLflow", "PyTorch",
              "Ray Tune", "KServe", "BentoML", "Kubernetes",
              "Prometheus", "Grafana", "Great Expectations",
              "Evidently", "SHAP", "dbt",
            ].map((t) => (
              <span
                key={t}
                className="rounded-full border border-[var(--accent)]/20 bg-[var(--accent)]/5 px-4 py-1.5 font-mono text-[10px] tracking-[0.15em] uppercase text-[var(--accent)]/80"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <a
            href="/dashboard"
            className="inline-block rounded-full border border-[var(--accent)] px-8 py-3 font-mono text-[11px] tracking-[0.2em] uppercase text-[var(--accent)] transition-all duration-200 hover:bg-[var(--accent)] hover:text-white"
          >
            See it Live → Dashboard
          </a>
        </div>
      </div>
    </main>
  );
}
