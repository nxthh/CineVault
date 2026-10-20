# CineVault
Static frontend (HTML + Tailwind CSS + TypeScript, bundled with esbuild) using the TMDB API.

## Source layout

- `src/main.ts` starts the shared navigation and page-specific entry points.
- `src/pages.ts` maps page names to their renderers in `src/pages/`; each page and the shared library/hero helpers have their own module. `src/tmdb.ts` handles TMDB data.
- `src/ui/` contains focused UI modules for DOM helpers, cards, pagination, list storage, feedback, and site chrome. `src/ui.ts` re-exports these modules to keep existing imports concise.
- `src/player.ts` contains the trailer and watch-provider player.

## Setup
1. `npm install`
2. `cp .env.example .env` and set `TMDB_READ_TOKEN` (TMDB API Read Access Token).
3. `npm run build` (generates the HTML pages and the deployable static site in `dist/`), then serve the folder: `npx serve .`
4. `npm run dev` (watch + serve), `npm run typecheck`.
Set `SITE_URL` to your public site URL when building outside Vercel. On Vercel, the production domain is detected automatically for canonical URLs and the sitemap/robots.
## Deploy to Vercel
Import the repository in Vercel and set `TMDB_READ_TOKEN` in the project's Environment Variables. The included `vercel.json` runs `npm run build` and publishes only `dist/`. The token is bundled into browser JavaScript, so use a read-only TMDB token and do not treat it as a secret.
## Limitations
- The token is bundled into client JS: **it is not secret**. Use a read-only token; a real secret needs a server proxy.
- No unlicensed streaming provider (e.g. Vidsrc) is integrated. `src/player.ts` shows official TMDB trailers and licensed "where to watch" links; plug a licensed provider into `providerUrl()`.
- No mock-data fallback; without a token pages show a configuration message.
- Metadata set on the details page is client-rendered and may not be seen by every crawler.
