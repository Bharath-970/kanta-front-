"use client";

import { useEffect, useState } from "react";

function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const w = 80;
  const h = 28;
  const pts = values
    .map(
      (v, i) =>
        `${(i / (values.length - 1)) * w},${h - ((v - min) / range) * h}`
    )
    .join(" ");
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline
        points={pts}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.8}
      />
    </svg>
  );
}

function MetricCard({
  label,
  value,
  unit,
  delta,
  spark,
  status,
}: {
  label: string;
  value: string;
  unit?: string;
  delta?: string;
  spark?: number[];
  status?: "ok" | "warn" | "alert";
}) {
  const statusColor =
    status === "alert"
      ? "#ef4444"
      : status === "warn"
      ? "#f59e0b"
      : "var(--accent)";

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 relative overflow-hidden">
      <div
        className="absolute top-0 left-0 w-1 h-full rounded-l-xl"
        style={{ background: statusColor }}
      />
      <div className="pl-3">
        <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-[var(--text-muted)] mb-2">
          {label}
        </div>
        <div className="flex items-end justify-between gap-3">
          <div>
            <span className="font-mono text-2xl font-bold text-[var(--text)]">
              {value}
            </span>
            {unit && (
              <span className="font-mono text-xs text-[var(--text-muted)] ml-1">
                {unit}
              </span>
            )}
            {delta && (
              <div
                className="font-mono text-[10px] mt-1"
                style={{ color: statusColor }}
              >
                {delta}
              </div>
            )}
          </div>
          {spark && <Sparkline values={spark} />}
        </div>
      </div>
    </div>
  );
}

function AlertRow({
  time,
  id,
  type,
  score,
  status,
}: {
  time: string;
  id: string;
  type: string;
  score: number;
  status: "flagged" | "cleared" | "investigating";
}) {
  const statusStyles = {
    flagged: "bg-red-500/10 text-red-400 border-red-500/20",
    cleared: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    investigating: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  };

  return (
    <div className="flex items-center gap-4 py-3 border-b border-[var(--border)] last:border-0 font-mono text-xs">
      <span className="text-[var(--text-muted)] w-16 shrink-0">{time}</span>
      <span className="text-[var(--accent)] w-28 shrink-0 tracking-wider">{id}</span>
      <span className="text-[var(--text)] flex-1">{type}</span>
      <span className="text-[var(--text-muted)] w-12 shrink-0 text-right">
        {score.toFixed(2)}
      </span>
      <span
        className={`rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-widest shrink-0 ${statusStyles[status]}`}
      >
        {status}
      </span>
    </div>
  );
}

const RAND_SPARK = () =>
  Array.from({ length: 12 }, () => Math.random() * 100);

export default function DashboardPage() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <main className="min-h-screen pt-24 pb-16 px-6">
      <div className="mx-auto max-w-6xl">

        {/* Header bar */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] tracking-[0.4em] uppercase text-[var(--accent)] mb-1">
              Live Preview
            </p>
            <h1 className="font-mono text-2xl font-bold text-[var(--text)]">
              Fraud Detection Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2">
            <span
              className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"
            />
            <span className="font-mono text-[10px] tracking-widest uppercase text-[var(--text-muted)]">
              Live · BIOMETRIC SWEEP v2.1
            </span>
          </div>
        </div>

        {/* Metrics row */}
        <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            label="Events / sec"
            value="4,821"
            delta="↑ 12% vs last hour"
            spark={RAND_SPARK()}
            status="ok"
          />
          <MetricCard
            label="Fraud Rate"
            value="0.73"
            unit="%"
            delta="↓ 0.04 from baseline"
            spark={RAND_SPARK()}
            status="ok"
          />
          <MetricCard
            label="Model Latency"
            value="38"
            unit="ms p99"
            delta="↑ 3ms spike detected"
            spark={RAND_SPARK()}
            status="warn"
          />
          <MetricCard
            label="Drift Score"
            value="0.12"
            delta="Within threshold (0.20)"
            spark={RAND_SPARK()}
            status="ok"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <MetricCard
            label="Active Models"
            value="3"
            unit="in production"
            status="ok"
          />
          <MetricCard
            label="Alerts (24h)"
            value="127"
            delta="↓ 18% vs yesterday"
            status="ok"
          />
          <MetricCard
            label="Pipeline Health"
            value="99.97"
            unit="%"
            delta="All DAGs nominal"
            status="ok"
          />
        </div>

        {/* Alert feed */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden mb-6">
          <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)]">
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[var(--accent)]">
              Live Alert Feed
            </span>
            <span className="font-mono text-[10px] text-[var(--text-muted)]">
              Auto-refreshing · tick {tick}
            </span>
          </div>
          <div className="px-5">
            <AlertRow time="00:03" id="EVT-9F3A" type="Duplicate claim — radiology batch" score={0.94} status="flagged" />
            <AlertRow time="00:07" id="EVT-2C1B" type="Document timestamp anomaly" score={0.81} status="investigating" />
            <AlertRow time="00:12" id="EVT-7E88" type="Provider mismatch — identity" score={0.67} status="cleared" />
            <AlertRow time="00:18" id="EVT-4D02" type="Velocity breach — 6 claims / 2min" score={0.97} status="flagged" />
            <AlertRow time="00:24" id="EVT-AA19" type="Geo-anomaly — cross-state billing" score={0.72} status="investigating" />
          </div>
        </div>

        {/* Model registry strip */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-[var(--accent)] mb-4">
            Model Registry
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: "fraud-xgb-v3.2", stage: "Production", acc: "97.4%", drift: "0.08" },
              { name: "doc-verify-v1.1", stage: "Shadow", acc: "94.1%", drift: "0.11" },
              { name: "graph-gnn-v0.9", stage: "Staging", acc: "96.8%", drift: "0.06" },
            ].map((m) => (
              <div
                key={m.name}
                className="rounded-lg border border-[var(--border)] p-4"
              >
                <div className="font-mono text-xs font-bold text-[var(--text)] mb-1 truncate">
                  {m.name}
                </div>
                <div
                  className={`inline-block rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest border mb-3 ${
                    m.stage === "Production"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : m.stage === "Shadow"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      : "bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20"
                  }`}
                >
                  {m.stage}
                </div>
                <div className="flex justify-between font-mono text-[10px] text-[var(--text-muted)]">
                  <span>Acc: {m.acc}</span>
                  <span>Drift: {m.drift}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="font-mono text-[10px] tracking-[0.4em] uppercase text-[var(--text-muted)]">
            Kantaka Śodhana · Biometric Sweep v2.1 · Demo View
          </p>
        </div>
      </div>
    </main>
  );
}
