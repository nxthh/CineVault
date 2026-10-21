import type { Detail, Media } from "./tmdb.js";
import { titleOf } from "./tmdb.js";
import { h } from "./ui.js";

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
  onNextEpisode?: () => void,
) {
  const prev = document.activeElement as HTMLElement | null;
  
  // Construct the correct embed URL for Movies or TV Shows
  const url =
    providerUrl(type, d.id, ep?.season, ep?.episode) ||
    (d?.id
      ? type === "tv"
        ? `https://vidsrc.sh/embed/tv?tmdb=${d.id}&season=${ep?.season || 1}&episode=${ep?.episode || 1}`
        : `https://vidsrc.sh/embed/movie/${d.id}`
      : "");

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
        return h(
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
      })()
    : h(
        "p",
        { class: "p-6" },
        "No playable video is available for this title.",
      );

  const closeBtn = h(
    "button",
    { type: "button", class: "rounded bg-accent px-3 py-1 text-white text-sm hover:opacity-90 transition" },
    "Close Player",
  );
  closeBtn.onclick = close;

  const headerActions = h("div", { class: "flex items-center gap-2" });
  
  // Render "Next Episode" button if it's a TV show and a next episode callback is provided
  if (type === "tv" && onNextEpisode) {
    const nextBtn = h(
      "button",
      {
        type: "button",
        class:
          "rounded bg-zinc-700 px-3 py-1 text-white hover:bg-zinc-600 transition text-sm font-medium",
      },
      "Next Episode",
    );
    nextBtn.onclick = () => {
      ov.remove();
      onNextEpisode();
    };
    headerActions.append(nextBtn);
  }
  
  headerActions.append(closeBtn);

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
      { class: "w-full max-w-4xl rounded-lg bg-white p-4 dark:bg-zinc-900" },
      h(
        "div",
        { class: "mb-3 flex items-center justify-between gap-2" },
        h(
          "h2",
          { class: "font-bold text-lg truncate" },
          titleOf(d) + (ep ? ` — S${ep.season}E${ep.episode}: ${ep.name}` : ""),
        ),
        headerActions,
      ),
      body,
    ),
  );

  document.body.append(ov);
  document.addEventListener("keydown", esc);
  closeBtn.focus();
}