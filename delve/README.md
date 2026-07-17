# Delve — a research dossier engine

Pick a topic, choose the angles you care about, and Delve gathers sources
from the web, YouTube, and Google Books, writes a grounded briefing for each
angle, and lets you read it as a dossier, a short summary, an exported
PDF/DOCX, or a two-host podcast conversation.

Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, and a **local
or self-hosted [Ollama](https://ollama.com) model** — no hosted LLM API key
required.

## How it works

1. **Topic → angles.** You type a topic; the model proposes six subtopics
   (angles) that together give a well-rounded view of it. You keep, drop, or
   add your own.
2. **Angles → research.** For each chosen angle, Delve searches the web
   (Tavily), YouTube (Data API v3), and Google Books in parallel, then asks
   the model to write a ~300-word briefing grounded in what was found,
   citing sources by number.
3. **Dossier → output.** Read the full dossier in the browser, get a
   short/detailed summary, export a PDF or Word file, or generate a scripted
   podcast conversation between a "Host" and a "Guest" that you can play
   back or download.

## Running Ollama

Everything here talks to Ollama's HTTP API — nothing is baked in beyond
that, so any Ollama-served model works.

1. Install Ollama: https://ollama.com/download
2. Pull a model that's good at instruction-following and JSON output —
   this matters for the subtopic and podcast-script steps specifically:
   ```bash
   ollama pull llama3.1
   ```
   Other solid options: `qwen2.5`, `mistral-nemo`. Smaller models
   (`phi3`, `gemma2:2b`) run faster on modest hardware but are more likely
   to occasionally produce malformed JSON on the structured steps.
3. Ollama listens on `http://localhost:11434` by default — nothing else to
   start, it runs as a background service once installed.

## Getting started locally

```bash
npm install
cp .env.example .env.local   # OLLAMA_MODEL etc. — see below
npm run dev
```

Open http://localhost:3000. As long as Ollama is running locally, the
default `.env.example` values work with no editing.

## Environment variables

| Variable | Required | Notes |
|---|---|---|
| `OLLAMA_BASE_URL` | Yes | Defaults to `http://localhost:11434`. Change this if Ollama runs elsewhere (see deployment below). |
| `OLLAMA_MODEL` | Yes | Defaults to `llama3.1`. Must be a model you've already `ollama pull`ed on that server. |
| `TAVILY_API_KEY` | Recommended | https://tavily.com — powers live web/article search |
| `YOUTUBE_API_KEY` | Recommended | Google Cloud Console → enable "YouTube Data API v3" |
| `GOOGLE_BOOKS_API_KEY` | Optional | Google Books API works unauthenticated at low volume; a key raises your quota |

## Deploying — the part that needs a decision

Vercel's serverless functions run in Vercel's cloud, **not on your laptop**,
so `OLLAMA_BASE_URL=http://localhost:11434` only works if the app itself is
also running on your machine. To put this online, Ollama needs to be
reachable at a public (or at least Vercel-reachable) URL. Pick one:

### Option A — run the whole app locally (simplest, no deployment)
Just use `npm run dev` as above, on the same machine as Ollama. This is the
right choice if this is a personal tool and you don't need a public URL.

### Option B — self-host Ollama on a server, deploy the Next.js app to Vercel
1. Run Ollama on a VPS/cloud box you control (a machine with a decent GPU
   helps a lot — CPU inference works but is slow). Expose it on a port,
   ideally behind a reverse proxy with auth, since Ollama has no built-in
   authentication.
2. Set `OLLAMA_BASE_URL` in Vercel's Project Settings → Environment
   Variables to that server's URL (e.g. `https://ollama.yourdomain.com`).
3. Deploy the app to Vercel as normal (import repo → deploy).
4. **Check your Vercel plan's function timeout.** Local-model inference is
   often slower than a hosted API, and a full dossier makes several
   sequential model calls. This project's `vercel.json` requests
   120-second timeouts on the research/podcast routes, which requires a
   Vercel Pro (or higher) plan — the Hobby plan caps around 60 seconds.
   If you're on Hobby, either lower `maxDuration` and accept some requests
   may time out on larger dossiers, or research fewer angles at once.

### Option C — self-host everything (app + Ollama on one box)
Run both the Next.js app (`npm run build && npm run start`) and Ollama on
the same server, so `OLLAMA_BASE_URL=http://localhost:11434` still applies.
This skips Vercel entirely — put it behind whatever reverse proxy /
process manager you'd normally use (nginx + pm2, Docker Compose, etc.).

There's no database in any of these setups — dossiers live in browser
memory for the session and export directly to file.

## About the podcast feature

The podcast tab generates a real two-person dialogue script with your
Ollama model, tuned for two distinct voices (Host / Guest). Playback
in-browser uses the Web Speech API (`speechSynthesis`), built into every
modern browser, free, no extra key required. Voice quality depends on
what your OS/browser ships.

If you want studio-quality generated audio you can download instead of
stream, wire `app/api/podcast/route.ts`'s output into an open-source TTS
project you self-host (e.g. Coqui TTS, Piper) or any TTS API — the script
is already structured as `{ speaker, text }` lines, which maps directly
onto most multi-voice TTS setups. Left as an extension point rather than
baked in, since it adds another service to run.

## Project structure

```
app/
  page.tsx              Landing page
  learn/page.tsx         The research flow (topic → angles → dossier)
  api/
    subtopics/route.ts   Ollama: propose angles for a topic
    research/route.ts    Search + Ollama: build the full dossier
    summarize/route.ts   Ollama: condense a dossier
    podcast/route.ts     Ollama: write a two-host dialogue script
components/              UI building blocks
lib/
  llm.ts                 Ollama client (chat + structured JSON generation)
  search.ts, youtube.ts, books.ts   Source-gathering functions
  export-pdf.ts, export-docx.ts     Client-side file generation
  types.ts               Shared TypeScript types
```

## Notes on quality, speed, and cost

- Running everything locally/self-hosted means **no per-request API
  cost**, but inference speed depends entirely on your hardware. A
  6-angle dossier makes roughly 8 sequential model calls (Ollama
  typically processes one request at a time per model unless you've
  configured concurrency) — expect this to take noticeably longer than a
  hosted API, especially on CPU-only or smaller GPUs.
- The model is instructed to paraphrase rather than quote, cite sources
  by bracketed number, and say so plainly if no sources were found for an
  angle rather than inventing citations — but local models vary more in
  how reliably they follow this than larger hosted models do. Spot-check
  output, especially on smaller models.
- If you see JSON-parsing errors on the subtopics or podcast steps, it
  usually means the model produced malformed JSON despite the `format:
  "json"` constraint — try a stronger `OLLAMA_MODEL`.
