import type { Episode, Media } from "../tmdb.js";
import { api, detail, img, titleOf, yearOf } from "../tmdb.js";
import { h, mount, load, errorBox, row, skeletons } from "../ui.js";
import { openPlayer } from "../player.js";
import { hero } from "./shared.js";

export function details() {
  const p = new URLSearchParams(location.search);
  const t = (p.get("type") === "tv" ? "tv" : "movie") as Media;
  const id = +(p.get("id") || 0);
  if (!id) {
    mount("#c1", errorBox(new Error("Missing title id.")));
    return;
  }
  const cached = detail(t, id);
  load("#c1", async () => {
    const d = await cached;
    document.title = `${titleOf(d)} (${yearOf(d)}) — CineVault`;
    document
      .querySelector("meta[name=description]")
      ?.setAttribute("content", d.overview.slice(0, 155));
    document
      .querySelector('meta[property="og:title"]')
      ?.setAttribute("content", document.title);
    return hero(d, t, "Watch Now");
  });
  load("#c2", async () => {
    const d = await cached;
    const c = d.credits;
    const people = (c?.cast || []).slice(0, 12).map((x) =>
      h(
        "div",
        { class: "w-28 shrink-0 text-xs" },
        x.profile_path
          ? h("img", {
              src: img(x.profile_path, "w185"),
              alt: x.name,
              loading: "lazy",
              class: "aspect-[2/3] rounded object-cover",
            })
          : h(
              "div",
              {
                class:
                  "flex aspect-[2/3] items-center justify-center rounded bg-zinc-300 dark:bg-zinc-800",
              },
              "No photo",
            ),
        h("p", { class: "mt-1 font-semibold" }, x.name),
        h("p", { class: "text-zinc-500" }, x.character),
      ),
    );
    const wrap = h("div", {});
    if (t === "movie") {
      const dir = (c?.crew || [])
        .filter((x) => x.job === "Director")
        .map((x) => x.name)
        .join(", ");
      const w = (c?.crew || [])
        .filter((x) => ["Writer", "Screenplay"].includes(x.job))
        .map((x) => x.name)
        .join(", ");
      wrap.append(
        h(
          "p",
          { class: "mb-3 text-sm" },
          `Director: ${dir || "Unknown"}${w ? ` · Writing: ${w}` : ""}`,
        ),
      );
    } else {
      // TV Show Season & Episode Picker Section in Details
      const sn = h("select", {
        "aria-label": "Season",
        class: "cv-select mb-4",
      }) as HTMLSelectElement;

      const epsList = h("div", { class: "space-y-3 mb-6" });

      const loadEps = async () => {
        epsList.replaceChildren(skeletons(2));
        try {
          const r = await api<{ episodes: Episode[] }>(
            `/tv/${d.id}/season/${sn.value}`,
          );
          epsList.replaceChildren(
            ...(r.episodes.length
              ? r.episodes.map((e, index, allEpisodes) => {
                  const b = h(
                    "button",
                    {
                      type: "button",
                      class: "rounded bg-accent px-3 py-1 text-sm text-white",
                    },
                    "Play",
                  );
                  b.onclick = () => {
                    const playEp = (currIndex: number) => {
                      const curr = allEpisodes[currIndex];
                      const next = allEpisodes[currIndex + 1];
                      if (!curr) return;
                      openPlayer(
                        d,
                        "tv",
                        {
                          season: +sn.value,
                          episode: curr.episode_number,
                          name: curr.name,
                        },
                        next ? () => playEp(currIndex + 1) : undefined,
                      );
                    };
                    playEp(index);
                  };
                  return h(
                    "article",
                    {
                      class:
                        "flex gap-3 rounded-lg border border-zinc-500/30 p-3",
                    },
                    e.still_path
                      ? h("img", {
                          src: img(e.still_path, "w300"),
                          alt: `Still from ${e.name}`,
                          loading: "lazy",
                          class: "hidden w-40 rounded sm:block",
                        })
                      : h(
                          "div",
                          {
                            class:
                              "hidden w-40 items-center justify-center rounded bg-zinc-300 text-xs dark:bg-zinc-800 sm:flex",
                          },
                          "No image",
                        ),
                    h(
                      "div",
                      { class: "flex-1" },
                      h(
                        "h4",
                        { class: "font-semibold" },
                        `${sn.value === "0" ? "Special" : "E" + e.episode_number}: ${e.name || "Untitled"}`,
                      ),
                      h(
                        "p",
                        { class: "text-xs text-zinc-500" },
                        e.air_date || "Air date unknown",
                      ),
                      h(
                        "p",
                        { class: "mt-1 text-sm" },
                        e.overview || "No overview available.",
                      ),
                    ),
                    b,
                  );
                })
              : [h("p", {}, "No episodes listed.")]),
          );
        } catch (err) {
          epsList.replaceChildren(errorBox(err));
        }
      };

      sn.replaceChildren(
        ...(d.seasons || []).map((s) =>
          h(
            "option",
            { value: String(s.season_number) },
            s.season_number === 0 ? "Specials" : s.name,
          ),
        ),
      );
      const firstSeason = sn.options.item(0);
      if (firstSeason)
        sn.value = d.seasons!.find((s) => s.season_number === 1)
          ? "1"
          : firstSeason.value;
      sn.onchange = loadEps;
      loadEps();

      wrap.append(
        h(
          "p",
          { class: "mb-3 text-sm" },
          `${d.number_of_seasons ?? "?"} seasons · ${d.status || ""}`,
        ),
        h("h3", { class: "mb-2 text-lg font-bold" }, "Episodes"),
        sn,
        epsList,
      );
    }
    wrap.append(
      h("h3", { class: "mb-2 text-lg font-bold" }, "Cast"),
      people.length
        ? h("div", { class: "scroller flex gap-3 overflow-x-auto" }, ...people)
        : h("p", {}, "No cast information available."),
    );
    return wrap;
  });
  load("#c3", async () =>
    row((await cached).recommendations?.results || [], t),
  );
}
