const SOURCES = [
  {
    label: "Articles & Web",
    detail:
      "Live web search surfaces current reporting, explainers, and primary documents relevant to each angle.",
    icon: (
      <path d="M6 4h20a2 2 0 0 1 2 2v24l-6-4-6 4-6-4-6 4V6a2 2 0 0 1 2-2Z" />
    ),
  },
  {
    label: "YouTube",
    detail:
      "Lectures, talks, and explainer videos pulled straight from YouTube's own catalog, with channel and upload date.",
    icon: <path d="M6 10a4 4 0 0 1 4-4h20a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4V10Zm11 2v8l7-4-7-4Z" />,
  },
  {
    label: "Books",
    detail:
      "Google Books turns up published works on the subject — useful for depth a quick search won't give you.",
    icon: <path d="M8 5c4 0 7 1.2 8 3 1-1.8 4-3 8-3v22c-4 0-7 1.2-8 3-1-1.8-4-3-8-3V5Zm8 3v19" />,
  },
];

export default function SourcesSection() {
  return (
    <section className="px-6 py-28 bg-ink-light border-t border-brass/10">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-end justify-between mb-14 flex-wrap gap-4">
          <h2 className="font-display text-3xl text-parchment max-w-md">
            Three source types, gathered in parallel.
          </h2>
          <p className="text-parchment/50 text-sm max-w-xs">
            Every claim in a briefing traces back to something in this list — nothing is invented.
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {SOURCES.map((s) => (
            <div key={s.label} className="ledger-card p-7">
              <svg viewBox="0 0 36 36" className="w-9 h-9 text-brass mb-6" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round">
                {s.icon}
              </svg>
              <h3 className="font-display text-xl text-parchment mb-2">{s.label}</h3>
              <p className="text-parchment/55 text-sm leading-relaxed">{s.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
