"use client";
import { useState, useEffect } from "react";
import { api } from "./api";
import type { ClaimInput, PredictResponse, HospitalEntry } from "./types";

const BAND_STYLES: Record<string, string> = {
  Critical: "bg-red-50 border-red-400 text-red-800",
  High: "bg-orange-50 border-orange-400 text-orange-800",
  Medium: "bg-yellow-50 border-yellow-400 text-yellow-800",
  Low: "bg-green-50 border-green-400 text-green-800",
};

const BAND_BAR: Record<string, string> = {
  Critical: "bg-red-500",
  High: "bg-orange-500",
  Medium: "bg-yellow-500",
  Low: "bg-green-500",
};

const DEFAULT: ClaimInput = {
  claim_amount: 50000,
  length_of_stay: 3,
  provider_experience: 10,
  historical_denials: 2,
  readmission_flag: 0,
  repeat_procedure_flag: 0,
};

export function Dashboard() {
  const [form, setForm] = useState<ClaimInput>(DEFAULT);
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [hospitals, setHospitals] = useState<HospitalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [hospLoading, setHospLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .hospitals(20)
      .then(setHospitals)
      .catch(() => setError("Failed to load hospital data"))
      .finally(() => setHospLoading(false));
  }, []);

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    try {
      setResult(await api.predict(form));
    } catch {
      setError("Prediction failed — is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const set = (key: keyof ClaimInput, val: number) =>
    setForm((f) => ({ ...f, [key]: val }));

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Prediction Form */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5 shadow-sm">
        <h2 className="text-base font-semibold text-gray-800">
          Claim Risk Prediction
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
          onClick={handlePredict}
          disabled={loading}
          className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Predicting…" : "Predict Risk"}
        </button>

        {result && (
          <div
            className={`border rounded-xl px-5 py-4 ${BAND_STYLES[result.band]}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">
                  {result.score}
                  <span className="text-base font-normal opacity-60">
                    {" "}
                    / 999
                  </span>
                </p>
                <p className="font-semibold mt-0.5">{result.band} Risk</p>
              </div>
              <div className="text-right text-sm opacity-70">
                <p>Calibrated: {(result.calibrated_prob * 100).toFixed(1)}%</p>
                <p>Raw: {(result.raw_prob * 100).toFixed(1)}%</p>
              </div>
            </div>
            <div className="mt-3 bg-white/50 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${BAND_BAR[result.band]}`}
                style={{ width: `${(result.score / 999) * 100}%` }}
              />
            </div>
          </div>
        )}
      </section>

      {/* Hospital Ranking */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-base font-semibold text-gray-800 mb-4">
          Hospital Risk Ranking
        </h2>
        {hospLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b">
                  <th className="pb-2 pr-4">#</th>
                  <th className="pb-2 pr-4">Hospital</th>
                  <th className="pb-2 pr-4">Avg Risk Score</th>
                  <th className="pb-2">Claims</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {hospitals.map((h, i) => (
                  <tr key={h.hospital_id} className="hover:bg-gray-50">
                    <td className="py-2.5 pr-4 text-gray-400 text-xs">
                      {i + 1}
                    </td>
                    <td className="py-2.5 pr-4 font-medium text-gray-800">
                      {h.hospital_id}
                    </td>
                    <td className="py-2.5 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-20 bg-gray-100 rounded-full h-1.5">
                          <div
                            className="bg-blue-500 rounded-full h-1.5"
                            style={{
                              width: `${(h.avg_risk_score / 999) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-gray-700">
                          {h.avg_risk_score.toFixed(0)}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 text-gray-500">{h.claim_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
        className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
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
        className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
      >
        <option value={0}>No</option>
        <option value={1}>Yes</option>
      </select>
    </label>
  );
}
