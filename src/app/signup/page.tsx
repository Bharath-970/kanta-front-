"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";

const AUTH_API = "";

export default function SignupPage() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
    purpose: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${AUTH_API}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Cannot reach auth server");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10">
            <span className="font-mono text-2xl text-emerald-400">✓</span>
          </div>
          <h2 className="mb-2 font-mono text-2xl font-bold text-[var(--text)]">
            REQUEST SUBMITTED
          </h2>
          <p className="mb-6 font-mono text-sm text-[var(--text-muted)]">
            Your access request is pending admin approval. You&apos;ll be notified once approved.
          </p>
          <Link
            href="/login"
            className="inline-block rounded-full border border-[var(--accent)] px-6 py-2 font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--accent)] transition-all hover:bg-[var(--accent)] hover:text-white"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.4em] text-[var(--accent)]">
            KANTAKA ŚODHANA
          </p>
          <h1 className="font-mono text-3xl font-bold text-[var(--text)]">
            REQUEST ACCESS
          </h1>
          <p className="mt-2 font-mono text-xs text-[var(--text-muted)]">
            Requests reviewed by admin before approval
          </p>
        </div>

        <div className="relative rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
          <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/60 to-transparent" />

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: "username", label: "Username", type: "text", placeholder: "operator_name" },
              { key: "email", label: "Email", type: "email", placeholder: "operator@domain.com" },
              { key: "password", label: "Password (min 8 chars)", type: "password", placeholder: "••••••••" },
              { key: "phone", label: "Phone", type: "tel", placeholder: "+91 9876543210" },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="mb-1.5 block font-mono text-[9px] uppercase tracking-[0.3em] text-[var(--text-muted)]">
                  {label}
                </label>
                <input
                  type={type}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  required
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 font-mono text-sm text-[var(--text)] outline-none transition-colors focus:border-[var(--accent)] placeholder:text-[var(--text-muted)]/40"
                  placeholder={placeholder}
                />
              </div>
            ))}

            <div>
              <label className="mb-1.5 block font-mono text-[9px] uppercase tracking-[0.3em] text-[var(--text-muted)]">
                Purpose / Organisation
              </label>
              <textarea
                value={form.purpose}
                onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))}
                rows={3}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 font-mono text-sm text-[var(--text)] outline-none transition-colors focus:border-[var(--accent)] placeholder:text-[var(--text-muted)]/40 resize-none"
                placeholder="Describe your purpose and organisation..."
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2">
                <p className="font-mono text-xs text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full border border-[var(--accent)] bg-[var(--accent)]/10 py-3 font-mono text-xs font-bold uppercase tracking-[0.3em] text-[var(--accent)] transition-all duration-200 hover:bg-[var(--accent)] hover:text-white disabled:opacity-40"
            >
              {loading ? "SUBMITTING..." : "SUBMIT REQUEST →"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="font-mono text-[10px] text-[var(--text-muted)]">
              Already have access?{" "}
              <Link href="/login" className="text-[var(--accent)] underline-offset-2 hover:underline">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
