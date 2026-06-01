"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import Link from "next/link";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-10 text-center">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.4em] text-[var(--accent)]">
            KANTAKA ŚODHANA
          </p>
          <h1 className="font-mono text-3xl font-bold text-[var(--text)]">
            ACCESS PORTAL
          </h1>
          <p className="mt-2 font-mono text-xs text-[var(--text-muted)]">
            Authenticated personnel only
          </p>
        </div>

        {/* Card */}
        <div className="relative rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
          {/* Top accent line */}
          <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/60 to-transparent" />

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block font-mono text-[9px] uppercase tracking-[0.3em] text-[var(--text-muted)]">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 font-mono text-sm text-[var(--text)] outline-none transition-colors focus:border-[var(--accent)] placeholder:text-[var(--text-muted)]/40"
                placeholder="operator@domain.com"
              />
            </div>

            <div>
              <label className="mb-1.5 block font-mono text-[9px] uppercase tracking-[0.3em] text-[var(--text-muted)]">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 font-mono text-sm text-[var(--text)] outline-none transition-colors focus:border-[var(--accent)] placeholder:text-[var(--text-muted)]/40"
                placeholder="••••••••"
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
              {loading ? "AUTHENTICATING..." : "AUTHENTICATE →"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="font-mono text-[10px] text-[var(--text-muted)]">
              No access?{" "}
              <Link
                href="/signup"
                className="text-[var(--accent)] underline-offset-2 hover:underline"
              >
                Request clearance
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-6 text-center font-mono text-[9px] uppercase tracking-[0.3em] text-[var(--text-muted)]/40">
          All access attempts are logged
        </p>
      </div>
    </div>
  );
}
