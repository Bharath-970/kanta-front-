"use client";

import { cn } from "@/lib/utils";

const GRADIENT_ANGLES = {
  top: 0,
  right: 90,
  bottom: 180,
  left: 270,
};

type Direction = keyof typeof GRADIENT_ANGLES;

interface ProgressiveBlurProps {
  direction?: Direction;
  blurLayers?: number;
  blurIntensity?: number;
  className?: string;
}

export default function ProgressiveBlur({
  direction = "bottom",
  blurLayers = 8,
  blurIntensity = 0.25,
  className,
}: ProgressiveBlurProps) {
  const layers = Math.max(blurLayers, 2);
  const angle = GRADIENT_ANGLES[direction];
  const segSize = 1 / (layers + 1);

  return (
    <div className={cn("absolute inset-0 pointer-events-none", className)}>
      {Array.from({ length: layers }).map((_, i) => {
        const blur = (i + 1) * blurIntensity * 4;
        const stops = [
          i * segSize,
          (i + 1) * segSize,
          (i + 2) * segSize,
          (i + 3) * segSize,
        ].map((pos, pi) =>
          `rgba(0,0,0,${pi === 1 || pi === 2 ? 1 : 0}) ${Math.min(pos * 100, 100)}%`
        );

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              inset: 0,
              backdropFilter: `blur(${blur}px)`,
              WebkitBackdropFilter: `blur(${blur}px)`,
              maskImage: `linear-gradient(${angle}deg, ${stops.join(", ")})`,
              WebkitMaskImage: `linear-gradient(${angle}deg, ${stops.join(", ")})`,
            }}
          />
        );
      })}
    </div>
  );
}
