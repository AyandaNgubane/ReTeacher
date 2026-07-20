import { NextRequest, NextResponse } from "next/server";
import { generateJSON } from "@/lib/llm";
import { searchWeb } from "@/lib/search";
import { searchYouTube } from "@/lib/youtube";
import { searchBooks } from "@/lib/books";
import { Subtopic, SubtopicFinding, Source, ResearchDossier } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

type GatheredSubtopic = { subtopic: Subtopic; sources: Source[] };

async function gatherSources(topic: string, subtopic: Subtopic): Promise<GatheredSubtopic> {
  const query = `${topic} — ${subtopic.title}`;
  const [articles, videos, books] = await Promise.all([
    searchWeb(query),
    searchYouTube(query),
    searchBooks(query),
  ]);
  return { subtopic, sources: [...articles, ...videos, ...books] };
}

function buildSubtopicSection(gathered: GatheredSubtopic, index: number): string {
  const { subtopic, sources } = gathered;
  const sourceList = sources.length
    ? sources.map((s, j) => `    [${j + 1}] (${s.type}) ${s.title} — ${s.snippet}`).join("\n")
    : "    (no sources found for this one — write from your own knowledge and say so plainly)";
  return `Subtopic ${index + 1} — id: "${subtopic.id}", title: "${subtopic.title}" (angle: ${subtopic.angle})\n  Sources:\n${sourceList}`;
}

export async function POST(req: NextRequest) {
  try {
    const { topic, subtopics } = await req.json();
    if (!topic || !Array.isArray(subtopics) || subtopics.length === 0) {
      return NextResponse.json(
        { error: "Provide a topic and at least one subtopic." },
        { status: 400 }
      );
    }

    // Search is fast, parallel, and unrelated to the Gemini rate limiter —
    // gather everything up front regardless of how many angles were chosen.
    const gathered = await Promise.all(
      (subtopics as Subtopic[]).map((s) => gatherSources(topic, s))
    );

    // Every briefing + the overview comes back from a single Gemini call.
    // This is deliberate: writing one briefing per subtopic as N separate
    // calls used to mean a 6-angle dossier made ~7 sequential Gemini
    // requests, which combined with the 10/min throttle was slow enough to
    // trip serverless function timeouts. One call, regardless of how many
    // angles are chosen, sidesteps both problems.
    const sections = gathered.map(buildSubtopicSection).join("\n\n");

    const parsed = await generateJSON<{
      overview: string;
      findings: { subtopicId: string; briefing: string }[];
    }>(
      `Topic: ${topic}\n\n${sections}\n\nFor EACH subtopic listed above, write a tight, well-organized briefing (200-300 words) synthesizing what its sources say. Refer to sources by their bracket number, e.g. [2], when a claim leans on one — write in your own words, never quote directly. If a subtopic has no sources, write it from your own knowledge instead and say so plainly. Flowing prose paragraphs only, no headers or bullet lists.\n\nThen write one separate 3-4 sentence overview introducing the topic as a whole and framing why these subtopics matter together.`,
      `You are a meticulous research analyst producing a multi-section briefing document. Respond ONLY with strict JSON, no prose, no markdown fences, matching this exact shape: {"overview":"string","findings":[{"subtopicId":"string — must exactly match an id given in the prompt","briefing":"string"}]}. Include exactly one findings entry per subtopic given, using the exact subtopicId provided for each — do not invent, merge, skip, or reorder subtopics.`,
      8192
    );

    const findings: SubtopicFinding[] = gathered.map(({ subtopic, sources }) => {
      const match = parsed.findings?.find((f) => f.subtopicId === subtopic.id);
      return {
        subtopicId: subtopic.id,
        subtopicTitle: subtopic.title,
        briefing:
          match?.briefing ??
          "The model didn't return a briefing for this subtopic — try regenerating the dossier.",
        sources,
      };
    });

    const dossier: ResearchDossier = {
      topic,
      generatedAt: new Date().toISOString(),
      overview: parsed.overview ?? "",
      findings,
    };

    return NextResponse.json(dossier);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message ?? "Research pipeline failed." },
      { status: 500 }
    );
  }
}
