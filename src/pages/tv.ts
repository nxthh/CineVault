import type { Item, Page } from "../tmdb.js";
import { api } from "../tmdb.js";
import { h, load, row } from "../ui.js";
import { heroFor } from "./shared.js";
import { library } from "./library.js";

export function tv() {
  load("#c1", async () => {
    const item = (await api<Page<Item>>("/tv/popular")).results[0];
    if (!item) throw new Error("TMDB returned no popular TV shows.");
    return heroFor("tv", item.id, "Watch Series");
  });
  const cols: [string, Record<string, string | number>][] = [
    ["Crime Dramas", { with_genres: 80 }],
    ["Sitcoms", { with_genres: 35, with_origin_country: "US" }],
    ["Sci-Fi & Fantasy", { with_genres: 10765 }],
    ["Miniseries", { with_type: 2 }],
  ];
  load("#c2", async () => {
    const rs = await Promise.all(
      cols.map(([, p]) =>
        api<Page<Item>>("/discover/tv", {
          ...p,
          sort_by: "vote_average.desc",
          "vote_count.gte": 500,
        }),
      ),
    );
    return h(
      "div",
      { class: "space-y-6" },
      ...cols.map(([n], i) => {
        const result = rs[i];
        if (!result) throw new Error("TV category results are missing.");
        return (
          h(
            "div",
            {},
            h("h3", { class: "mb-2 font-semibold" }, n),
            row(result.results, "tv"),
          )
        );
      }),
    );
  });
  library("tv");
}
