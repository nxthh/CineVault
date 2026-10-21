import type { Detail, Media } from "../tmdb.js";
import { detail, img, titleOf, yearOf } from "../tmdb.js";
import { h, toggleList, inList, href } from "../ui.js";
import { openPlayer } from "../player.js";

const btn = (label: string, fn: () => void, primary = false) => {
  const b = h(
    "button",
    {
      type: "button",
      class: `rounded-lg px-4 py-2 text-sm font-semibold ${primary ? "bg-accent text-white" : "border border-white/60 text-white"}`,
    },
    label,
  );
  b.onclick = fn;
  return b;
};

const link = (label: string, u: string) =>
  h(
    "a",
    {
      href: u,
      class:
        "rounded-lg border border-white/60 px-4 py-2 text-sm font-semibold text-white",
    },
    label,
  );

const meta = (d: Detail, t: Media) =>
  [
    yearOf(d),
    `★ ${d.vote_average ? d.vote_average.toFixed(1) : "N/A"}`,
    d.genres.map((g) => g.name).join(", "),
    t === "movie"
      ? d.runtime
        ? `${d.runtime} min`
        : ""
      : d.number_of_seasons
        ? `${d.number_of_seasons} seasons`
        : "",
    d.status || "",
  ]
    .filter(Boolean)
    .join(" · ");

export function hero(
  d: Detail,
  t: Media,
  watchLabel: string,
  withList = false,
) {
  const bg = img(d.backdrop_path, "w1280");
  return h(
    "div",
    {
      class:
        "relative flex min-h-[26rem] items-end bg-zinc-900 bg-cover bg-center",
      style: bg ? `background-image:url(${bg})` : "",
    },
    h("a", {
      href: href(t, d.id),
      "aria-label": `View ${titleOf(d)} details`,
      class:
        "absolute inset-0 z-10 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent",
    }),
    h("div", {
      class:
        "absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent",
    }),
    h(
      "div",
      {
        class:
          "pointer-events-none relative z-20 mx-auto flex w-full max-w-7xl gap-6 px-4 py-8 text-white",
      },
      d.poster_path
        ? h("img", {
            src: img(d.poster_path),
            alt: `${titleOf(d)} poster`,
            class: "hidden w-40 rounded-lg md:block",
          })
        : null,
      h(
        "div",
        { class: "max-w-2xl" },
        h("p", { class: "text-2xl font-black sm:text-4xl" }, titleOf(d)),
        h("p", { class: "mt-2 text-sm text-zinc-300" }, meta(d, t)),
        h(
          "p",
          { class: "mt-3 line-clamp-4 text-sm sm:text-base" },
          d.overview || "No overview available.",
        ),
        h(
          "div",
          { class: "pointer-events-auto mt-4 flex flex-wrap gap-2" },
          btn(watchLabel, () => openPlayer(d, t), true),
          withList ? btn("", () => {}) : link("More Info", href(t, d.id)),
          (() => {
            const b = btn("", () => {
              toggleList(t, d.id);
              s();
            });
            const s = () => {
              b.textContent = inList(t, d.id)
                ? "✓ In My List"
                : "+ Add to My List";
            };
            s();
            return b;
          })(),
        ),
      ),
    ),
  );
}

export const heroFor = async (t: Media, id: number, label: string) =>
  hero(await detail(t, id), t, label);
