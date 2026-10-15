// Player module. No unlicensed streaming provider is integrated: it shows the official TMDB-listed
// YouTube trailer and links to licensed "where to watch" pages. To add a licensed provider, return its embed URL from providerUrl().
import { Detail, Media, titleOf } from "./tmdb";
import { h, href } from "./ui";

const providerUrl = (
  _t: Media,
  _id: number,
  _s?: number,
  _e?: number,
): string | null => null;

export function openPlayer(
  d: Detail,
  type: Media,
  ep?: { season: number; episode: number; name: string },
) {
  const prev = document.activeElement as HTMLElement | null;
  
  // Updated URL logic checking the media type (movie vs tv)
  const url =
    providerUrl(type, d.id, ep?.season, ep?.episode) ||
    (d?.id
      ? type === "tv"
        ? `https://vidsrc.sh/embed/tv?tmdb=${d.id}&season=${ep?.season || 1}&episode=${ep?.episode || 1}`
        : `https://vidsrc.sh/embed/movie/${d.id}`
      : "");

  const watch = Object.values(d["watch/providers"]?.results || {})[0]?.link;
  
  const close = () => {
    ov.remove();
    document.removeEventListener("keydown", esc);
    prev?.focus();
  };

  const esc = (e: KeyboardEvent) => {
    if (e.key === "Escape") close();
  };

  const body = url
    ? (() => {
        const f = h("iframe", {
          src: url,
          title: `${titleOf(d)} player`,
          loading: "lazy",
          referrerpolicy: "no-referrer",
          allowfullscreen: "",
          class: "absolute inset-0 h-full w-full",
        });
        const w = h(
          "div",
          { class: "relative aspect-video w-full bg-black" },
          h(
            "p",
            {
              class:
                "absolute inset-0 flex items-center justify-center text-white",
            },
            "Loading player…",
          ),
          f,
        );
        return w;
      })()
    : h(
        "p",
        { class: "p-6" },
        "No playable video is available for this title.",
      );

  const closeBtn = h(
    "button",
    { type: "button", class: "rounded bg-accent px-3 py-1 text-white" },
    "Close Player",
  );
  closeBtn.onclick = close;

  const ov = h(
    "div",
    {
      role: "dialog",
      "aria-modal": "true",
      "aria-label": "Player",
      class:
        "fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4",
    },
    h(
      "div",
      { class: "w-full max-w-3xl rounded-lg bg-white p-4 dark:bg-zinc-900" },
      h(
        "div",
        { class: "mb-2 flex items-center justify-between gap-2" },
        h(
          "h2",
          { class: "font-bold" },
          titleOf(d) + (ep ? ` — S${ep.season}E${ep.episode}: ${ep.name}` : ""),
        ),
        closeBtn,
      ),
      body,
    ),
  );

  document.body.append(ov);
  document.addEventListener("keydown", esc);
  closeBtn.focus();
}