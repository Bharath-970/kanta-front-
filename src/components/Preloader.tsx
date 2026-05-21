"use client";

import { useEffect, useState } from "react";

export default function Preloader() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHidden(true), 1400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#030305]"
      style={{
        opacity: hidden ? 0 : 1,
        pointerEvents: hidden ? "none" : "all",
        transition: "opacity 0.4s ease",
      }}
    >
      {/* 4 dots pulsing in sequence */}
      <div className="flex gap-3">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            style={{
              display: "block",
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#FF4D00",
              animation: "ks-pulse 1.2s ease-in-out infinite",
              animationDelay: `${i * 0.18}s`,
            }}
          />
        ))}
      </div>

      <p
        className="mt-6 font-mono text-[10px] tracking-[0.5em] uppercase"
        style={{ color: "rgba(255,77,0,0.5)", marginTop: 24 }}
      >
        Kantaka Śodhana
      </p>

      <style>{`
        @keyframes ks-pulse {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
          40%            { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
