"use client";

import { useState } from "react";

const PROMPTS = [
  "the fall of the Roman Republic",
  "how vaccines are developed",
  "the psychology of habit formation",
  "quantum computing",
  "the 2008 financial crisis",
];

export default function TopicForm({
  onSubmit,
  loading,
  error,
}: {
  onSubmit: (topic: string) => void;
  loading: boolean;
  error: string | null;
}) {
  const [topic, setTopic] = useState("");

  return (
    <div className="max-w-2xl mx-auto text-center">
      <p className="stamp text-xs text-brass mb-5">Stage One — The Topic</p>
      <h1 className="font-display text-4xl sm:text-5xl text-parchment mb-6 leading-tight">
        What do you want to understand?
      </h1>
      <p className="text-parchment/55 mb-10">
        Be as broad or as specific as you like. You'll get to choose the angles next.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (topic.trim().length > 1) onSubmit(topic.trim());
        }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. the history of typography"
          className="flex-1 bg-ink-light border border-brass/25 focus:border-brass px-5 py-4 text-parchment placeholder:text-parchment/30 outline-none transition-colors"
          disabled={loading}
          autoFocus
        />
        <button
          type="submit"
          disabled={loading || topic.trim().length < 2}
          className="px-7 py-4 bg-brass text-ink font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brass-bright transition-colors whitespace-nowrap"
        >
          {loading ? "Scouting angles…" : "Propose angles"}
        </button>
      </form>

      {error && <p className="mt-4 text-rust text-sm">{error}</p>}

      <div className="mt-8 flex flex-wrap gap-2 justify-center">
        {PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => !loading && onSubmit(p)}
            className="text-xs text-parchment/40 border border-parchment/10 px-3 py-1.5 hover:text-brass hover:border-brass/40 transition-colors"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
