/**
 * Talks to a local or self-hosted Ollama server (https://ollama.com) instead
 * of a hosted LLM API. Ollama's /api/chat endpoint is used directly — no SDK
 * required.
 *
 * Configure via:
 *   OLLAMA_BASE_URL  — where Ollama is reachable (default http://localhost:11434)
 *   OLLAMA_MODEL     — which pulled model to use (default llama3.1)
 *
 * Any Ollama-compatible model works. For the JSON-producing routes
 * (subtopics, podcast script) a model with decent instruction-following
 * matters more than raw size — llama3.1, qwen2.5, or mistral-nemo all work
 * well. Smaller models (phi3, gemma2:2b) work but may need looser JSON
 * parsing or more retries.
 */

const BASE_URL = (process.env.OLLAMA_BASE_URL ?? "http://localhost:11434").replace(/\/$/, "");
const MODEL = process.env.OLLAMA_MODEL ?? "llama3.1";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

async function chat(messages: ChatMessage[], opts: { json?: boolean; temperature?: number } = {}) {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        messages,
        stream: false,
        ...(opts.json ? { format: "json" } : {}),
        options: { temperature: opts.temperature ?? 0.6 },
      }),
    });
  } catch (err) {
    throw new Error(
      `Couldn't reach Ollama at ${BASE_URL}. Is it running, and is OLLAMA_BASE_URL set correctly? (${
        (err as Error).message
      })`
    );
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    if (res.status === 404 && /model/i.test(body)) {
      throw new Error(
        `Ollama can't find model "${MODEL}". Pull it first with: ollama pull ${MODEL}`
      );
    }
    throw new Error(`Ollama request failed (${res.status}): ${body || "no details"}`);
  }

  const data = await res.json();
  const content: string | undefined = data?.message?.content;
  if (!content) throw new Error("Ollama returned an empty response.");
  return content;
}

/** Free-form prose generation. */
export async function generateText(
  prompt: string,
  system?: string,
  temperature = 0.6
): Promise<string> {
  const messages: ChatMessage[] = [];
  if (system) messages.push({ role: "system", content: system });
  messages.push({ role: "user", content: prompt });
  return chat(messages, { temperature });
}

/** Structured JSON generation — parses and returns the object directly. */
export async function generateJSON<T = any>(prompt: string, system: string): Promise<T> {
  const messages: ChatMessage[] = [
    { role: "system", content: system },
    { role: "user", content: prompt },
  ];
  const raw = await chat(messages, { json: true, temperature: 0.5 });
  try {
    return JSON.parse(cleanJson(raw)) as T;
  } catch {
    throw new Error(
      "The model didn't return valid JSON. Smaller/less capable local models sometimes struggle with this — try a stronger OLLAMA_MODEL (e.g. llama3.1 or qwen2.5) if this keeps happening."
    );
  }
}

/** Strip markdown code fences some models add despite format:"json". */
export function cleanJson(raw: string): string {
  return raw
    .trim()
    .replace(/^```(json)?/i, "")
    .replace(/```$/, "")
    .trim();
}
