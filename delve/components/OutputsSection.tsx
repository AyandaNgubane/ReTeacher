const OUTPUTS = [
  { tag: "PDF", title: "Export a dossier", detail: "Full briefings, sources, and citations, laid out for printing or filing away." },
  { tag: "DOCX", title: "Export to Word", detail: "The same dossier as an editable Word document, ready to annotate or share." },
  { tag: "TXT", title: "Get a summary", detail: "Short or long — the essential picture without reading every briefing." },
  { tag: "MP3", title: "Hear it discussed", detail: "A host and a guest talk through the whole topic, generated from your dossier." },
];

export default function OutputsSection() {
  return (
    <section className="px-6 py-28 border-t border-brass/10">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-display text-3xl text-parchment mb-14 max-w-md">
          Once it's gathered, take it wherever you're going.
        </h2>
        <div className="grid sm:grid-cols-2 gap-px bg-brass/10">
          {OUTPUTS.map((o) => (
            <div key={o.tag} className="bg-ink p-8 hover:bg-ink-lighter transition-colors duration-300">
              <span className="stamp text-[11px] text-brass border border-brass/30 px-2 py-1">{o.tag}</span>
              <h3 className="font-display text-xl text-parchment mt-4 mb-2">{o.title}</h3>
              <p className="text-parchment/55 text-sm leading-relaxed">{o.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
