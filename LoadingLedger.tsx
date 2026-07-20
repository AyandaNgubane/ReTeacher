"use client";

import { useEffect, useRef, useState } from "react";
import { ResearchDossier, PodcastScript } from "@/lib/types";

export default function PodcastPanel({ dossier }: { dossier: ResearchDossier }) {
  const [script, setScript] = useState<PodcastScript | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [activeLine, setActiveLine] = useState(-1);
  const [voicesReady, setVoicesReady] = useState(false);
  const cancelledRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const load = () => setVoicesReady(window.speechSynthesis.getVoices().length > 0);
    load();
    window.speechSynthesis.onvoiceschanged = load;
  }, []);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/podcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dossier }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setScript(data);
    } catch (e: any) {
      setError(e.message ?? "Couldn't write the podcast script.");
    } finally {
      setLoading(false);
    }
  };

  const pickVoice = (speaker: "Host" | "Guest") => {
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return undefined;
    const englishVoices = voices.filter((v) => v.lang.startsWith("en"));
    const pool = englishVoices.length ? englishVoices : voices;
    // Simple heuristic split so Host/Guest sound distinct where possible.
    const female = pool.filter((v) => /female|samantha|victoria|zira|susan/i.test(v.name));
    const male = pool.filter((v) => /male|daniel|alex|fred|david/i.test(v.name));
    if (speaker === "Host") return female[0] ?? pool[0];
    return male[0] ?? pool[Math.min(1, pool.length - 1)];
  };

  const play = () => {
    if (!script || typeof window === "undefined") return;
    window.speechSynthesis.cancel();
    cancelledRef.current = false;
    setPlaying(true);

    let i = 0;
    const speakNext = () => {
      if (cancelledRef.current || i >= script.lines.length) {
        setPlaying(false);
        setActiveLine(-1);
        return;
      }
      const line = script.lines[i];
      setActiveLine(i);
      const utterance = new SpeechSynthesisUtterance(line.text);
      const voice = pickVoice(line.speaker);
      if (voice) utterance.voice = voice;
      utterance.pitch = line.speaker === "Host" ? 1.05 : 0.9;
      utterance.rate = 1.0;
      utterance.onend = () => {
        i += 1;
        speakNext();
      };
      utterance.onerror = () => {
        i += 1;
        speakNext();
      };
      window.speechSynthesis.speak(utterance);
    };
    speakNext();
  };

  const stop = () => {
    cancelledRef.current = true;
    window.speechSynthesis.cancel();
    setPlaying(false);
    setActiveLine(-1);
  };

  const downloadScript = () => {
    if (!script) return;
    const text = `${script.title}\n\n${script.lines.map((l) => `${l.speaker}: ${l.text}`).join("\n\n")}`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${dossier.topic.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-podcast-script.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => stop, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!script && !loading && !error) {
    return (
      <div className="ledger-card p-8 text-center py-16">
        <span className="stamp text-[11px] text-brass/70">Podcast</span>
        <p className="text-parchment/50 text-sm mt-4 mb-6 max-w-md mx-auto">
          Turn this dossier into a two-host conversation — a host and a guest talking
          through the topic like a real explainer podcast.
        </p>
        <button
          onClick={generate}
          className="px-6 py-3 bg-brass text-ink font-medium hover:bg-brass-bright transition-colors text-sm"
        >
          Write the episode
        </button>
      </div>
    );
  }

  return (
    <div className="ledger-card p-8">
      {loading && (
        <p className="text-parchment/40 text-sm py-10 text-center animate-pulse">
          Scripting the conversation…
        </p>
      )}
      {error && <p className="text-rust text-sm py-4">{error}</p>}

      {script && !loading && (
        <>
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div>
              <span className="stamp text-[11px] text-brass/70">Podcast</span>
              <h3 className="font-display text-2xl text-parchment mt-1">{script.title}</h3>
            </div>
            <div className="flex gap-3">
              {!playing ? (
                <button
                  onClick={play}
                  className="text-xs stamp px-4 py-2.5 border border-brass/40 text-brass hover:bg-brass hover:text-ink transition-colors"
                  title={voicesReady ? undefined : "Your browser may need a moment to load voices"}
                >
                  ▶ Play conversation
                </button>
              ) : (
                <button
                  onClick={stop}
                  className="text-xs stamp px-4 py-2.5 border border-rust/50 text-rust hover:bg-rust hover:text-parchment transition-colors"
                >
                  ■ Stop
                </button>
              )}
              <button
                onClick={downloadScript}
                className="text-xs stamp px-4 py-2.5 border border-parchment/20 text-parchment/60 hover:border-brass hover:text-brass transition-colors"
              >
                Download script
              </button>
            </div>
          </div>

          <p className="text-[11px] text-parchment/30 mb-6">
            Played aloud using your browser's built-in voices. For studio-quality audio, download the script and pair it with a text-to-speech service of your choice.
          </p>

          <div className="space-y-4 max-h-[520px] overflow-y-auto pr-2">
            {script.lines.map((line, i) => (
              <div
                key={i}
                className={`flex gap-4 p-3 transition-colors rounded ${
                  activeLine === i ? "bg-brass/10 border-l-2 border-brass" : "border-l-2 border-transparent"
                }`}
              >
                <span
                  className={`stamp text-[10px] shrink-0 w-14 pt-0.5 ${
                    line.speaker === "Host" ? "text-brass" : "text-moss"
                  }`}
                >
                  {line.speaker}
                </span>
                <p className="text-parchment/80 text-sm leading-relaxed">{line.text}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
