"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function SecureContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    window.setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 1200);
  };

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[28px] border border-[var(--accent)]/25 bg-[var(--surface)] p-8 text-center"
      >
        <p className="font-mono text-[10px] tracking-[0.45em] uppercase text-[var(--accent)] mb-4">
          Transmission Accepted
        </p>
        <p className="font-mono text-sm text-[var(--text)]">
          Secure brief received. We&apos;ll respond within 24 hours.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)]/95 overflow-hidden">
      <div className="grid grid-cols-3 gap-px border-b border-[var(--border)] bg-[var(--border)]">
        {[
          { label: "Channel State", value: "Secure" },
          { label: "Routing", value: "Direct" },
          { label: "Response", value: "<24h" },
        ].map((item) => (
          <div key={item.label} className="bg-[var(--surface)] px-4 py-3 text-left">
            <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-[var(--text-muted)]">
              {item.label}
            </p>
            <p className="mt-1 font-mono text-[11px] tracking-[0.22em] uppercase text-[var(--accent)]">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 p-6 md:p-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <label
              htmlFor="secure-contact-name"
              className="font-mono text-[9px] tracking-[0.3em] uppercase text-[var(--text-muted)]"
            >
              Operator Name
            </label>
            <input
              id="secure-contact-name"
              required
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Who is initiating the brief?"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)]/55 px-4 py-3 font-mono text-xs text-[var(--text)] placeholder:text-[var(--text-muted)]/40 focus:border-[var(--accent)] focus:outline-none transition-colors duration-200"
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="secure-contact-email"
              className="font-mono text-[9px] tracking-[0.3em] uppercase text-[var(--text-muted)]"
            >
              Return Channel
            </label>
            <input
              id="secure-contact-email"
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              placeholder="Where should the reply land?"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)]/55 px-4 py-3 font-mono text-xs text-[var(--text)] placeholder:text-[var(--text-muted)]/40 focus:border-[var(--accent)] focus:outline-none transition-colors duration-200"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="secure-contact-message"
            className="font-mono text-[9px] tracking-[0.3em] uppercase text-[var(--text-muted)]"
          >
            Transmission Brief
          </label>
          <textarea
            id="secure-contact-message"
            required
            rows={6}
            value={form.message}
            onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
            placeholder="Describe the deployment, fraud event, system integration, or operational need."
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)]/55 px-4 py-3 font-mono text-xs text-[var(--text)] placeholder:text-[var(--text-muted)]/40 focus:border-[var(--accent)] focus:outline-none transition-colors duration-200 resize-none"
          />
        </div>

        <div className="flex flex-col items-center gap-4 border-t border-[var(--border)] pt-5 text-center">
          <p className="font-mono text-[10px] tracking-[0.28em] uppercase text-[var(--text-muted)]">
            This panel becomes API-backed later. The submission surface already behaves like the final frontend state.
          </p>
          <button
            type="submit"
            disabled={sending}
            className="w-full rounded-full bg-[var(--accent)] px-8 py-3.5 font-mono text-[11px] tracking-[0.2em] uppercase text-white transition-opacity duration-200 hover:opacity-90 disabled:opacity-50 cursor-pointer"
          >
            {sending ? "Transmitting…" : "Transmit Secure Brief"}
          </button>
        </div>
      </form>
    </div>
  );
}
