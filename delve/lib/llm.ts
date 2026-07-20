/**
 * Talks to Google AI Studio's Gemini API (generativelanguage.googleapis.com)
 * via plain fetch — no SDK dependency required.
 *
 * Get a free key at https://aistudio.google.com/apikey and set it as
 * GOOGLE_AI_API_KEY. Configure the model with GOOGLE_AI_MODEL (default
 * gemini-2.0-flash — fast and inexpensive; gemini-1.5-pro is available for
 * higher-quality briefings at higher cost/latency).
 */

const API_KEY = process.env.GOOGLE_AI_API_KEY;
const MODEL = process.env.GOOGLE_AI_MODEL ?? "gemini-2.0-flash";
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

type GenerateOptions = {
  system?: string;
  temperature?: number;
  json?: boolean;
  maxOutputTokens?: number;
};

// ---------------------------------------------------------------------------
// Client-side rate limiter: caps outbound Gemini calls at 10 per rolling
// 60-second window. A research/podcast request can fire off close to a dozen
// calls in quick succession (one briefing per subtopic, plus overview), which
// is enough to trip Google AI Studio's free-tier RPM limit on its own even
// before multiple visitors are involved. Every call to callGemini() queues
// here first; the queue is a module-level singleton so it holds across calls
// within the same warm serverless instance, not just within one request.
// ---------------------------------------------------------------------------
const RATE_LIMIT = 10;
const WINDOW_MS = 60_000;
let requestTimestamps: number[] = [];
let acquireChain: Promise<void> = Promise.resolve();

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function acquireSlot(): Promise<void> {
  const next = acquireChain.then(async () => {
    for (;;) {
      const now = Date.now();
      requestTimestamps = requestTimestamps.filter((t) => now - t < WINDOW_MS);
      if (requestTimestamps.length < RATE_LIMIT) {
        requestTimestamps.push(now);
        return;
      }
      const waitMs = WINDOW_MS - (now - requestTimestamps[0]) + 50;
      await sleep(Math.max(waitMs, 50));
    }
  });
  // Keep the chain alive even if this particular acquire's caller later
  // throws elsewhere — the chain itself never rejects.
  acquireChain = next.catch(() => undefined);
  return next;
}

async function callGemini(prompt: string, opts: GenerateOptions = {}, attempt = 0): Promise<string> {
  if (!API_KEY) {
    throw new Error(
      "Missing GOOGLE_AI_API_KEY. Get a free key at https://aistudio.google.com/apikey and add it to your environment variables (see .env.example)."
    );
  }

  await acquireSlot();

  const body: Record<string, any> = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: opts.temperature ?? 0.6,
      ...(opts.json ? { responseMimeType: "application/json" } : {}),
      ...(opts.maxOutputTokens ? { maxOutputTokens: opts.maxOutputTokens } : {}),
    },
  };
  if (opts.system) {
    body.systemInstruction = { parts: [{ text: opts.system }] };
  }

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/${MODEL}:generateContent?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw new Error(`Couldn't reach Google AI Studio: ${(err as Error).message}`);
  }

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");

    if (res.status === 429) {
      // Our own 10/min throttle should normally prevent this, but Google's
      // window may not align with ours exactly. Back off and retry a couple
      // of times before giving up, honoring Retry-After if it's sent.
      if (attempt < 2) {
        const retryAfterHeader = res.headers.get("retry-after");
        const waitMs = retryAfterHeader ? Number(retryAfterHeader) * 1000 : 15_000;
        await sleep(Number.isFinite(waitMs) ? waitMs : 15_000);
        return callGemini(prompt, opts, attempt + 1);
      }
      throw new Error("Google AI Studio rate limit hit — wait a moment and try again.");
    }

    if (res.status === 400 && /API key/i.test(errBody)) {
      throw new Error("Google AI Studio rejected the API key — check GOOGLE_AI_API_KEY.");
    }
    throw new Error(`Google AI Studio request failed (${res.status}): ${errBody || "no details"}`);
  }

  const data = await res.json();
  const candidate = data?.candidates?.[0];

  if (candidate?.finishReason === "SAFETY") {
    throw new Error("Google AI Studio declined to respond (safety filter). Try rephrasing the topic.");
  }

  const text: string | undefined = candidate?.content?.parts
    ?.map((p: any) => p.text ?? "")
    .join("");

  if (!text) throw new Error("Google AI Studio returned an empty response.");
  return text;
}

/** Free-form prose generation. */
export async function generateText(prompt: string, system?: string, temperature = 0.6): Promise<string> {
  return callGemini(prompt, { system, temperature });
}

/** Structured JSON generation — parses and returns the object directly. */
export async function generateJSON<T = any>(
  prompt: string,
  system: string,
  maxOutputTokens?: number
): Promise<T> {
  const raw = await callGemini(prompt, { system, temperature: 0.5, json: true, maxOutputTokens });
  try {
    return JSON.parse(cleanJson(raw)) as T;
  } catch {
    throw new Error("Google AI Studio didn't return valid JSON for this step. Try again.");
  }
}

/** Strip markdown code fences, just in case. */
export function cleanJson(raw: string): string {
  return raw
    .trim()
    .replace(/^```(json)?/i, "")
    .replace(/```$/, "")
    .trim();
}
