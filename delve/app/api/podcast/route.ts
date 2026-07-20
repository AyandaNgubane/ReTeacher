import { NextRequest, NextResponse } from "next/server";
import { generateJSON } from "@/lib/llm";
import { ResearchDossier } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { dossier }: { dossier: ResearchDossier } = await req.json();
    if (!dossier?.findings?.length) {
      return NextResponse.json({ error: "No dossier to work from." }, { status: 400 });
    }

    const body = dossier.findings.map((f) => `${f.subtopicTitle}: ${f.briefing}`).join("\n\n");

    const parsed = await generateJSON(
      `Topic: ${dossier.topic}\n\nResearch briefings to draw the conversation from:\n\n${body}\n\nWrite a podcast conversation of about 20-28 exchanges (lines) total that walks through this topic and its subtopics naturally, the way a good explainer podcast would. Open with a hook, close with a takeaway. Each line should be 1-4 sentences, spoken naturally, in your own words.`,
      "You write natural, engaging two-person podcast scripts that explain research topics through conversation. One speaker is 'Host' (curious, asks sharp follow-up questions, keeps things moving) and the other is 'Guest' (the expert, explains clearly, uses concrete examples, occasionally pushes back on oversimplification). Avoid filler like 'um' and avoid saying each other's names constantly. Make it feel like two smart people actually talking, not reading a script. Respond ONLY with strict JSON, no prose, no markdown fences, matching this exact shape: " +
        `{"title":"string","lines":[{"speaker":"Host","text":"..."},{"speaker":"Guest","text":"..."}]}`
    );

    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message ?? "Couldn't write the podcast script." },
      { status: 500 }
    );
  }
}
