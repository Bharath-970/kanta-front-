"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

export default function NotFound() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf: number;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const { width: w, height: h } = canvas;
      ctx.clearRect(0, 0, w, h);

      // CRT static noise
      const imageData = ctx.createImageData(w, h);
      for (let i = 0; i < imageData.data.length; i += 4) {
        const v = Math.random() > 0.85 ? Math.floor(Math.random() * 80) : 0;
        imageData.data[i] = v;
        imageData.data[i + 1] = Math.floor(v * 0.3);
        imageData.data[i + 2] = 0;
        imageData.data[i + 3] = Math.random() > 0.9 ? 180 : 0;
      }
      ctx.putImageData(imageData, 0, 0);

      // Horizontal glitch lines
      for (let j = 0; j < 3; j++) {
        if (Math.random() > 0.7) {
          const y = Math.random() * h;
          ctx.fillStyle = `rgba(255, 77, 0, ${Math.random() * 0.08})`;
          ctx.fillRect(0, y, w, Math.random() * 4 + 1);
        }
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Static canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Content */}
      <div className="relative z-10 text-center px-6">
        <p className="font-mono text-[10px] tracking-[0.5em] uppercase text-[var(--accent)] mb-6 animate-pulse">
          ◈ Signal Lost ◈
        </p>

        <div className="font-mono text-[120px] md:text-[200px] font-bold leading-none text-[var(--text)] opacity-10 select-none mb-4">
          404
        </div>

        <h1 className="font-mono text-3xl md:text-5xl font-bold text-[var(--text)] mb-4 -mt-8 relative z-10">
          SIGNAL LOST
        </h1>

        <p className="font-mono text-sm text-[var(--text-muted)] mb-2 max-w-xs mx-auto leading-relaxed">
          The node you are looking for has gone dark.
        </p>
        <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-[var(--text-muted)] mb-12">
          ERR_NODE_OFFLINE · CODE 404
        </p>

        <Link
          href="/"
          className="inline-block rounded-full border border-[var(--accent)] px-8 py-3 font-mono text-[11px] tracking-[0.2em] uppercase text-[var(--accent)] transition-all duration-200 hover:bg-[var(--accent)] hover:text-white"
        >
          ← Return to Base
        </Link>
      </div>
    </main>
  );
}
