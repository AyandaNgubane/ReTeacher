"use client";

import { useState } from "react";
import { Subtopic } from "@/lib/types";

export default function SubtopicPicker({
  topic,
  subtopics,
  onConfirm,
  onBack,
  loading,
  error,
}: {
  topic: string;
  subtopics: Subtopic[];
  onConfirm: (chosen: Subtopic[]) => void;
  onBack: () => void;
  loading: boolean;
  error?: string | null;
}) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(subtopics.map((s) => s.id))
  );
  const [custom, setCustom] = useState("");
  const [extra, setExtra] = useState<Subtopic[]>([]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const addCustom = () => {
    const title = custom.trim();
    if (!title) return;
    const id = `custom-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    const item = { id, title, angle: "Added by you" };
    setExtra((e) => [...e, item]);
    setSelected((prev) => new Set(prev).add(id));
    setCustom("");
  };

  const all = [...subtopics, ...extra];
  const chosen = all.filter((s) => selected.has(s.id));

  return (
    <div className="max-w-3xl mx-auto">
      <p className="stamp text-xs text-brass mb-3">Stage Two — The Angles</p>
      <h1 className="font-display text-3xl sm:text-4xl text-parchment mb-2">
        Covering <span className="text-brass italic">{topic}</span>
      </h1>
      <p className="text-parchment/55 mb-8">
        Keep what's useful, drop what isn't, add your own. {chosen.length} selected.
      </p>

      <div className="space-y-3">
        {all.map((s) => {
          const active = selected.has(s.id);
          return (
            <button
              key={s.id}
              onClick={() => toggle(s.id)}
              className={`w-full text-left p-5 border transition-colors duration-200 flex items-start gap-4 ${
                active
                  ? "border-brass/60 bg-ink-lighter"
                  : "border-parchment/10 bg-transparent opacity-50 hover:opacity-80"
              }`}
            >
              <span
                className={`mt-1 w-4 h-4 shrink-0 border flex items-center justify-center ${
                  active ? "border-brass bg-brass" : "border-parchment/30"
                }`}
              >
                {active && (
                  <svg viewBox="0 0 12 12" className="w-3 h-3 text-ink" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M2 6l3 3 5-6" />
                  </svg>
                )}
              </span>
              <span>
                <span className="block font-display text-lg text-parchment">{s.title}</span>
                <span className="block text-sm text-parchment/50 mt-0.5">{s.angle}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex gap-3">
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustom())}
          placeholder="Add your own angle…"
          className="flex-1 bg-transparent border border-dashed border-parchment/20 focus:border-brass px-4 py-3 text-parchment placeholder:text-parchment/30 outline-none text-sm"
        />
        <button
          onClick={addCustom}
          className="px-5 py-3 border border-parchment/20 text-parchment/70 hover:border-brass hover:text-brass text-sm transition-colors"
        >
          Add
        </button>
      </div>

      <div className="mt-10 flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-parchment/40 hover:text-parchment/70 transition-colors">
          ← Change topic
        </button>
        <div className="flex items-center gap-4">
          {error && <p className="text-rust text-sm max-w-xs text-right">{error}</p>}
          <button
            onClick={() => onConfirm(chosen)}
            disabled={chosen.length === 0 || loading}
            className="px-7 py-3.5 bg-brass text-ink font-medium disabled:opacity-40 hover:bg-brass-bright transition-colors whitespace-nowrap"
          >
            {loading ? "Dispatching researchers…" : `Research ${chosen.length} angle${chosen.length === 1 ? "" : "s"}`}
          </button>
        </div>
      </div>
    </div>
  );
}
