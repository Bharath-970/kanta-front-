"use client";

import { useState } from "react";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder — wire to backend later
    setSent(true);
  };

  return (
    <main className="min-h-screen pt-32 pb-24 px-6">
      <div className="mx-auto max-w-2xl">

        {/* Header */}
        <div className="mb-16">
          <p className="font-mono text-[10px] tracking-[0.5em] text-[var(--accent)] uppercase mb-4">
            Reach Out
          </p>
          <h1 className="font-mono text-5xl md:text-7xl font-bold text-[var(--text)] leading-tight mb-6">
            Contact
          </h1>
          <p className="font-mono text-sm text-[var(--text-muted)] leading-relaxed">
            For partnerships, deployments, or just a conversation about fraud
            detection at scale.
          </p>
        </div>

        {/* Meta info */}
        <div className="mb-12 grid grid-cols-2 gap-px border border-[var(--border)] rounded-2xl overflow-hidden">
          {[
            { label: "Location", value: "12.9716° N, 77.5946° E" },
            { label: "Based in", value: "Bangalore, India" },
            { label: "Domain", value: "AI & MLOps" },
            { label: "Focus", value: "Fraud Detection" },
          ].map((item) => (
            <div key={item.label} className="bg-[var(--surface)] px-6 py-5">
              <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-[var(--accent)] mb-1">
                {item.label}
              </div>
              <div className="font-mono text-sm text-[var(--text)]">
                {item.value}
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        {sent ? (
          <div className="rounded-2xl border border-[var(--accent)]/30 bg-[var(--surface)] p-10 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent" />
            <div className="font-mono text-4xl font-bold text-[var(--accent)] mb-4">
              ✓
            </div>
            <div className="font-mono text-lg font-bold text-[var(--text)] mb-2">
              Message received.
            </div>
            <div className="font-mono text-sm text-[var(--text-muted)]">
              We will be in touch shortly.
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              { name: "name", label: "Name", type: "text", placeholder: "Your name" },
              { name: "email", label: "Email", type: "email", placeholder: "your@email.com" },
            ].map((field) => (
              <div key={field.name}>
                <label className="block font-mono text-[10px] tracking-[0.3em] uppercase text-[var(--text-muted)] mb-2">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  required
                  placeholder={field.placeholder}
                  value={form[field.name as keyof typeof form]}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, [field.name]: e.target.value }))
                  }
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 font-mono text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none transition-colors focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30"
                />
              </div>
            ))}

            <div>
              <label className="block font-mono text-[10px] tracking-[0.3em] uppercase text-[var(--text-muted)] mb-2">
                Message
              </label>
              <textarea
                required
                rows={5}
                placeholder="Tell us about your use case..."
                value={form.message}
                onChange={(e) =>
                  setForm((f) => ({ ...f, message: e.target.value }))
                }
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 font-mono text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] outline-none transition-colors focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-[var(--accent)] py-3 font-mono text-[11px] tracking-[0.2em] uppercase text-white transition-opacity hover:opacity-90 active:opacity-80"
            >
              Send Message →
            </button>
          </form>
        )}

        {/* Bottom */}
        <div className="mt-16 text-center border-t border-[var(--border)] pt-8">
          <p className="font-mono text-[10px] tracking-[0.4em] uppercase text-[var(--text-muted)]">
            Kantaka Śodhana · Bangalore · Est. 2024
          </p>
        </div>
      </div>
    </main>
  );
}
