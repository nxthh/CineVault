import fs from "fs";
const SITE =
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://example.com");
const P = {
  index: [
    "Home",
    "CineVault — Discover Movies & TV Shows",
    "Discover trending movies and series with CineVault.",
    ["Featured Premiere", "Trending This Week", "Recommended for You"],
    "home",
  ],
  movies: [
    "Movies",
    "Movies — CineVault",
    "Browse, search and filter movies.",
    ["Movie Spotlight", "Top 10 Movies", "Movie Library"],
    "movies",
  ],
  "tv-shows": [
    "TV Shows",
    "TV Shows — CineVault",
    "Explore series, seasons and episodes.",
    ["Series Spotlight", "Binge-Worthy Series", "Episode Explorer"],
    "tv",
  ],
  details: [
    "Details",
    "Title Details — CineVault",
    "Cast, crew, episodes and recommendations.",
    ["Title Overview", "Cast & Crew", "More Like This"],
    "details",
  ],
  "my-list": [
    "My List",
    "My List — CineVault",
    "Your saved movies and series.",
    ["Watchlist Summary", "My Collection", "Continue Exploring"],
    "mylist",
  ],
};
for (const [f, [h1, t, d, s, pg]] of Object.entries(P)) {
  const secs = s
    .map(
      (n, i) =>
        `<section id="s${i + 1}" aria-labelledby="h${i + 1}" class="${i ? "mx-auto max-w-7xl px-4 py-8" : ""}"><h2 id="h${i + 1}" class="${i ? "mb-4 text-2xl font-bold" : "sr-only"}">${n}</h2><div id="c${i + 1}"></div></section>`,
    )
    .join("\n");
  fs.writeFileSync(
    f + ".html",
    `<!doctype html><html lang="en" class="dark"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${t}</title><meta name="description" content="${d}"><link rel="canonical" href="${SITE}/${f}.html">
<meta property="og:title" content="${t}"><meta property="og:description" content="${d}"><meta property="og:type" content="website"><meta name="twitter:card" content="summary_large_image">
<script>try{var t=localStorage.getItem('cv-theme');if(t?t==='light':matchMedia('(prefers-color-scheme: light)').matches)document.documentElement.classList.remove('dark')}catch(e){}</script>
<link rel="stylesheet" href="dist/styles.css"><script type="module" src="dist/main.js" defer></script></head>
<body data-page="${pg}" class="bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 min-h-screen"><header id="nav"></header><h1 class="sr-only">${h1} — CineVault</h1>
<main>
${secs}
</main><footer id="footer"></footer></body></html>`,
  );
}
fs.writeFileSync(
  "404.html",
  fs
    .readFileSync("index.html", "utf8")
    .replace(
      /<main>[\s\S]*<\/main>/,
      '<main class="p-16 text-center"><h2 class="text-3xl font-bold">404 — Page not found</h2><a class="text-accent underline" href="index.html">Back home</a></main>',
    )
    .replace('data-page="home"', 'data-page="none"'),
);
fs.writeFileSync(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${Object.keys(
    P,
  )
    .map((f) => `<url><loc>${SITE}/${f}.html</loc></url>`)
    .join("")}</urlset>`,
);
