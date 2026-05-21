"use client";

import { useEffect, useState, useRef, useCallback } from "react";

const SCRIPTS = [
  { lang: "latin", line1: "KANTAKA", line2: "ŚODHANA" },
  { lang: "sanskrit", line1: "कण्टक", line2: "शोधन" },
  { lang: "telugu", line1: "కంటక", line2: "శోధన" },
  { lang: "tamil", line1: "கண்டக", line2: "சோதன" },
  { lang: "kannada", line1: "ಕಂಟಕ", line2: "ಶೋಧನ" },
  { lang: "bengali", line1: "কণ্টক", line2: "শোধন" },
];

const GLITCH_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&कखगघचछटठडणतथदधनपफबभ";

function getRandomChar() {
  return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
}

function GlitchLine({
  text,
  isGlitching,
  className,
}: {
  text: string;
  isGlitching: boolean;
  className?: string;
}) {
  const [display, setDisplay] = useState(text);
  const frameRef = useRef<number>(0);
  const iterRef = useRef(0);

  useEffect(() => {
    if (!isGlitching) {
      setDisplay(text);
      return;
    }

    iterRef.current = 0;
    const maxIters = 12;

    const scramble = () => {
      iterRef.current++;
      const progress = iterRef.current / maxIters;

      const result = text
        .split("")
        .map((char, i) => {
          if (char === " ") return " ";
          const charProgress = i / text.length;
          if (progress > charProgress + 0.3) return char;
          return getRandomChar();
        })
        .join("");

      setDisplay(result);

      if (iterRef.current < maxIters) {
        frameRef.current = requestAnimationFrame(scramble);
      } else {
        setDisplay(text);
      }
    };

    frameRef.current = requestAnimationFrame(scramble);
    return () => cancelAnimationFrame(frameRef.current);
  }, [text, isGlitching]);

  return <span className={className}>{display}</span>;
}

export default function SweepText() {
  const [scriptIndex, setScriptIndex] = useState(0);
  const [isGlitching, setIsGlitching] = useState(false);
  const [sweepHit, setSweepHit] = useState(false);
  const lastCycleRef = useRef(0);
  const startTimeRef = useRef(Date.now());

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const cycle = useCallback(() => {
    setIsGlitching(true);
    setSweepHit(true);
    setScriptIndex((prev) => (prev + 1) % SCRIPTS.length);

    timersRef.current.push(
      setTimeout(() => setIsGlitching(false), 500),
      setTimeout(() => setSweepHit(false), 800),
    );
  }, []);

  useEffect(() => {
    // Shader increments time by 0.016 per frame at 60fps
    // sweepAngle = time * 0.5, full rotation ≈ 785 frames ≈ 13.1s
    // We track simulated shader time to stay in sync
    let shaderTime = 0;
    let lastFrame = performance.now();

    const check = () => {
      const now = performance.now();
      const dt = (now - lastFrame) / 1000;
      lastFrame = now;
      shaderTime += dt;

      const sweepAngle = (shaderTime * 1.57) % (Math.PI * 2); // full rotation every ~4s

      // Trigger when sweep passes through the right side (angle ≈ 0 / TAU)
      if (sweepAngle < 0.2 && shaderTime - lastCycleRef.current > 3.5) {
        lastCycleRef.current = shaderTime;
        cycle();
      }

      requestAnimationFrame(check);
    };

    const raf = requestAnimationFrame(check);
    return () => cancelAnimationFrame(raf);
  }, [cycle]);

  const current = SCRIPTS[scriptIndex];
  const isIndic = scriptIndex > 0;

  return (
    <div className="relative overflow-x-clip">
      {/* Glow pulse on sweep hit */}
      <div
        className="absolute inset-0 -m-8 rounded-3xl transition-opacity duration-500"
        style={{
          background: "radial-gradient(ellipse at center, rgba(255,77,0,0.15) 0%, transparent 70%)",
          opacity: sweepHit ? 1 : 0,
        }}
      />

      {/* Horizontal light flare — visual bridge between shader beam and text */}
      <div
        className="absolute left-[-50%] right-[-50%] h-[2px] top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-300"
        style={{
          background: sweepHit
            ? "linear-gradient(90deg, transparent 0%, rgba(255,77,0,0.8) 30%, rgba(255,200,100,1) 50%, rgba(255,77,0,0.8) 70%, transparent 100%)"
            : "transparent",
          opacity: sweepHit ? 1 : 0,
          boxShadow: sweepHit
            ? "0 0 20px rgba(255,77,0,0.5), 0 0 60px rgba(255,77,0,0.2)"
            : "none",
        }}
      />

      <h1
        className="relative font-mono text-5xl md:text-7xl lg:text-[90px] font-bold tracking-tight leading-[0.95] text-[var(--text)] transition-all duration-300"
        style={{
          textShadow: sweepHit
            ? "0 0 40px rgba(255,77,0,0.6), 0 0 80px rgba(255,77,0,0.3)"
            : "none",
          fontFamily: isIndic ? "var(--font-devanagari), sans-serif" : undefined,
        }}
      >
        <GlitchLine
          text={current.line1}
          isGlitching={isGlitching}
          className="block"
        />
        <GlitchLine
          text={current.line2}
          isGlitching={isGlitching}
          className="block text-[var(--accent)]"
        />
      </h1>

      {/* Script label */}
      <div
        className="mt-4 font-mono text-[9px] tracking-[0.4em] uppercase transition-opacity duration-500"
        style={{
          color: sweepHit ? "var(--accent)" : "var(--text-muted)",
          opacity: sweepHit ? 1 : 0.5,
        }}
      >
        {current.lang}
      </div>
    </div>
  );
}
