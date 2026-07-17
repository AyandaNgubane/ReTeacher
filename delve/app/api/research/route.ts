import { NextRequest, NextResponse } from "next/server";
import { getAnthropic, MODEL, textFrom } from "@/lib/anthropic";
import { searchWeb } from "@/lib/search";
import { searchYouTube } from "@/lib/youtube";
import { searchBooks } from "@/lib/books";
import { Subtopic, SubtopicFinding, Source } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

async function researchSubtopic(topic: string, subtopic: Subtopic): Promise<SubtopicFinding> {
  const query = `${topic} — ${subtopic.title}`;

  const [articles, videos, books] = await Promise.all([
    searchWeb(query),
    searchYouTube(query),
    searchBooks(query),
  ]);

  const sources: Source[] = [...articles, ...videos, ...books];

  const anthropic = getAnthropic();
  const sourceList = sources
    .map((s, i) => `[${i + 1}] (${s.type}) ${s.title} — ${s.snippet}`)
    .join("\n");

  const briefingPrompt = sources.length
    ? `Topic: ${topic}\nSubtopic: ${subtopic.title} (${subtopic.angle})\n\nHere are sources gathered on this subtopic:\n${sourceList}\n\nWrite a tight, well-organized briefing (250-350 words) synthesizing what these sources say about this subtopic. Refer to sources by their bracket number, e.g. [2], when a claim leans on one. Write in your own words — never quote sources directly. If sources conflict, say so plainly. No headers, no bullet lists — flowing prose paragraphs only.`
    : `Topic: ${topic}\nSubtopic: ${subtopic.title} (${subtopic.angle})\n\nNo external sources were found for this subtopic. Using your own knowledge, write a tight, well-organized briefing (200-300 words) covering the key things a learner should understand about this subtopic. Flowing prose paragraphs only, no headers or bullet lists. Note at the end, briefly, that this section reflects general knowledge rather than freshly retrieved sources.`;

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 800,
    messages: [{ role: "user", content: briefingPrompt }],
  });

  return {
    subtopicId: subtopic.id,
    subtopicTitle: subtopic.title,
    briefing: textFrom(response),
    sources,
  };
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

    const findings = await Promise.all(
      subtopics.map((s: Subtopic) => researchSubtopic(topic, s))
    );

    const anthropic = getAnthropic();
    const overviewResponse = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 400,
      messages: [
        {
          role: "user",
          content: `Topic: ${topic}\n\nHere are briefings on ${findings.length} subtopics:\n\n${findings
            .map((f) => `${f.subtopicTitle}: ${f.briefing}`)
            .join("\n\n")}\n\nWrite a 3-4 sentence overview introducing this topic as a whole, framing why these subtopics matter together. Plain prose, no headers.`,
        },
      ],
    });

    return NextResponse.json({
      topic,
      generatedAt: new Date().toISOString(),
      overview: textFrom(overviewResponse),
      findings,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message ?? "Research pipeline failed." },
      { status: 500 }
    );
  }
}
