"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ProcessStepData } from "@/lib/homepage";

// ─── Mini canvas animations ───────────────────────────────────────────────────

function useCanvas(draw: (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => void) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef<number>(0);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio, 2);
    c.width = c.offsetWidth * dpr;
    c.height = c.offsetHeight * dpr;
    ctx.scale(dpr, dpr);
    const w = c.offsetWidth, h = c.offsetHeight;
    const start = performance.now();
    let active = true;
    const loop = () => {
      if (!active) return;
      ctx.clearRect(0, 0, w, h);
      draw(ctx, (performance.now() - start) / 1000, w, h);
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);

    const obs = new IntersectionObserver(
      ([entry]) => {
        active = entry.isIntersecting;
        if (active) raf.current = requestAnimationFrame(loop);
      },
      { threshold: 0 }
    );
    obs.observe(c);

    return () => {
      active = false;
      cancelAnimationFrame(raf.current);
      obs.disconnect();
    };
  }, [draw]);
  return ref;
}

function IngestViz() {
  const draw = (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const streams = 6;
    for (let s = 0; s < streams; s++) {
      const y = (h / (streams + 1)) * (s + 1);
      const speed = 0.4 + s * 0.08;
      const offset = (t * speed * w) % w;
      const particles = 8;
      for (let p = 0; p < particles; p++) {
        const x = ((offset + (w / particles) * p) % w);
        const alpha = 0.15 + 0.6 * Math.abs(Math.sin(t * 1.5 + s + p));
        const size = 2 + s * 0.4;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,77,0,${alpha})`;
        ctx.fill();
        // trail
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(Math.max(0, x - 20), y);
        ctx.strokeStyle = `rgba(255,77,0,${alpha * 0.3})`;
        ctx.lineWidth = size * 0.6;
        ctx.stroke();
      }
    }
    // vertical grid lines
    for (let i = 0; i < 8; i++) {
      const x = (w / 8) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.strokeStyle = "rgba(255,77,0,0.04)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  };
  const ref = useCanvas(draw);
  return <canvas ref={ref} className="w-full h-full" />;
}

function DetectViz() {
  const draw = (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const cx = w / 2, cy = h / 2;
    // sonar rings
    for (let i = 0; i < 4; i++) {
      const phase = (t * 0.8 + i * 0.6) % 3;
      const r = phase * (Math.min(w, h) * 0.45);
      const alpha = Math.max(0, 1 - phase / 3) * 0.5;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,77,0,${alpha})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    // center pulse
    const pulse = 0.5 + 0.5 * Math.sin(t * 3);
    ctx.beginPath();
    ctx.arc(cx, cy, 4 + pulse * 3, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,77,0,${0.6 + pulse * 0.4})`;
    ctx.fill();
    // anomaly dots
    const blips = [
      { angle: 0.8, dist: 0.55 },
      { angle: 2.3, dist: 0.38 },
      { angle: 4.1, dist: 0.62 },
    ];
    blips.forEach(({ angle, dist }) => {
      const bx = cx + Math.cos(angle) * (Math.min(w, h) * 0.45 * dist);
      const by = cy + Math.sin(angle) * (Math.min(w, h) * 0.45 * dist);
      const bpulse = 0.5 + 0.5 * Math.sin(t * 2 + angle);
      ctx.beginPath();
      ctx.arc(bx, by, 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,200,100,${0.4 + bpulse * 0.6})`;
      ctx.fill();
    });
  };
  const ref = useCanvas(draw);
  return <canvas ref={ref} className="w-full h-full" />;
}

function TraceViz() {
  const NODES = [
    { x: 0.12, y: 0.5 },
    { x: 0.35, y: 0.25 },
    { x: 0.35, y: 0.75 },
    { x: 0.6, y: 0.5 },
    { x: 0.85, y: 0.3 },
    { x: 0.85, y: 0.7 },
  ];
  const EDGES = [[0,1],[0,2],[1,3],[2,3],[3,4],[3,5]];
  const draw = (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const active = Math.floor(t * 0.8) % NODES.length;
    EDGES.forEach(([a, b]) => {
      const ax = NODES[a].x * w, ay = NODES[a].y * h;
      const bx = NODES[b].x * w, by = NODES[b].y * h;
      const progress = (t * 0.9 % 1);
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.strokeStyle = "rgba(255,77,0,0.12)";
      ctx.lineWidth = 1;
      ctx.stroke();
      // animated packet
      const px = ax + (bx - ax) * progress;
      const py = ay + (by - ay) * progress;
      ctx.beginPath();
      ctx.arc(px, py, 2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,77,0,0.7)";
      ctx.fill();
    });
    NODES.forEach((n, i) => {
      const x = n.x * w, y = n.y * h;
      const isActive = i === active;
      ctx.beginPath();
      ctx.arc(x, y, isActive ? 6 : 4, 0, Math.PI * 2);
      ctx.fillStyle = isActive ? "rgba(255,77,0,0.9)" : "rgba(255,77,0,0.25)";
      ctx.fill();
      if (isActive) {
        ctx.beginPath();
        ctx.arc(x, y, 10 + 3 * Math.sin(t * 4), 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255,77,0,0.3)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });
  };
  const ref = useCanvas(draw);
  return <canvas ref={ref} className="w-full h-full" />;
}

function GovernViz() {
  const draw = (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => {
    const baseline = h * 0.5;
    // drift line
    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    ctx.moveTo(0, baseline);
    ctx.lineTo(w, baseline);
    ctx.strokeStyle = "rgba(255,77,0,0.15)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.setLineDash([]);
    // health signal
    const points = 80;
    ctx.beginPath();
    for (let i = 0; i < points; i++) {
      const x = (w / points) * i;
      const drift = i > points * 0.55 ? (i - points * 0.55) * 0.8 : 0;
      const y = baseline - drift - Math.sin(i * 0.3 + t * 2) * 12 - Math.sin(i * 0.7 + t) * 5;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "rgba(255,77,0,0.7)";
    ctx.lineWidth = 2;
    ctx.stroke();
    // threshold line
    const threshold = baseline - 28;
    ctx.beginPath();
    ctx.setLineDash([6, 3]);
    ctx.moveTo(0, threshold);
    ctx.lineTo(w, threshold);
    ctx.strokeStyle = "rgba(255,200,100,0.4)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.setLineDash([]);
    // rollback marker
    const rx = w * 0.72;
    ctx.beginPath();
    ctx.moveTo(rx, 0);
    ctx.lineTo(rx, h);
    ctx.strokeStyle = "rgba(255,77,0,0.2)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.font = "bold 9px monospace";
    ctx.fillStyle = "rgba(255,77,0,0.5)";
    ctx.fillText("ROLLBACK", rx + 4, 14);
  };
  const ref = useCanvas(draw);
  return <canvas ref={ref} className="w-full h-full" />;
}

// ─── Steps data ───────────────────────────────────────────────────────────────

type ProcessStep = ProcessStepData & {
  Viz: () => React.JSX.Element;
};

const STEP_VIZ_BY_ID: Record<string, () => React.JSX.Element> = {
  ingest: IngestViz,
  detect: DetectViz,
  trace: TraceViz,
  govern: GovernViz,
};

function withViz(steps: ProcessStepData[]): ProcessStep[] {
  return steps.map((step) => ({
    ...step,
    Viz: STEP_VIZ_BY_ID[step.id] ?? IngestViz,
  }));
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProcessShowcase({
  steps,
}: {
  steps: ProcessStepData[];
}) {
  const [active, setActive] = useState(0);
  const processSteps = withViz(steps);
  const step = processSteps[active];

  return (
    <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-0 rounded-2xl border border-[var(--border)] overflow-hidden">
      {/* Left rail */}
      <div className="flex md:flex-col border-b md:border-b-0 md:border-r border-[var(--border)]">
        {processSteps.map((s, i) => {
          const isActive = i === active;
          return (
            <button
              key={s.id}
              onClick={() => setActive(i)}
              aria-label={s.label}
              className="relative flex-1 md:flex-none text-left px-6 py-6 md:py-8 group transition-colors duration-200 cursor-pointer"
              style={{
                background: isActive ? "rgba(255,77,0,0.06)" : "var(--surface)",
                borderBottom: i < processSteps.length - 1 ? "1px solid var(--border)" : "none",
                opacity: isActive ? 1 : 0.72,
              }}
            >
              {/* Active indicator bar */}
              {isActive && (
                <motion.div
                  layoutId="activeBar"
                  className="absolute left-0 top-0 bottom-0 w-[3px] bg-[var(--accent)]"
                  style={{ top: 0, bottom: 0 }}
                />
              )}
              <div
                className="font-mono text-[10px] tracking-[0.4em] uppercase mb-1 transition-colors duration-200"
                style={{ color: isActive ? "var(--accent)" : "var(--text-muted)" }}
              >
                {s.num}
              </div>
              <div
                className="font-mono text-base font-bold transition-colors duration-200"
                style={{ color: isActive ? "var(--text)" : "var(--text-muted)" }}
              >
                {s.label}
              </div>
              <div
                className="font-mono text-[10px] mt-0.5 hidden md:block transition-colors duration-200"
                style={{ color: isActive ? "var(--text-muted)" : "transparent" }}
              >
                {s.tagline}
              </div>
            </button>
          );
        })}
      </div>

      {/* Right panel */}
      <div className="relative bg-[var(--surface)] min-h-[420px] flex flex-col">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 border-b border-[var(--border)] bg-[var(--surface)]/80 px-6 py-3">
          <div>
            <p className="font-mono text-[9px] tracking-[0.35em] uppercase text-[var(--text-muted)]">
              {step.stateLabel}
            </p>
            <p className="mt-1 font-mono text-[12px] tracking-[0.22em] uppercase text-[var(--text)]">
              {step.stateValue}
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[9px] tracking-[0.35em] uppercase text-[var(--text-muted)]">
              Trace Condition
            </p>
            <p className="mt-1 font-mono text-[12px] tracking-[0.22em] uppercase text-[var(--accent)]/80">
              Nominal
            </p>
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col h-full"
          >
            {/* Canvas viz */}
            <div className="relative h-48 md:h-56 border-b border-[var(--border)] overflow-hidden">
              {/* Grid overlay */}
              <div
                className="absolute inset-0 pointer-events-none z-10"
                style={{
                  backgroundImage: "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                  opacity: 0.3,
                }}
              />
              <div className="absolute inset-0">
                <step.Viz />
              </div>
              {/* Step label overlay */}
              <div className="absolute top-4 left-4 z-20">
                <span className="font-mono text-[9px] tracking-[0.4em] uppercase text-[var(--accent)]/60">
                  {step.num} / {step.label}
                </span>
              </div>
              <div className="absolute top-4 right-4 z-20 rounded-full border border-[var(--accent)]/20 bg-[var(--bg)]/60 px-3 py-1">
                <span className="font-mono text-[9px] tracking-[0.32em] uppercase text-[var(--accent)]/70">
                  {step.statusLine}
                </span>
              </div>
              {/* Giant num */}
              <div className="absolute -bottom-4 right-4 z-20 font-mono text-[100px] font-bold leading-none text-[var(--text)]/[0.04] pointer-events-none select-none">
                {step.num}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 md:p-8 flex flex-col justify-between gap-6">
              <div>
                <h3 className="font-mono text-2xl md:text-3xl font-bold text-[var(--text)] mb-1">
                  {step.label}
                </h3>
                <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-[var(--accent)] mb-4">
                  {step.tagline}
                </p>
                <p className="font-mono text-sm text-[var(--text-muted)] leading-relaxed max-w-lg">
                  {step.body}
                </p>
              </div>
              {/* Tags */}
              <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                <div>
                  <p className="mb-2 font-mono text-[9px] tracking-[0.35em] uppercase text-[var(--text-muted)]">
                    Operational Status
                  </p>
                  <p className="font-mono text-[11px] tracking-[0.24em] uppercase text-[var(--accent)]">
                    {step.statusLine}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 md:justify-end">
                  {step.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-[var(--accent)]/30 px-3 py-1 font-mono text-[10px] tracking-[0.15em] uppercase text-[var(--accent)]/70"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
