"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Globe, AtSign, ExternalLink } from "lucide-react";

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
  unitCode?: string;
  mission?: string;
  capability?: string;
  social?: {
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
}

function MemberPhoto({
  member,
  isHighlighted,
  isDimmed,
  onClick,
}: {
  member: TeamMember;
  isHighlighted: boolean;
  isDimmed: boolean;
  onClick: () => void;
}) {
  return (
    <motion.div
      onClick={onClick}
      animate={{ opacity: isDimmed ? 0.25 : 1 }}
      transition={{ duration: 0.3 }}
      className="relative aspect-square cursor-pointer overflow-hidden rounded-xl bg-[var(--surface)] border border-[var(--border)] group"
      style={{ maxHeight: "180px" }}
    >
      {member.image ? (
        <img
          src={member.image}
          alt={member.name}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: isHighlighted ? "none" : "grayscale(100%)" }}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-4xl font-bold text-[var(--border)]">
            {member.name.charAt(0)}
          </span>
        </div>
      )}

      {/* Overlay on highlight */}
      {isHighlighted && (
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--accent)]/20 to-transparent pointer-events-none" />
      )}

      {isHighlighted && (
        <div className="absolute left-3 top-3 rounded-full border border-[var(--accent)]/25 bg-[var(--surface)]/85 px-2.5 py-1">
          <span className="font-mono text-[9px] tracking-[0.25em] uppercase text-[var(--accent)]">
            {member.unitCode ?? "KS-UNIT"}
          </span>
        </div>
      )}

      {/* Social icons slide in */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: isHighlighted ? 1 : 0, y: isHighlighted ? 0 : 8 }}
        transition={{ duration: 0.2 }}
        className="absolute bottom-3 left-3 flex gap-2"
      >
        {member.social?.linkedin && (
          <a
            href={member.social.linkedin}
            onClick={(e) => e.stopPropagation()}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--surface)]/90 text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink size={12} />
          </a>
        )}
        {member.social?.twitter && (
          <a
            href={member.social.twitter}
            onClick={(e) => e.stopPropagation()}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--surface)]/90 text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            <AtSign size={12} />
          </a>
        )}
        {member.social?.instagram && (
          <a
            href={member.social.instagram}
            onClick={(e) => e.stopPropagation()}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--surface)]/90 text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Globe size={12} />
          </a>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function TeamShowcase({ members }: { members: TeamMember[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const toggle = (id: string) =>
    setActiveId((prev) => (prev === id ? null : id));
  const activeMember = members.find((member) => member.id === activeId) ?? null;

  // Split into two offset columns
  const col1 = members.filter((_, i) => i % 2 === 0);
  const col2 = members.filter((_, i) => i % 2 === 1);

  return (
    <div className="flex flex-col gap-8 md:flex-row md:gap-10">
      {/* Photo grid — two offset columns */}
      <div className="flex gap-4 flex-1 max-w-[420px]">
        <div className="flex flex-col gap-4 flex-1 pt-8">
          {col1.map((m) => (
            <MemberPhoto
              key={m.id}
              member={m}
              isHighlighted={activeId === m.id}
              isDimmed={activeId !== null && activeId !== m.id}
              onClick={() => toggle(m.id)}
            />
          ))}
        </div>
        <div className="flex flex-col gap-4 flex-1">
          {col2.map((m) => (
            <MemberPhoto
              key={m.id}
              member={m}
              isHighlighted={activeId === m.id}
              isDimmed={activeId !== null && activeId !== m.id}
              onClick={() => toggle(m.id)}
            />
          ))}
        </div>
      </div>

      {/* Name list */}
      <div className="flex min-w-[180px] flex-col justify-center gap-1">
        {members.map((m) => (
          <motion.button
            key={m.id}
            onClick={() => toggle(m.id)}
            aria-label={m.name}
            animate={{
              opacity:
                activeId === null ? 1 : activeId === m.id ? 1 : 0.3,
              x: activeId === m.id ? 6 : 0,
            }}
            transition={{ duration: 0.2 }}
            className="text-left py-2 border-b border-[var(--border)] last:border-0 group cursor-pointer"
          >
            <div
              className="font-mono text-sm font-bold transition-colors duration-200"
              style={{
                color:
                  activeId === m.id ? "var(--accent)" : "var(--text)",
              }}
            >
              {m.name}
            </div>
            {m.unitCode && (
              <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-[var(--accent)]/75">
                {m.unitCode}
              </div>
            )}
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--text-muted)]">
              {m.role}
            </div>
          </motion.button>
        ))}

        <motion.div
          animate={{ opacity: activeMember ? 1 : 0.45, y: activeMember ? 0 : 6 }}
          transition={{ duration: 0.25 }}
          className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"
        >
          <p className="font-mono text-[9px] tracking-[0.35em] uppercase text-[var(--accent)]/70">
            Personnel Dossier
          </p>
          <div className="mt-4 space-y-3">
            <div>
              <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-[var(--text-muted)]">
                Unit
              </p>
              <p className="mt-1 font-mono text-[11px] tracking-[0.2em] uppercase text-[var(--text)]">
                {activeMember?.unitCode ?? "Select Operator"}
              </p>
            </div>
            <div>
              <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-[var(--text-muted)]">
                Mission
              </p>
              <p className="mt-1 font-mono text-sm text-[var(--text)]">
                {activeMember?.mission ?? "Choose a personnel profile to inspect mission scope."}
              </p>
            </div>
            <div>
              <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-[var(--text-muted)]">
                Capability
              </p>
              <p className="mt-1 font-mono text-sm text-[var(--text-muted)]">
                {activeMember?.capability ?? "Capability markers appear once an operator is selected."}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
