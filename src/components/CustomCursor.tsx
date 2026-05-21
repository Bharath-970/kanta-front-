"use client";

import { useRef, useEffect, useState } from "react";

type CursorState = {
  x: number;
  y: number;
  px: number;
  py: number;
  vx: number;
  vy: number;
  speed: number;
};

export default function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const scanRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  const mouse = useRef<CursorState>({
    x: -100,
    y: -100,
    px: -100,
    py: -100,
    vx: 0,
    vy: 0,
    speed: 0,
  });

  const visual = useRef({ x: -100, y: -100 });
  const [isDesktop, setIsDesktop] = useState(false);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const check = () => {
      setIsDesktop(
        window.innerWidth >= 1024 &&
          !window.matchMedia("(pointer: coarse)").matches
      );
    };

    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;

    const root = document.documentElement;

    const publishCursorState = () => {
      root.style.setProperty("--kvs-cursor-x", `${mouse.current.x}px`);
      root.style.setProperty("--kvs-cursor-y", `${mouse.current.y}px`);
      root.style.setProperty("--kvs-cursor-vx", `${mouse.current.vx}`);
      root.style.setProperty("--kvs-cursor-vy", `${mouse.current.vy}`);
      root.style.setProperty("--kvs-cursor-speed", `${mouse.current.speed}`);

      window.dispatchEvent(
        new CustomEvent("kvs-cursor-move", {
          detail: { ...mouse.current },
        })
      );
    };

    const onMove = (e: MouseEvent) => {
      const px = mouse.current.x;
      const py = mouse.current.y;
      const vx = e.clientX - px;
      const vy = e.clientY - py;
      const speed = Math.min(Math.sqrt(vx * vx + vy * vy), 80);

      mouse.current = {
        x: e.clientX,
        y: e.clientY,
        px,
        py,
        vx,
        vy,
        speed,
      };

      publishCursorState();
    };

    const onEnterInteractive = () => setHovering(true);
    const onLeaveInteractive = () => setHovering(false);

    window.addEventListener("mousemove", onMove, { passive: true });

    const bindInteractiveElements = () => {
      const interactives = document.querySelectorAll(
        "a, button, [role='button'], input, textarea, select, .cursor-hover"
      );

      interactives.forEach((el) => {
        el.removeEventListener("mouseenter", onEnterInteractive);
        el.removeEventListener("mouseleave", onLeaveInteractive);
        el.addEventListener("mouseenter", onEnterInteractive);
        el.addEventListener("mouseleave", onLeaveInteractive);
      });
    };

    bindInteractiveElements();

    const observer = new MutationObserver(bindInteractiveElements);
    observer.observe(document.body, { childList: true, subtree: true });

    const animate = () => {
      visual.current.x += (mouse.current.x - visual.current.x) * 0.16;
      visual.current.y += (mouse.current.y - visual.current.y) * 0.16;

      const lagX = mouse.current.x - visual.current.x;
      const lagY = mouse.current.y - visual.current.y;
      const tiltX = (lagY / 22) * -1;
      const tiltY = lagX / 22;
      const speedScale = 1 + mouse.current.speed / 180;

      if (coreRef.current) {
        coreRef.current.style.transform = `translate(${mouse.current.x - 3}px, ${mouse.current.y - 3}px)`;
      }

      if (ringRef.current) {
        const scale = hovering ? 2.1 : 1.05 + mouse.current.speed / 260;
        ringRef.current.style.transform = `translate(${visual.current.x - 16}px, ${visual.current.y - 16}px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${scale})`;
        ringRef.current.style.opacity = hovering ? "0.45" : "0.72";
      }

      if (scanRef.current) {
        scanRef.current.style.transform = `translate(${visual.current.x - 52}px, ${visual.current.y - 52}px) scale(${speedScale})`;
        scanRef.current.style.opacity = hovering ? "0.28" : "0.18";
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
    };
  }, [isDesktop, hovering]);

  if (!isDesktop) return null;

  return (
    <>
      {/* Soft scanning influence. The orange tile field should use --kvs-cursor-* or the kvs-cursor-move event, not this visual element, for its actual activation logic. */}
      <div
        ref={scanRef}
        className="fixed top-0 left-0 h-[104px] w-[104px] rounded-full pointer-events-none z-[9996]"
        style={{
          willChange: "transform, opacity",
          background:
            "radial-gradient(circle, rgba(255,77,0,0.22) 0%, rgba(255,77,0,0.08) 34%, transparent 72%)",
          filter: "blur(14px)",
          mixBlendMode: "screen",
        }}
      />

      {/* Main ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 h-8 w-8 rounded-full border border-[#FF4D00] pointer-events-none z-[9999] transition-[opacity] duration-300"
        style={{
          willChange: "transform, opacity",
          boxShadow:
            "0 0 18px rgba(255,77,0,0.34), inset 0 0 10px rgba(255,77,0,0.13)",
        }}
      />

      {/* Core dot */}
      <div
        ref={coreRef}
        className="fixed top-0 left-0 h-1.5 w-1.5 rounded-full bg-[#FF8C00] pointer-events-none z-[9999]"
        style={{
          willChange: "transform",
          boxShadow: "0 0 10px rgba(255,140,0,0.85)",
        }}
      />
    </>
  );
}
