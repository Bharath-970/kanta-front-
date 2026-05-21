"use client";

import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  value: string; // e.g. "3×", "60%", "100%", "24/7"
  className?: string;
  duration?: number;
}

function parseValue(raw: string): { num: number; suffix: string } | null {
  // Skip animation for values like "24/7", "10:00", etc.
  if (/[/:x]/.test(raw.slice(1))) return null;
  const match = raw.match(/^(\d+)(.*)/);
  if (!match) return null;
  return { num: parseInt(match[1]), suffix: match[2] };
}

export default function CountUp({ value, className = "", duration = 1800 }: CountUpProps) {
  const [display, setDisplay] = useState(value);
  const ref = useRef<HTMLSpanElement>(null);
  const triggered = useRef(false);

  useEffect(() => {
    const parsed = parseValue(value);
    if (!parsed) return; // "24/7" etc — show as-is

    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || triggered.current) return;
        triggered.current = true;
        obs.disconnect();

        const { num, suffix } = parsed;
        const start = performance.now();

        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          // ease out cubic
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.round(eased * num);
          setDisplay(`${current}${suffix}`);
          if (progress < 1) requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
      },
      { threshold: 0.5 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
