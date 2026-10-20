import { Item, Media, img, titleOf, yearOf } from "../tmdb";
import { h, icon } from "./dom";
import { syncListButton, toggleList } from "./list";

export const href = (type: Media, id: number) =>
  `details.html?type=${type}&id=${id}`;

export function card(item: Item, fallback: Media, rank?: number) {
  const type =
    item.media_type === "tv" || item.media_type === "movie"
      ? item.media_type
      : fallback;
  const source = img(item.poster_path);
  const poster = source
    ? h("img", {
        src: source,
        alt: `${titleOf(item)} poster`,
        loading: "lazy",
        class:
          "aspect-[2/3] w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04]",
      })
    : h(
        "div",
        {
          class:
            "flex aspect-[2/3] items-center justify-center bg-zinc-200 p-2 text-center text-sm dark:bg-zinc-800",
        },
        titleOf(item),
      );
  const button = h("button", {
    type: "button",
    "data-media-type": type,
    "data-media-id": String(item.id),
    "data-title": titleOf(item),
    class:
      "absolute right-2 top-2 inline-flex size-9 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur transition hover:scale-110 hover:bg-accent focus-visible:outline-white",
  }) as HTMLButtonElement;
  syncListButton(button, type, item.id, titleOf(item));
  button.onclick = () => toggleList(type, item.id);

  return h(
    "article",
    {
      class:
        "movie-card group relative min-w-0 overflow-hidden rounded-2xl border border-zinc-200/80 bg-white  transition-all duration-300 ease-out hover:-translate-y-1  dark:border-white/10 dark:bg-zinc-900/80 " +
        (rank ? "ranked-card" : ""),
    },
    rank
      ? h(
          "span",
          {
            class: "rank-badge",
            "aria-hidden": "true",
          },
          String(rank),
        )
      : null,
    h(
      "a",
      {
        href: href(type, item.id),
        "aria-label": `View ${titleOf(item)} details`,
        class: "block rounded-t-2xl focus-visible:outline-offset-[-2px]",
      },
      h(
        "div",
        { class: "relative overflow-hidden bg-zinc-200 dark:bg-zinc-800" },
        poster,
      ),
    ),
    button,
    h(
      "div",
      { class: "p-3" },
      h(
        "a",
        {
          href: href(type, item.id),
          class: "block rounded-sm focus-visible:outline-offset-4",
        },
        h(
          "h3",
          { class: "truncate text-sm font-semibold sm:text-base" },
          titleOf(item),
        ),
      ),
      h(
        "p",
        { class: "mt-1 text-xs text-zinc-500 dark:text-zinc-400" },
        `${yearOf(item)} · ${type === "tv" ? "TV" : "Movie"} · ★ ${item.vote_average ? item.vote_average.toFixed(1) : "N/A"}`,
      ),
    ),
  );
}

export const grid = (items: Item[], fallback: Media) =>
  items.length
    ? h(
        "div",
        {
          class:
            "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 [&>*]:w-full",
        },
        ...items.map((item) => card(item, fallback)),
      )
    : h("p", { class: "text-zinc-500" }, "No results found.");
