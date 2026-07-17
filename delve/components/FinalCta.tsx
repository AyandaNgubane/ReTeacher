import Link from "next/link";
import { CompassMark } from "./Nav";

export default function FinalCta() {
  return (
    <section className="px-6 py-32 border-t border-brass/10 text-center">
      <div className="max-w-2xl mx-auto">
        <CompassMark className="w-10 h-10 mx-auto mb-8" />
        <h2 className="font-display text-4xl text-parchment mb-6">
          What are you trying to understand?
        </h2>
        <p className="text-parchment/55 mb-10">
          It takes about a minute to go from a topic to a full dossier.
        </p>
        <Link
          href="/learn"
          className="inline-block px-8 py-4 bg-brass text-ink font-medium hover:bg-brass-bright transition-colors"
        >
          Start a dossier
        </Link>
      </div>
      <footer className="mt-28 text-xs text-parchment/30 stamp">
        Delve — Research Dossier Engine
      </footer>
    </section>
  );
}
