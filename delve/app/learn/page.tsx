"use client";

import { useState } from "react";
import Link from "next/link";
import { CompassMark } from "@/components/Nav";
import TopicForm from "@/components/TopicForm";
import SubtopicPicker from "@/components/SubtopicPicker";
import LoadingLedger from "@/components/LoadingLedger";
import DossierView from "@/components/DossierView";
import ExportBar from "@/components/ExportBar";
import SummaryPanel from "@/components/SummaryPanel";
import PodcastPanel from "@/components/PodcastPanel";
import { Subtopic, ResearchDossier } from "@/lib/types";
import { postJSON } from "@/lib/api";

type Stage = "topic" | "subtopics" | "researching" | "dossier";
type Tab = "dossier" | "summary" | "podcast";

export default function LearnPage() {
  const [stage, setStage] = useState<Stage>("topic");
  const [tab, setTab] = useState<Tab>("dossier");
  const [topic, setTopic] = useState("");
  const [subtopics, setSubtopics] = useState<Subtopic[]>([]);
  const [chosenSubtopics, setChosenSubtopics] = useState<Subtopic[]>([]);
  const [dossier, setDossier] = useState<ResearchDossier | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTopicSubmit = async (t: string) => {
    setTopic(t);
    setLoading(true);
    setError(null);
    try {
      const data = await postJSON<{ subtopics: Subtopic[] }>("/api/subtopics", { topic: t });
      setSubtopics(data.subtopics);
      setStage("subtopics");
    } catch (e: any) {
      setError(e.message ?? "Something went wrong scouting angles.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubtopicsConfirm = async (chosen: Subtopic[]) => {
    setChosenSubtopics(chosen);
    setStage("researching");
    setLoading(true);
    setError(null);
    try {
      const data = await postJSON<ResearchDossier>("/api/research", { topic, subtopics: chosen });
      setDossier(data);
      setStage("dossier");
      setTab("dossier");
    } catch (e: any) {
      setError(e.message ?? "The research pipeline hit a snag.");
      setStage("subtopics");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStage("topic");
    setTopic("");
    setSubtopics([]);
    setChosenSubtopics([]);
    setDossier(null);
    setError(null);
  };

  return (
    <main className="min-h-screen bg-ink">
      <header className="fixed top-0 inset-x-0 z-40 backdrop-blur-md bg-ink/70 border-b border-brass/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <CompassMark />
            <span className="font-display text-xl text-parchment">Delve</span>
          </Link>
          {stage === "dossier" && (
            <button
              onClick={reset}
              className="text-xs stamp text-parchment/50 hover:text-brass transition-colors"
            >
              New dossier
            </button>
          )}
        </div>
      </header>

      <div className="pt-32 pb-24 px-6">
        {stage === "topic" && (
          <TopicForm onSubmit={handleTopicSubmit} loading={loading} error={error} />
        )}

        {stage === "subtopics" && (
          <SubtopicPicker
            topic={topic}
            subtopics={subtopics}
            onConfirm={handleSubtopicsConfirm}
            onBack={() => setStage("topic")}
            loading={loading}
            error={error}
          />
        )}

        {stage === "researching" && (
          <LoadingLedger subtopics={chosenSubtopics.map((s) => s.title)} />
        )}

        {stage === "dossier" && dossier && (
          <div className="max-w-3xl mx-auto">
            <div className="mb-8">
              <p className="stamp text-xs text-brass mb-3">Stage Three — The Dossier</p>
              <div className="flex items-start justify-between gap-6 flex-wrap">
                <h1 className="font-display text-4xl text-parchment">{dossier.topic}</h1>
                <ExportBar dossier={dossier} />
              </div>
              <p className="text-xs text-parchment/30 mt-2">
                Generated {new Date(dossier.generatedAt).toLocaleString()}
              </p>
            </div>

            <div className="flex gap-1 mb-8 border-b border-brass/10">
              {(["dossier", "summary", "podcast"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`stamp text-xs px-5 py-3 border-b-2 transition-colors ${
                    tab === t
                      ? "border-brass text-brass"
                      : "border-transparent text-parchment/40 hover:text-parchment/70"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {tab === "dossier" && <DossierView dossier={dossier} />}
            {tab === "summary" && <SummaryPanel dossier={dossier} />}
            {tab === "podcast" && <PodcastPanel dossier={dossier} />}
          </div>
        )}
      </div>
    </main>
  );
}
