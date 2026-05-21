"use client";

import { useRef, useEffect, useState, useCallback } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*[]{}<>/=+-~\"|";
const DEV_CHARS = "कखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसहॐक्षज्ञ";

const scripts = [
  { lang: "sanskrit", text: "कण्टकशोधन" },
  { lang: "telugu", text: "కంటకశోధన" },
  { lang: "tamil", text: "கண்டகசோதன" },
  { lang: "kannada", text: "ಕಂಟಕಶೋಧನ" },
  { lang: "bengali", text: "কণ্টকশোধন" },
];

const TILE = 20;
const GAP = 0;
const STEP = TILE + GAP;
const DECAY = 0.94;
const RISE = 0.28;
const INFLUENCE = 5;
const PATCH_LAG = 0.12;
const CHAR_CHANGE_ODDS = 0.005;

function randChar(): string {
  const pool = Math.random() > 0.55 ? DEV_CHARS : CHARS;
  return pool[Math.floor(Math.random() * pool.length)];
}

interface Grid {
  cols: number;
  rows: number;
  activation: Float32Array;
  chars: string[];
  noise: Float32Array;
}

function createGrid(w: number, h: number): Grid {
  const cols = Math.ceil(w / STEP) + 1;
  const rows = Math.ceil(h / STEP) + 1;
  const count = cols * rows;
  return {
    cols,
    rows,
    activation: new Float32Array(count),
    chars: Array.from({ length: count }, () => randChar()),
    noise: Float32Array.from({ length: count }, () => (Math.random() - 0.5) * 2.5),
  };
}

export default function EnterGate({
  onEnter,
  onGateGone,
}: {
  onEnter: () => void;
  onGateGone: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<Grid | null>(null);
  const mouseRef = useRef({ x: -999, y: -999, speed: 0, active: false });
  const prevMouseRef = useRef({ x: -999, y: -999 });
  const rafRef = useRef<number>(0);
  const [hoveringEnter, setHoveringEnter] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [phase, setPhase] = useState<"idle" | "fill" | "hold" | "flash" | "decay" | "emerge">("idle");
  const [scriptIndex, setScriptIndex] = useState(0);
  const [isGlitching, setIsGlitching] = useState(false);
  const phaseRef = useRef(phase);
  const transitionStartRef = useRef<number>(0);
  const startedRef = useRef(false);
  const timeoutRefs = useRef<number[]>([]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // Script rotation with CRT glitch effect
  useEffect(() => {
    const interval = setInterval(() => {
      setIsGlitching(true);
      const scriptTimer = window.setTimeout(() => setScriptIndex((i) => (i + 1) % scripts.length), 150);
      const glitchTimer = window.setTimeout(() => setIsGlitching(false), 300);
      timeoutRefs.current.push(scriptTimer, glitchTimer);
    }, 2500);
    return () => {
      clearInterval(interval);
      timeoutRefs.current.forEach((timer) => window.clearTimeout(timer));
      timeoutRefs.current = [];
    };
  }, []);

  const handleCursorMove = useCallback((e: Event) => {
    const d = (e as CustomEvent).detail;
    const c = canvasRef.current;
    if (!c || !d) return;
    const r = c.getBoundingClientRect();
    mouseRef.current = {
      x: d.x - r.left,
      y: d.y - r.top,
      speed: d.speed,
      active: true,
    };
  }, []);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      c.width = c.offsetWidth * dpr;
      c.height = c.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      gridRef.current = createGrid(c.offsetWidth, c.offsetHeight);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("kvs-cursor-move", handleCursorMove);

    const onLeave = () => { mouseRef.current.active = false; };
    window.addEventListener("mouseleave", onLeave);

    const onDirectMove = (e: MouseEvent) => {
      const r = c.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - r.left,
        y: e.clientY - r.top,
        speed: 15,
        active: true,
      };
    };
    c.addEventListener("mousemove", onDirectMove);

    const patch = { x: -999, y: -999 };

    const animate = () => {
      if (!c || !ctx) return;
      const w = c.offsetWidth;
      const h = c.offsetHeight;
      const m = mouseRef.current;
      const grid = gridRef.current;
      if (!grid) return;

      const { cols, rows, activation, chars, noise } = grid;
      const active = m.active && m.x > 0;

      // Background: white during idle/fill/flash (CRT screen), transparent during decay to reveal homepage
      const p = phaseRef.current;
      if (p === "idle" || p === "fill" || p === "flash") {
        ctx.fillStyle = "#f0f0f0";
        ctx.fillRect(0, 0, w, h);
      } else {
        ctx.clearRect(0, 0, w, h);
      }

      // Update patch position to lag behind cursor
      if (active && phaseRef.current === "idle") {
        if (patch.x < -900) { patch.x = m.x; patch.y = m.y; }
        patch.x += (m.x - patch.x) * PATCH_LAG;
        patch.y += (m.y - patch.y) * PATCH_LAG;
      }

      const patchCol = Math.floor(patch.x / STEP);
      const patchRow = Math.floor(patch.y / STEP);

      // === UPDATE ===
      if (phaseRef.current === "idle") {
        // Decay all cells
        for (let i = 0; i < activation.length; i++) {
          activation[i] *= DECAY;
        }

        if (active) {
          const dx = m.x - prevMouseRef.current.x;
          const dy = m.y - prevMouseRef.current.y;
          const localSpeed = Math.sqrt(dx * dx + dy * dy);
          prevMouseRef.current = { x: m.x, y: m.y };
          const isMoving = localSpeed > 1.5;

          if (isMoving) {
            const minCol = Math.max(0, patchCol - INFLUENCE - 1);
            const maxCol = Math.min(cols - 1, patchCol + INFLUENCE + 1);
            const minRow = Math.max(0, patchRow - INFLUENCE - 1);
            const maxRow = Math.min(rows - 1, patchRow + INFLUENCE + 1);

            for (let r = minRow; r <= maxRow; r++) {
              for (let c = minCol; c <= maxCol; c++) {
                const i = r * cols + c;
                const dCol = c - patchCol;
                const dRow = r - patchRow;
                const manhattan = Math.abs(dCol) + Math.abs(dRow);
                const threshold = INFLUENCE + noise[i];

                if (manhattan < threshold) {
                  const target = (1 - manhattan / threshold) ** 2;
                  const randomGate = Math.random() < target * 0.85 + 0.1;
                  if (randomGate) {
                    activation[i] += (target - activation[i]) * RISE;
                  }
                }

                if (activation[i] < 0) activation[i] = 0;
                if (activation[i] > 1) activation[i] = 1;
                if (Math.random() < CHAR_CHANGE_ODDS) chars[i] = randChar();
              }
            }
          }
        }
      }
      // In transition: tiles follow the fill/hold/decay sequence

      // === FILL / HOLD / FLASH / DECAY logic ===
      if (phaseRef.current === "fill") {
        const elapsed = (performance.now() - transitionStartRef.current) / 1000;
        // Per-tile delayed activation — tiles start rising at different times
        // noise[i] range is ~ -1.25 to +1.25, normalize to 0..1 for delay offset
        for (let i = 0; i < activation.length; i++) {
          const tileDelay = (noise[i] + 1.25) / 2.5; // 0..1
          const startTime = tileDelay * 1.6; // tile starts rising between 0s and 1.6s
          if (elapsed >= startTime) {
            const rise = 0.025 + Math.random() * 0.015; // slow lerp once started
            activation[i] += (1 - activation[i]) * rise;
            if (activation[i] > 1) activation[i] = 1;
          }
          if (Math.random() < 0.12) chars[i] = randChar();
        }
      }
      if (phaseRef.current === "hold") {
        // Continue slow scramble during hold
        for (let i = 0; i < activation.length; i++) {
          if (Math.random() < 0.03) chars[i] = randChar();
        }
      }
      if (phaseRef.current === "flash") {
        // Keep tiles at full while color cycles, light scramble
        for (let i = 0; i < activation.length; i++) {
          activation[i] = 1;
          if (Math.random() < 0.04) chars[i] = randChar();
        }
      }
      if (phaseRef.current === "decay") {
        // Gentle scramble during decay (tiles still visible)
        for (let i = 0; i < activation.length; i++) {
          if (activation[i] > 0.15 && Math.random() < 0.015) chars[i] = randChar();
        }
      }
      // In "hold": activation stays at 1 (no decay)
      // In "decay": natural decay loop runs below

      // === UPDATE decay during "decay" phase ===
      // Per-tile staggered decay rates — creates organic, non-uniform dispersal
      if (phaseRef.current === "decay") {
        for (let i = 0; i < activation.length; i++) {
          // Use noise[i] to give each tile a slightly different fade speed
          // Rates between 0.975 and 0.995 — much slower than idle DECAY
          const tileDecay = 0.975 + (noise[i] + 2.5) / 5 * 0.02;
          activation[i] *= tileDecay;
        }
      }

      // === DRAW ===
      // Color cycle during flash: orange → white → orange at peak brightness
      let shiftR = 255, shiftG = 77, shiftB = 0;

      if (phaseRef.current === "flash") {
        const elapsed = (performance.now() - transitionStartRef.current) / 1000;
        const flashElapsed = Math.max(0, elapsed - 2.4); // flash starts at 2.4s
        const cycleDuration = 0.4; // snappier orange→white→orange
        const progress = Math.min(1, flashElapsed / cycleDuration);
        const t = Math.sin(progress * Math.PI); // 0 → 1 → 0

        shiftR = 255;
        shiftG = 77 + (255 - 77) * t;
        shiftB = 0 + (255 - 0) * t;
      }

      // Lower threshold during transition for smoother tail fade
      const drawThreshold = phaseRef.current === "idle" ? 0.08 : 0.01;
      for (let i = 0; i < activation.length; i++) {
        const a = activation[i];
        if (a < drawThreshold) continue;

        const cCol = i % cols;
        const cRow = Math.floor(i / cols);
        const px = cCol * STEP;
        const py = cRow * STEP;
        const sSize = TILE;

        ctx.fillStyle = `rgba(${shiftR}, ${shiftG + 23}, ${shiftB + 20}, ${a * 0.25})`;
        ctx.fillRect(px - 2, py - 2, sSize + 4, sSize + 4);

        // During transition, tile body fades with activation; idle stays crisp
        const bodyAlpha = phaseRef.current === "idle" ? 1 : a;
        ctx.fillStyle = `rgba(${shiftR}, ${shiftG}, ${shiftB}, ${bodyAlpha})`;
        ctx.fillRect(px, py, sSize, sSize);

        const charAlpha = Math.min(1, a * 1.2);
        if (charAlpha > 0.02) {
          const charSize = Math.max(8, sSize * 0.85);
          ctx.font = `900 ${charSize}px "Geist Mono", "Noto Sans Devanagari", monospace`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          ctx.shadowColor = "rgba(0,0,0,0.7)";
          ctx.shadowBlur = 3;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 1;

          ctx.fillStyle = "#ffffff";
          ctx.fillText(chars[i], px + sSize / 2, py + sSize / 2 + 1);

          ctx.shadowColor = "transparent";
          ctx.shadowBlur = 0;
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("kvs-cursor-move", handleCursorMove);
      window.removeEventListener("mouseleave", onLeave);
      c.removeEventListener("mousemove", onDirectMove);
    };
  }, [handleCursorMove]);

  const handleClick = () => {
    if (startedRef.current) return;
    startedRef.current = true;

    // Gradual Dissolve Sequence:
    // 0.0s:  fill — tiles appear at scattered start times, rise slowly
    // 2.4s:  flash — snappy orange → white → orange cycle (0.4s)
    // 2.8s:  decay — organic tile dispersal + wrapper bg fade begins
    // 5.5s:  wrapper opacity fade begins (overlaps with late tile decay)
    // 7.5s:  EnterGate unmounts
    transitionStartRef.current = performance.now();
    setPhase("fill");

    timeoutRefs.current.push(
      window.setTimeout(() => setPhase("flash"), 2400),
      window.setTimeout(() => {
        setPhase("decay");
        onEnter();
      }, 2800),
      window.setTimeout(() => setClicked(true), 4500),
      window.setTimeout(() => onGateGone(), 7500),
    );
  };

  const isFlash = phase === "flash";
  const isDecay = phase === "decay";
  const isEmerge = phase === "emerge";
  const isTransition = phase !== "idle";
  // Hide CRT UI only after the flash — keep entry gate visible during fill
  const hideUI = isFlash || isDecay || isEmerge;

  return (
    <>
      <style>{`
        @keyframes flicker {
          0%, 100% { opacity: 0; }
          50% { opacity: 0.4; }
        }
      `}</style>
      <div
        className="fixed inset-0 z-[500] flex items-center justify-center"
        style={{
          background: isDecay ? "transparent" : "#030305",
          opacity: clicked ? 0 : 1,
          pointerEvents: clicked ? "none" : "auto",
          transition: "background 2.5s ease-out, opacity 2.5s ease-out",
        }}
      >
      {/* CRT Monitor Shell — fullscreen */}
      <div className="relative w-screen h-screen">
        {/* Shell frame */}
        <div
          className="absolute inset-0"
          style={{
            background: hideUI ? "transparent" : "#08080c",
            transition: "background 0.6s ease-out",
          }}
        />
        {/* Screen container */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            background: isDecay || isEmerge ? "transparent" : "#f0f0f0",
            boxShadow: isDecay || isEmerge ? "none" : "inset 0 0 60px rgba(0,0,0,0.8)",
            transition: "background 0.4s ease-out, box-shadow 0.4s ease-out",
          }}
        >
          {/* Canvas wrapper — tiles fade naturally via activation decay */}
          <div className="absolute inset-0 overflow-hidden">
            <canvas
              ref={canvasRef}
              className="absolute w-full h-full"
              style={{ left: 0, top: 0 }}
            />

            {/* Scanlines */}
            <div
              className="absolute inset-0 pointer-events-none z-30"
              style={{
                background: "linear-gradient(180deg, transparent 50%, rgba(255,77,0,0.025) 50%)",
                backgroundSize: "100% 6px",
                animation: "scanline 6s linear infinite",
                opacity: hideUI ? 0 : 1,
                transition: "opacity 0.3s",
              }}
            />

            {/* Vignette */}
            <div
              className="absolute inset-0 pointer-events-none z-30"
              style={{
                background: "radial-gradient(ellipse at 50% 45%, transparent 45%, rgba(0,0,0,0.85) 100%)",
                opacity: hideUI ? 0 : 1,
                transition: "opacity 0.3s",
              }}
            />

            {/* Curvature shadow */}
            <div
              className="absolute inset-0 pointer-events-none z-30"
              style={{
                boxShadow: "inset 0 0 120px rgba(0,0,0,0.7), inset 0 30px 60px rgba(0,0,0,0.4), inset 0 -30px 60px rgba(0,0,0,0.4)",
                opacity: hideUI ? 0 : 1,
                transition: "opacity 0.3s",
              }}
            />
          </div>

          {/* No white overlay - phosphor decay is pure canvas rendering */}

          {/* Center content - fades immediately on click */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center z-40 pointer-events-none"
            style={{
              opacity: isTransition ? 0 : 1,
              transition: "opacity 0.4s ease-out",
            }}
          >
            <div className="text-center">
              <div className="font-mono text-[9px] tracking-[0.5em] text-[#E84500] mb-6 font-semibold">
                AI & MLOPS PLATFORM
              </div>

              <h1
                className="font-mono text-5xl md:text-7xl lg:text-[90px] font-bold tracking-tight leading-[0.95]"
                style={{
                  color: "#111111",
                  textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                }}
              >
                KANTAKA
              </h1>
              <h1
                className="font-mono text-5xl md:text-7xl lg:text-[90px] font-bold tracking-tight leading-[0.95] mt-1"
                style={{
                  color: "#111111",
                  textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                }}
              >
                ŚODHANA
              </h1>

              {/* Rotating script with CRT glitch effect */}
              <div className="mt-5 relative h-12 md:h-16 flex items-center justify-center">
                {/* Scanline mask overlay */}
                <div 
                  className="absolute inset-0 pointer-events-none z-10"
                  style={{
                    background: "linear-gradient(180deg, transparent 30%, rgba(255,77,0,0.1) 30%, rgba(255,77,0,0.1) 35%, transparent 35%, transparent 60%, rgba(255,77,0,0.08) 60%, rgba(255,77,0,0.08) 65%, transparent 65%)",
                    backgroundSize: "100% 8px",
                    opacity: isGlitching ? 0.6 : 0.2,
                    transition: "opacity 0.15s",
                  }}
                />
                
                <div
                  className={`text-3xl md:text-4xl font-bold transition-all duration-150 ${
                    isGlitching ? "scale-105 blur-[1px]" : "scale-100 blur-0"
                  }`}
                  style={{
                    fontFamily: "var(--font-devanagari), sans-serif",
                    color: "#CC4400",
                    textShadow: isGlitching 
                      ? "2px 0 #ff0000, -2px 0 #00ffff, 0 0 20px rgba(255,77,0,0.5)"
                      : "0 0 30px rgba(255,77,0,0.3)",
                    opacity: isGlitching ? 0.7 : 0.9,
                    transform: isGlitching ? "translateX(2px)" : "translateX(0)",
                  }}
                >
                  {scripts[scriptIndex].text}
                </div>
                
                {/* Flicker overlay during glitch */}
                {isGlitching && (
                  <div 
                    className="absolute inset-0 bg-[#f0f0f0] pointer-events-none mix-blend-screen"
                    style={{
                      animation: "flicker 0.05s steps(2) 3",
                      opacity: 0.3,
                    }}
                  />
                )}
              </div>

              <div className="mt-8 flex items-center justify-center gap-4">
                <div className="w-12 h-[1px] bg-[#FF4D00]/25" />
                <span className="font-mono text-[8px] tracking-[0.35em] text-[#E84500] font-semibold">
                  REMOVING THE THORNS OF DECEPTION
                </span>
                <div className="w-12 h-[1px] bg-[#FF4D00]/25" />
              </div>

              <button
                onClick={handleClick}
                onMouseEnter={() => setHoveringEnter(true)}
                onMouseLeave={() => setHoveringEnter(false)}
                className="pointer-events-auto mt-10 px-10 py-3 font-mono text-[11px] tracking-[0.2em] uppercase font-bold transition-all duration-200"
                style={{
                  background: hoveringEnter ? "#FF4D00" : "rgba(255,77,0,0.85)",
                  color: "#030305",
                  border: "none",
                  boxShadow: hoveringEnter
                    ? "0 0 40px rgba(255,77,0,0.5), 0 0 80px rgba(255,77,0,0.2)"
                    : "0 0 20px rgba(255,77,0,0.3)",
                }}
              >
                {hoveringEnter ? "> CLICK TO ENTER <" : "CLICK TO ENTER"}
              </button>

              <p className="mt-4 font-mono text-[8px] tracking-[0.2em] text-white/15">
                {`{IMMERSIVE EXPERIENCE RECOMMENDED}`}
              </p>
            </div>
          </div>

          {/* UI overlay - brackets + status bar fade with content */}
          <div
            className="absolute inset-0 z-40 pointer-events-none"
            style={{
              opacity: hideUI ? 0 : 1,
              transition: "opacity 0.6s ease-out",
            }}
          >
            <div className="absolute top-5 left-5 w-5 h-5 border-t border-l border-[#FF4D00]/25" />
            <div className="absolute top-5 right-5 w-5 h-5 border-t border-r border-[#FF4D00]/25" />
            <div className="absolute bottom-5 left-5 w-5 h-5 border-b border-l border-[#FF4D00]/25" />
            <div className="absolute bottom-5 right-5 w-5 h-5 border-b border-r border-[#FF4D00]/25" />

            <div className="absolute bottom-5 left-0 right-0 flex items-center justify-between px-8">
              <span className="font-mono text-[7px] tracking-[0.15em] text-white/10">
                SYS.VER.2.0.6
              </span>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-[#FF4D00] animate-pulse" />
                <span className="font-mono text-[7px] tracking-[0.15em] text-[#FF4D00]/30">
                  LIVE
                </span>
              </div>
              <span className="font-mono text-[7px] tracking-[0.15em] text-white/10">
                2026.KS.AI
              </span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
