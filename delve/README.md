# Delve — a research dossier engine

Pick a topic, choose the angles you care about, and Delve gathers sources
from the web, YouTube, and books, writes a grounded briefing for each angle,
and lets you read it as a dossier, a short summary, an exported PDF/DOCX, or
a two-host podcast conversation.

Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, **Google AI
Studio (Gemini)** for generation, **yt-dlp** for video search, and **Open
Library** for book search. Ready to deploy on Vercel.

## How it works

1. **Topic → angles.** You type a topic; Gemini proposes six subtopics
   (angles) that together give a well-rounded view of it. You keep, drop, or
   add your own.
2. **Angles → research.** For each chosen angle, Delve searches the web
   (Tavily), YouTube (via yt-dlp), and Open Library in parallel, then asks
   Gemini to write a ~300-word briefing grounded in what was found, citing
   sources by number.
3. **Dossier → output.** Read the full dossier in the browser, get a
   short/detailed summary, export a PDF or Word file, or generate a scripted
   podcast conversation between a "Host" and a "Guest" that you can play
   back or download.

## Getting started locally

```bash
npm install          # also downloads the yt-dlp binary on Linux — see below
cp .env.example .env.local   # then add your Gemini key
npm run dev
```

Open http://localhost:3000.

## Environment variables

Only one is required; the rest are optional and the app degrades
gracefully without them.

| Variable | Required | Where to get it |
|---|---|---|
| `GOOGLE_AI_API_KEY` | **Yes** | https://aistudio.google.com/apikey — free tier available |
| `GOOGLE_AI_MODEL` | No | Defaults to `gemini-2.0-flash`. Set to `gemini-1.5-pro` for higher-quality briefings at higher cost/latency. |
| `TAVILY_API_KEY` | Recommended | https://tavily.com (free tier available) — powers live web/article search |

Video and book search need **no keys at all**:
- **Video** uses [yt-dlp](https://github.com/yt-dlp/yt-dlp) to search
  YouTube directly — no API, no quota.
- **Books** use [Open Library's](https://openlibrary.org/developers/api)
  public search API, run by the Internet Archive.

## About yt-dlp (video search)

`npm install` runs a `postinstall` script (`scripts/fetch-yt-dlp.js`) that
downloads the standalone `yt-dlp` Linux binary into `./bin/yt-dlp`. This is
what makes video search work on Vercel out of the box, since Vercel's
functions run on Amazon Linux and can't `pip install` anything at runtime.

- **On Linux (including Vercel deploys):** this happens automatically. The
  binary is included in the `research` API route's deployment bundle via
  `outputFileTracingIncludes` in `next.config.js`.
- **On macOS/Windows (local dev):** the download step is skipped, since the
  Linux binary won't run there. Install yt-dlp yourself instead —
  `pip install yt-dlp` or `brew install yt-dlp` both work — and `lib/youtube.ts`
  will pick it up from your `PATH` automatically.

**A known limitation worth knowing about:** yt-dlp works by talking to
YouTube directly rather than through an official, quota-managed API.
YouTube occasionally rate-limits or blocks requests coming from datacenter
IP ranges (which includes Vercel's), especially under sustained traffic.
If video search starts returning empty results in production, that's the
most likely cause — there's no official fix beyond rotating yt-dlp
versions/configuration or proxying requests through a residential-style
egress. The pipeline is built to degrade gracefully either way: if video
search fails, the briefing is written from articles and books alone.

## Deploying to Vercel

1. Push this project to a GitHub/GitLab/Bitbucket repo.
2. In Vercel, "Add New Project" → import the repo. Framework preset
   (Next.js) is auto-detected.
3. Add `GOOGLE_AI_API_KEY` (and optionally `GOOGLE_AI_MODEL`,
   `TAVILY_API_KEY`) under Project Settings → Environment Variables.
4. Deploy. `npm install`'s postinstall step fetches the yt-dlp binary
   automatically during the build — nothing else to configure.

No database is used — dossiers live in browser memory for the session and
are exported directly to file, so there's nothing else to provision.

## About the podcast feature

The podcast tab generates a real two-person dialogue script with Gemini,
tuned for two distinct voices (Host / Guest). Playback in-browser uses the
Web Speech API (`speechSynthesis`), which is built into every modern
browser and requires no extra API key or cost — that's why it's the
default. Voice quality depends on what your OS/browser ships.

If you want studio-quality generated audio you can download instead of
stream, wire `app/api/podcast/route.ts`'s output into a TTS provider (e.g.
ElevenLabs, Google Cloud TTS, OpenAI TTS) — the script is already
structured as `{ speaker, text }` lines, which maps directly onto most
multi-voice TTS APIs. This is left as a deliberate extension point rather
than baked in, since it requires a separate paid API key with usage-based
billing.

## Project structure

```
app/
  page.tsx              Landing page
  learn/page.tsx         The research flow (topic → angles → dossier)
  api/
    subtopics/route.ts   Gemini: propose angles for a topic
    research/route.ts    Search + Gemini: build the full dossier
    summarize/route.ts   Gemini: condense a dossier
    podcast/route.ts     Gemini: write a two-host dialogue script
components/              UI building blocks
lib/
  llm.ts                 Google AI Studio (Gemini) client
  search.ts               Tavily web search
  youtube.ts              yt-dlp-based video search
  books.ts                Open Library book search
  export-pdf.ts, export-docx.ts     Client-side file generation
  types.ts                Shared TypeScript types
scripts/
  fetch-yt-dlp.js         Build-time yt-dlp binary download
```

## Notes on quality and cost

- Every research call makes several Gemini API requests (subtopics, one
  briefing per angle, an overview) plus one search per source type per
  angle. A 6-angle dossier is roughly 8 model calls. `gemini-2.0-flash`
  keeps this both fast and inexpensive; check current pricing at
  https://ai.google.dev/pricing if you expect meaningful traffic.
- Gemini is instructed to paraphrase rather than quote and to cite sources
  by bracketed number, and to say so plainly if no sources were found for
  an angle rather than inventing citations.

## Built-in rate limiting

`lib/llm.ts` throttles itself to **10 requests per rolling 60-second
window** before it ever calls the Gemini API — every `generateText` /
`generateJSON` call queues through the same limiter. This exists because a
single dossier can burst close to a dozen calls at once (one briefing per
angle, fired in parallel), which is enough to trip Google AI Studio's
free-tier rate limit on its own, even with only one person using the app.

A few things worth knowing:

- The limiter is a module-level singleton, so it holds across requests on
  the same warm serverless instance — but Vercel can spin up multiple
  instances under real concurrent traffic, and each gets its own counter.
  It throttles a single instance's output reliably; it does not coordinate
  a hard global cap across every instance running at once.
- If Google still returns a 429 despite the throttle (its window may not
  align exactly with ours), `callGemini` backs off and retries up to twice,
  honoring `Retry-After` if present, before surfacing an error.
- Because of the throttle, a 6-angle dossier now deliberately takes longer
  than it technically could — `app/api/research/route.ts` and
  `app/api/podcast/route.ts` have longer `maxDuration` values (120s / 90s)
  to give the queue room to drain. **Timeouts above 60s require a Vercel
  Pro plan or higher** — the Hobby plan caps around 60 seconds. On Hobby,
  either lower `maxDuration` and research fewer angles at a time, or
  upgrade if you expect to regularly hit the limiter.
- To change the cap, edit `RATE_LIMIT` and `WINDOW_MS` at the top of
  `lib/llm.ts` — for example, raise it if you're on a paid Gemini tier with
  a higher RPM allowance.
