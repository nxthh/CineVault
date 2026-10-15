# CineVault
Static frontend (HTML + Tailwind v3 + TypeScript, bundled with esbuild) using the TMDB API.
## Setup
1. `npm install`
2. `cp .env.example .env` and set `TMDB_READ_TOKEN` (TMDB API Read Access Token).
3. `npm run build` (generates the HTML pages, `dist/styles.css`, `dist/main.js`), then serve the folder: `npx serve .`
4. `npm run dev` (watch + serve), `npm run typecheck`.
Set your production domain in `gen.mjs` (`SITE`) for canonical URLs and the sitemap/robots.
## Limitations
- The token is bundled into client JS: **it is not secret**. Use a read-only token; a real secret needs a server proxy.
- No unlicensed streaming provider (e.g. Vidsrc) is integrated. `src/player.ts` shows official TMDB trailers and licensed "where to watch" links; plug a licensed provider into `providerUrl()`.
- No mock-data fallback; without a token pages show a configuration message.
- Metadata set on the details page is client-rendered and may not be seen by every crawler.
