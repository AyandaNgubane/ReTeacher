# Delve — a research dossier engine

Pick a topic, choose the angles you care about, and Delve gathers sources
from the web, YouTube, and Google Books, writes a grounded briefing for each
angle, and lets you read it as a dossier, a short summary, an exported
PDF/DOCX, or a two-host podcast conversation.

Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, and the
Anthropic API. Ready to deploy on Vercel.

## How it works

1. **Topic → angles.** You type a topic; Claude proposes six subtopics
   (angles) that together give a well-rounded view of it. You keep, drop, or
   add your own.
2. **Angles → research.** For each chosen angle, Delve searches the web
   (Tavily), YouTube (Data API v3), and Google Books in parallel, then asks
   Claude to write a ~300-word briefing grounded in what was found, citing
   sources by number.
3. **Dossier → output.** Read the full dossier in the browser, get a
   short/detailed summary, export a PDF or Word file, or generate a scripted
   podcast conversation between a "Host" and a "Guest" that you can play back
   or download.

## Getting started locally

```bash
npm install
cp .env.example .env.local   # then fill in your keys
npm run dev
```

Open http://localhost:3000.

## Environment variables

Only one is required to run the app; the rest are optional and the app
degrades gracefully without them (briefings fall back to the model's own
knowledge and say so).

| Variable | Required | Where to get it |
|---|---|---|
| `ANTHROPIC_API_KEY` | **Yes** | https://console.anthropic.com |
| `TAVILY_API_KEY` | Recommended | https://tavily.com (free tier available) — powers live web/article search |
| `YOUTUBE_API_KEY` | Recommended | Google Cloud Console → enable "YouTube Data API v3" |
| `GOOGLE_BOOKS_API_KEY` | Optional | Google Books API works unauthenticated at low volume; a key raises your quota |

## Deploying to Vercel

1. Push this project to a GitHub/GitLab/Bitbucket repo.
2. In Vercel, "Add New Project" → import the repo. Framework preset
   (Next.js) is auto-detected.
3. Add the environment variables above under Project Settings → Environment
   Variables.
4. Deploy. The API routes for research and podcast generation are already
   configured with longer `maxDuration` values in `vercel.json` since they
   make several outbound calls per request.

No database is used — dossiers live in browser memory for the session and
are exported directly to file, so there's nothing else to provision.

## About the podcast feature

The podcast tab generates a real two-person dialogue script with Claude,
tuned for two distinct voices (Host / Guest). Playback in-browser uses the
Web Speech API (`speechSynthesis`), which is built into every modern
browser and requires no extra API key or cost — that's why it's the
default. Voice quality depends on what your OS/browser ships.

If you want studio-quality generated audio you can download instead of
stream, wire `app/api/podcast/route.ts`'s output into a TTS provider (e.g.
ElevenLabs, OpenAI TTS, Google Cloud TTS) — the script is already
structured as `{ speaker, text }` lines, which maps directly onto most
multi-voice TTS APIs. This is left as a deliberate extension point rather
than baked in, since it requires a paid API key with usage-based billing.

## Project structure

```
app/
  page.tsx              Landing page
  learn/page.tsx         The research flow (topic → angles → dossier)
  api/
    subtopics/route.ts   Claude: propose angles for a topic
    research/route.ts    Search + Claude: build the full dossier
    summarize/route.ts   Claude: condense a dossier
    podcast/route.ts     Claude: write a two-host dialogue script
components/              UI building blocks
lib/
  search.ts, youtube.ts, books.ts   Source-gathering functions
  anthropic.ts           Shared Anthropic client
  export-pdf.ts, export-docx.ts     Client-side file generation
  types.ts               Shared TypeScript types
```

## Notes on quality and cost

- Every research call makes several Anthropic API requests (subtopics,
  one briefing per angle, an overview) plus one search call per source
  type per angle. A 6-angle dossier is roughly 8 model calls and up to 18
  search calls.
- Claude is instructed to paraphrase rather than quote and to cite sources
  by bracketed number, and to say so plainly if no sources were found for
  an angle rather than inventing citations.
