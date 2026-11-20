# Fresher jobs in India

Collects fresher/intern posts from public APIs, removes duplicates, tags role and city with an LLM,
and shows them on a searchable page that refreshes daily.

## Run locally
1. `npm install`
2. Copy `.env.example` to `.env` and fill in the keys.
3. `npm run refresh` (collect + dedupe + tag), then `npm start` and open http://localhost:3000
4. `npm run export` writes `data.csv`, `sample50.csv`, and prints dedupe stats and cost per 1,000 posts.

## Pipeline
Sources (Adzuna API, Greenhouse/Lever public boards) -> normalise -> dedupe on title+company+location
(SQLite UNIQUE key) -> Gemini tags in batches of 10 -> Express API -> static page.

## Daily refresh
node-cron runs at 03:00 IST while the server is up. On hosts that sleep, call
`POST /api/refresh` with header `x-refresh-token: <REFRESH_TOKEN>` from a scheduler.

## Cinematic Hero

A GSAP ScrollTrigger cinematic landing hero has been added (adapted from a React + Tailwind component).

### Files
- `hero/cinematic-hero.tsx` — the main animated component (uses global GSAP from CDN)
- `hero/main.tsx` — React mount entry
- `public/cinematic-hero.js` — built bundle (run build to generate)

### Build
```bash
npm install          # installs gsap if you want the module version
npm run build:hero   # or: npm run build
```

The page already loads GSAP + ScrollTrigger from CDN, so the component works without a local gsap package when using the global version.

### Notes
- The hero is full-viewport and pin-scrolls for ~7000px of scroll distance before revealing the search strip and job list.
- Content has been re-themed for FirstStep (jobs / open roles) instead of the original recovery-app copy.
- Original search form, chips, stats and job list remain fully functional below the cinematic section.
