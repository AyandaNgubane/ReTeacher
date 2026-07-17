"use client";

import { useState } from "react";
import { ResearchDossier } from "@/lib/types";
import SourceItem from "./SourceItem";

export default function DossierView({ dossier }: { dossier: ResearchDossier }) {
  const [openId, setOpenId] = useState<string | null>(dossier.findings[0]?.subtopicId ?? null);

  return (
    <div>
      <div className="ledger-card p-8 mb-6">
        <span className="stamp text-[11px] text-brass/70">Overview</span>
        <p className="text-parchment/80 leading-relaxed mt-3 text-[15px]">{dossier.overview}</p>
      </div>

      <div className="space-y-4">
        {dossier.findings.map((finding, idx) => {
          const open = openId === finding.subtopicId;
          return (
            <div key={finding.subtopicId} className="ledger-card">
              <button
                onClick={() => setOpenId(open ? null : finding.subtopicId)}
                className="w-full flex items-center justify-between gap-4 p-6 text-left"
              >
                <span className="flex items-center gap-4 min-w-0">
                  <span className="stamp text-xs text-brass/50 shrink-0">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="font-display text-xl text-parchment truncate">
                    {finding.subtopicTitle}
                  </span>
                </span>
                <span className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-parchment/35 stamp">
                    {finding.sources.length} source{finding.sources.length === 1 ? "" : "s"}
                  </span>
                  <svg
                    viewBox="0 0 12 12"
                    className={`w-3 h-3 text-brass transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M2 4l4 4 4-4" />
                  </svg>
                </span>
              </button>

              {open && (
                <div className="px-6 pb-6 border-t border-brass/10 pt-5">
                  <p className="text-parchment/75 leading-relaxed text-[15px] whitespace-pre-line">
                    {finding.briefing}
                  </p>

                  {finding.sources.length > 0 && (
                    <div className="mt-6">
                      <span className="stamp text-[10px] text-parchment/35">Sources</span>
                      <div className="mt-1">
                        {finding.sources.map((s, i) => (
                          <SourceItem key={s.url + i} source={s} index={i} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
