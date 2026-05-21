"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

export interface Segment {
  id: string;
  label: string;
}

export default function SegmentedControl({
  segments,
  value,
  onChange,
}: {
  segments: Segment[];
  value: string;
  onChange: (id: string) => void;
}) {
  const activeIndex = segments.findIndex((s) => s.id === value);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const btn = btnRefs.current[activeIndex];
    if (!btn) return;
    setPillStyle({ left: btn.offsetLeft, width: btn.offsetWidth });
  }, [activeIndex]);

  return (
    <div
      className="relative inline-flex rounded-lg border border-[var(--accent)]/30 bg-[var(--surface)] overflow-hidden p-1"
      style={{ boxShadow: "0 0 10px rgba(255,77,0,0.15), inset 0 0 10px rgba(255,77,0,0.05)" }}
    >
      {/* Active pill */}
      <motion.div
        className="absolute top-1 bottom-1 bg-[var(--accent)] rounded-md z-0"
        animate={pillStyle}
        transition={{ type: "spring", stiffness: 400, damping: 32 }}
      />

      {segments.map((seg, i) => {
        const isActive = seg.id === value;
        return (
          <button
            key={seg.id}
            ref={(el) => { btnRefs.current[i] = el; }}
            onClick={() => onChange(seg.id)}
            className="relative z-10 px-6 py-2 font-mono text-[11px] tracking-[0.2em] uppercase transition-colors duration-200 cursor-pointer rounded-md whitespace-nowrap"
            style={{ color: isActive ? "#030305" : "var(--text-muted)" }}
          >
            {seg.label}
          </button>
        );
      })}
    </div>
  );
}
