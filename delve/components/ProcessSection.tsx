const STEPS = [
  {
    n: "01",
    title: "Name the topic",
    body: "Type anything you want to understand — broad or narrow. Delve proposes six angles worth covering; keep the ones that matter to you, drop the rest, or write your own.",
  },
  {
    n: "02",
    title: "It goes to the field",
    body: "For each angle, Delve searches articles, YouTube, and books in parallel, then writes a grounded briefing that cites what it found instead of guessing.",
  },
  {
    n: "03",
    title: "Take it how you like",
    body: "Read the full dossier, get a tight summary, export a PDF or Word file for later, or generate a two-host podcast conversation that walks through the whole thing out loud.",
  },
];

export default function ProcessSection() {
  return (
    <section id="how-it-works" className="px-6 py-28 border-t border-brass/10">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-display text-3xl text-parchment mb-16 max-w-md">
          A dossier moves through three stages, like fieldwork.
        </h2>
        <div className="grid md:grid-cols-3 gap-10">
          {STEPS.map((step) => (
            <div key={step.n} className="relative pl-0">
              <span className="font-mono text-xs text-brass/70 stamp">{step.n}</span>
              <h3 className="font-display text-2xl text-parchment mt-3 mb-3">{step.title}</h3>
              <p className="text-parchment/60 text-[15px] leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
