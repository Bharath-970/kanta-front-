"use client";
import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { api } from "./api";
import type {
  ClaimInput,
  ExplainResponse,
  FeatureImportances,
} from "./types";

const DEFAULT: ClaimInput = {
  claim_amount: 60000,
  length_of_stay: 2,
  provider_experience: 5,
  historical_denials: 5,
  readmission_flag: 0,
  repeat_procedure_flag: 0,
};

export function Explainability() {
  const [form, setForm] = useState<ClaimInput>(DEFAULT);
  const [explain, setExplain] = useState<ExplainResponse | null>(null);
  const [features, setFeatures] = useState<FeatureImportances | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.features().then(setFeatures).catch(() => null);
  }, []);

  const handleExplain = async () => {
    setLoading(true);
    setError(null);
    try {
      setExplain(await api.explain(form));
    } catch {
      setError("Explanation failed — is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const set = (key: keyof ClaimInput, val: number) =>
    setForm((f) => ({ ...f, [key]: val }));

  const shapData = explain
    ? Object.entries(explain.shap_values)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
    : [];

  const featureData = features
    ? Object.entries(features)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
    : [];

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Global Feature Importance */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-base font-semibold text-gray-800 mb-4">
          Global Feature Importance
        </h2>
        {featureData.length > 0 ? (
          <ResponsiveContainer width="100%" height={230}>
            <BarChart
              data={featureData}
              layout="vertical"
              margin={{ left: 10, right: 20, top: 4, bottom: 4 }}
            >
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "#6b7280" }}
                tickFormatter={(v) => v.toFixed(3)}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: "#374151" }}
                width={150}
              />
              <Tooltip
                formatter={(v) => [(v as number).toFixed(4), "Importance"]}
                contentStyle={{ borderRadius: 8, fontSize: 12 }}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-40 bg-gray-50 rounded-xl animate-pulse" />
        )}
      </section>

      {/* SHAP Explanation */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5 shadow-sm">
        <h2 className="text-base font-semibold text-gray-800">
          Prediction Explanation (SHAP)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <NumField
            label="Claim Amount (₹)"
            min={1000}
            max={300000}
            step={1000}
            value={form.claim_amount}
            onChange={(v) => set("claim_amount", v)}
          />
          <NumField
            label="Length of Stay (days)"
            min={0}
            max={30}
            value={form.length_of_stay}
            onChange={(v) => set("length_of_stay", v)}
          />
          <NumField
            label="Provider Experience (yrs)"
            min={1}
            max={30}
            value={form.provider_experience}
            onChange={(v) => set("provider_experience", v)}
          />
          <NumField
            label="Historical Denials"
            min={0}
            max={20}
            value={form.historical_denials}
            onChange={(v) => set("historical_denials", v)}
          />
          <SelField
            label="Readmission"
            value={form.readmission_flag}
            onChange={(v) => set("readmission_flag", v as 0 | 1)}
          />
          <SelField
            label="Repeat Procedure"
            value={form.repeat_procedure_flag}
            onChange={(v) => set("repeat_procedure_flag", v as 0 | 1)}
          />
        </div>

        <button
          onClick={handleExplain}
          disabled={loading}
          className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Explaining…" : "Explain Prediction"}
        </button>

        {explain && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span>
                Score:{" "}
                <strong className="text-gray-900">
                  {explain.prediction.score}
                </strong>
              </span>
              <span className="text-gray-300">|</span>
              <span>Band: <strong>{explain.prediction.band}</strong></span>
              <span className="text-gray-300">|</span>
              <span>
                Probability:{" "}
                {(explain.prediction.calibrated_prob * 100).toFixed(1)}%
              </span>
            </div>

            <ResponsiveContainer width="100%" height={230}>
              <BarChart
                data={shapData}
                layout="vertical"
                margin={{ left: 10, right: 20, top: 4, bottom: 4 }}
              >
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  tickFormatter={(v) => v.toFixed(2)}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#374151" }}
                  width={150}
                />
                <Tooltip
                  formatter={(v) => [(v as number).toFixed(4), "SHAP value"]}
                  contentStyle={{ borderRadius: 8, fontSize: 12 }}
                />
                <ReferenceLine x={0} stroke="#d1d5db" />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {shapData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.value >= 0 ? "#ef4444" : "#22c55e"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-400">
              Red = increases fraud risk · Green = decreases fraud risk
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function NumField({
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-gray-500">{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50"
      />
    </label>
  );
}

function SelField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: 0 | 1;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-gray-500">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50"
      >
        <option value={0}>No</option>
        <option value={1}>Yes</option>
      </select>
    </label>
  );
}
