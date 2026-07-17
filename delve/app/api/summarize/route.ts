import { NextRequest, NextResponse } from "next/server";
import { getAnthropic, MODEL, textFrom } from "@/lib/anthropic";
import { ResearchDossier } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { dossier, length }: { dossier: ResearchDossier; length?: "short" | "long" } =
      await req.json();
    if (!dossier?.findings?.length) {
      return NextResponse.json({ error: "No dossier to summarize." }, { status: 400 });
    }

    const wordTarget = length === "long" ? "400-500" : "120-160";
    const body = dossier.findings.map((f) => `${f.subtopicTitle}: ${f.briefing}`).join("\n\n");

    const anthropic = getAnthropic();
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 900,
      messages: [
        {
          role: "user",
          content: `Topic: ${dossier.topic}\n\nFull research briefings:\n\n${body}\n\nWrite a ${wordTarget} word summary a learner could read in place of the full dossier to get the essential picture. Plain prose, no headers, no bullet points.`,
        },
      ],
    });

    return NextResponse.json({ summary: textFrom(response) });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message ?? "Couldn't summarize." }, { status: 500 });
  }
}
