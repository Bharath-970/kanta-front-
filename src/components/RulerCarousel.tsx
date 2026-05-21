"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface CarouselItem {
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  badge?: string;
  year?: string;
  meta?: string;
  recordId?: string;
  authority?: string;
  recordStatus?: string;
}

const ITEM_WIDTH = 340;
const ITEM_GAP = 24;
const STEP = ITEM_WIDTH + ITEM_GAP;
const RULER_LINES = 80;

function RulerLines() {
  return (
    <div className="flex w-full items-end" style={{ height: 28 }}>
      {Array.from({ length: RULER_LINES }).map((_, i) => {
        const isFifth = i % 5 === 0;
        const isCenter = i === Math.floor(RULER_LINES / 2);
        return (
          <div key={i} className="flex flex-1 flex-col items-center">
            <div
              style={{
                width: 1,
                height: isCenter ? 28 : isFifth ? 16 : 8,
                background: isCenter
                  ? "var(--accent)"
                  : isFifth
                  ? "rgba(255,77,0,0.35)"
                  : "rgba(255,255,255,0.07)",
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

function CarouselCard({
  item,
  isActive,
}: {
  item: CarouselItem;
  isActive: boolean;
}) {
  return (
    <motion.div
      animate={{
        scale: isActive ? 1 : 0.88,
        opacity: isActive ? 1 : 0.35,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      style={{ width: ITEM_WIDTH, flexShrink: 0 }}
      className="relative rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 overflow-hidden"
    >
      {isActive && (
        <div className="absolute inset-0 rounded-2xl border border-[var(--accent)]/30 pointer-events-none" />
      )}
      {isActive && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent" />
      )}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,77,0,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,77,0,0.06) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {(item.recordId || item.authority) && (
        <div className="mb-5 flex items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
          <div>
            {item.recordId && (
              <p className="font-mono text-[10px] tracking-[0.32em] uppercase text-[var(--text-muted)]">
                {item.recordId}
              </p>
            )}
            {item.authority && (
              <p className="mt-1 font-mono text-[10px] tracking-[0.28em] uppercase text-[var(--accent)]/80">
                {item.authority}
              </p>
            )}
          </div>
          {item.recordStatus && (
            <span className="rounded-full border border-[var(--accent)]/25 bg-[var(--accent)]/10 px-3 py-1 font-mono text-[9px] tracking-[0.28em] uppercase text-[var(--accent)]">
              {item.recordStatus}
            </span>
          )}
        </div>
      )}

      {item.badge && (
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-3 py-1">
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[var(--accent)]">
            {item.badge}
          </span>
        </div>
      )}

      <h3 className="font-mono text-xl font-bold text-[var(--text)] leading-tight mb-3">
        {item.title}
      </h3>

      {item.subtitle && (
        <p className="font-mono text-[11px] tracking-wider uppercase text-[var(--accent)] mb-4">
          {item.subtitle}
        </p>
      )}

      {item.description && (
        <p className="font-mono text-sm text-[var(--text-muted)] leading-relaxed">
          {item.description}
        </p>
      )}

      {(item.year || item.meta) && (
        <div className="mt-6 flex items-center justify-between border-t border-[var(--border)] pt-4">
          {item.year && (
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[var(--text-muted)]">
              {item.year}
            </span>
          )}
          {item.meta && (
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[var(--text-muted)]">
              {item.meta}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default function RulerCarousel({ items }: { items: CarouselItem[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const x = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 260, damping: 20 });
  const containerRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, items.length - 1));
      setActiveIndex(clamped);
      const containerWidth = containerRef.current?.offsetWidth ?? 0;
      const offset = containerWidth / 2 - ITEM_WIDTH / 2 - clamped * STEP;
      x.set(offset);
    },
    [items.length, x]
  );

  useEffect(() => {
    goTo(0);
  }, [goTo]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goTo(activeIndex - 1);
      if (e.key === "ArrowRight") goTo(activeIndex + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeIndex, goTo]);

  return (
    <div className="w-full select-none">
      <RulerLines />

      <div ref={containerRef} className="relative overflow-hidden py-8">
        <motion.div
          style={{ x: springX }}
          className="flex"
          drag="x"
          dragConstraints={{
            left: -(items.length - 1) * STEP,
            right: (containerRef.current?.offsetWidth ?? 0) / 2 - ITEM_WIDTH / 2,
          }}
          onDragEnd={(_, info) => {
            if (info.offset.x < -60) goTo(activeIndex + 1);
            else if (info.offset.x > 60) goTo(activeIndex - 1);
            else goTo(activeIndex);
          }}
        >
          {items.map((item, i) => (
            <div
              key={item.id}
              style={{ marginRight: i < items.length - 1 ? ITEM_GAP : 0 }}
              onClick={() => goTo(i)}
              className="cursor-pointer"
            >
              <CarouselCard item={item} isActive={i === activeIndex} />
            </div>
          ))}
        </motion.div>
      </div>

      <RulerLines />

      <div className="mt-8 flex items-center justify-center gap-6">
        <button
          onClick={() => goTo(activeIndex - 1)}
          disabled={activeIndex === 0}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-muted)] transition-all hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-20 disabled:cursor-not-allowed"
          aria-label="Previous"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="flex gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="h-1 rounded-full transition-all duration-300"
              style={{
                width: i === activeIndex ? 24 : 6,
                background:
                  i === activeIndex ? "var(--accent)" : "var(--border)",
              }}
              aria-label={`Go to item ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={() => goTo(activeIndex + 1)}
          disabled={activeIndex === items.length - 1}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-muted)] transition-all hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-20 disabled:cursor-not-allowed"
          aria-label="Next"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <p className="mt-4 text-center font-mono text-[10px] tracking-[0.3em] uppercase text-[var(--text-muted)]">
        {activeIndex + 1} / {items.length} — use arrow keys or drag
      </p>
    </div>
  );
}
