import { NextRequest, NextResponse } from "next/server";
import { generateJSON } from "@/lib/llm";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { topic } = await req.json();
    if (!topic || typeof topic !== "string" || topic.trim().length < 2) {
      return NextResponse.json({ error: "Give me a topic to work with." }, { status: 400 });
    }

    const parsed = await generateJSON(
      `Topic: ${topic.trim()}`,
      "You design research curricula. Given a topic, propose 6 distinct subtopics that together give a well-rounded understanding of it — mix foundational, practical, historical, and contemporary angles. Respond ONLY with strict JSON, no prose, no markdown fences, matching this exact shape: " +
        `{"subtopics":[{"id":"string-kebab-case","title":"string","angle":"one sentence on what this angle covers"}]} — exactly 6 items in the array.`
    );

    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message ?? "Couldn't generate subtopics." },
      { status: 500 }
    );
  }
}
