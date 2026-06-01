"use client";

import { RiskScoringApp } from "@/components/RiskScoring";

export default function RiskScoringPage() {
  return (
    <div
      className="min-h-screen w-full"
      style={{
        backgroundColor: "#f9fafb",
        color: "#111827",
      }}
    >
      <RiskScoringApp />
    </div>
  );
}
