"use client";
import { useState } from "react";
import { Dashboard } from "./Dashboard";
import { Explainability } from "./Explainability";

const TABS = ["Dashboard", "Explainability"] as const;
type Tab = (typeof TABS)[number];

export function RiskScoringApp() {
  const [tab, setTab] = useState<Tab>("Dashboard");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Risk Scoring System
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Healthcare insurance claim fraud detection · XGBoost + SHAP
            </p>
          </div>
          <span className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2.5 py-1 rounded-full font-medium">
            Use Case
          </span>
        </div>

        {/* Tab Nav */}
        <div className="flex border-b border-gray-200">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === t
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "Dashboard" && <Dashboard />}
        {tab === "Explainability" && <Explainability />}
      </div>
    </div>
  );
}
