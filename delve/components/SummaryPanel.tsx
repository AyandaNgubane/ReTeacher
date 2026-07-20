"use client";

import { useState } from "react";
import { ResearchDossier } from "@/lib/types";

export default function SummaryPanel({ dossier }: { dossier: ResearchDossier }) {
  const [length, setLength] = useState<"short" | "long">("short");
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async (l: "short" | "long") => {
    setLength(l);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dossier, length: l }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSummary(data.summary);
    } catch (e: any) {
      setError(e.message ?? "Couldn't generate a summary.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ledger-card p-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <span className="stamp text-[11px] text-brass/70">Summary</span>
        <div className="flex gap-2">
          {(["short", "long"] as const).map((l) => (
            <button
              key={l}
              onClick={() => generate(l)}
              disabled={loading}
              className={`text-xs stamp px-3 py-1.5 border transition-colors ${
                length === l && summary
                  ? "border-brass bg-brass text-ink"
                  : "border-brass/30 text-brass/70 hover:border-brass"
              }`}
            >
              {l === "short" ? "Short" : "Detailed"}
            </button>
          ))}
        </div>
      </div>

      {!summary && !loading && !error && (
        <div className="text-center py-10">
          <p className="text-parchment/50 text-sm mb-5">
            Skip the full dossier — get the essential picture in a paragraph or two.
          </p>
          <button
            onClick={() => generate("short")}
            className="px-6 py-3 bg-brass text-ink font-medium hover:bg-brass-bright transition-colors text-sm"
          >
            Generate summary
          </button>
        </div>
      )}

      {loading && (
        <p className="text-parchment/40 text-sm py-10 text-center animate-pulse">Condensing the dossier…</p>
      )}

      {error && <p className="text-rust text-sm py-4">{error}</p>}

      {summary && !loading && (
        <p className="text-parchment/80 leading-relaxed text-[15px] whitespace-pre-line">{summary}</p>
      )}
    </div>
  );
}
