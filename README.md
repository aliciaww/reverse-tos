# Reverse TOS

Reverse TOS is a hackathon MVP that rewrites terms of service from the user's perspective. It shows the raw text on the left and a plain-English verdict, agreement bullets, and red flags on the right.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS

## Local setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How cached summaries work

The seeded demo sources live in `/data`:

- `/data/instagram.json`
- `/data/tiktok.json`
- `/data/discord.json`
- `/data/x.json`

Each file contains:

- source metadata
- raw TOS text
- a cached summary with `verdict`, `riskLevel`, `whatYouAgreeTo`, and `redFlags`

Brand switching is instant because the app reads those local JSON files directly.

## How live URL analysis works

Entering a URL calls `/api/analyze`.

That route:

1. fetches the page server-side
2. extracts readable text in `/lib/fetchTerms.ts`
3. summarizes it through `/lib/summarize.ts`

If fetching or extraction fails, the app shows an inline error and leaves the rest of the UI usable.

## Swapping in real TOS text later

- Replace the sample `text` strings in `/data/*.json` with fuller real terms text.
- Update `sourceUrl` and `date`.
- Keep the `cachedSummary` shape the same.

## Plugging in a real model later

`/lib/summarize.ts` already supports two modes:

- If `OPENAI_API_KEY` is present, it attempts a real model call through the Responses API.
- If not, it falls back to a deterministic local summarizer so the demo still works without extra setup.

You can also override the model name with `OPENAI_MODEL`.

## Validation

Useful checks:

```bash
npm run lint
npm run build
```
