"use client";

import { useEffect, useState } from "react";

const MESSAGES = [
  "Searching articles…",
  "Checking YouTube…",
  "Checking the stacks for books…",
  "Cross-referencing sources…",
  "Writing briefings…",
];

export default function LoadingLedger({ subtopics }: { subtopics: string[] }) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setMsgIndex((i) => (i + 1) % MESSAGES.length), 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="max-w-xl mx-auto text-center py-20">
      <svg viewBox="0 0 80 80" className="w-16 h-16 mx-auto mb-8 text-brass compass-spin" style={{ transformOrigin: "40px 40px" }}>
        <circle cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.3" />
        <path d="M40 12 L45 40 L40 68 L35 40 Z" fill="currentColor" opacity="0.7" />
      </svg>
      <p className="font-display text-2xl text-parchment mb-3">{MESSAGES[msgIndex]}</p>
      <p className="text-parchment/40 text-sm mb-10">
        Gathering {subtopics.length} angle{subtopics.length === 1 ? "" : "s"} on your topic — this usually takes under a minute.
      </p>
      <div className="flex flex-col gap-2 max-w-sm mx-auto text-left">
        {subtopics.map((s, i) => (
          <div
            key={s}
            className="stamp text-[11px] text-parchment/40 border-l-2 border-brass/20 pl-3 py-1"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}
