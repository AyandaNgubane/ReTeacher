import { NextRequest, NextResponse } from "next/server";
import { getAnthropic, MODEL, textFrom, cleanJson } from "@/lib/anthropic";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { topic } = await req.json();
    if (!topic || typeof topic !== "string" || topic.trim().length < 2) {
      return NextResponse.json({ error: "Give me a topic to work with." }, { status: 400 });
    }

    const anthropic = getAnthropic();
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system:
        "You design research curricula. Given a topic, propose 6 distinct subtopics that together give a well-rounded understanding of it — mix foundational, practical, historical, and contemporary angles. Respond ONLY with strict JSON, no prose, no markdown fences, matching this shape: " +
        `{"subtopics":[{"id":"string-kebab-case","title":"string","angle":"one sentence on what this angle covers"}]}`,
      messages: [
        {
          role: "user",
          content: `Topic: ${topic.trim()}`,
        },
      ],
    });

    const raw = textFrom(response);
    const parsed = JSON.parse(cleanJson(raw));
    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message ?? "Couldn't generate subtopics." },
      { status: 500 }
    );
  }
}
