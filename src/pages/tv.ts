import { Item, Page, api } from "../tmdb";
import { h, load, row } from "../ui";
import { heroFor } from "./shared";
import { library } from "./library";

export function tv() {
  load("#c1", async () =>
    heroFor(
      "tv",
      (await api<Page<Item>>("/tv/popular")).results[0].id,
      "Watch Series",
    ),
  );
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
      ...cols.map(([n], i) =>
        h(
          "div",
          {},
          h("h3", { class: "mb-2 font-semibold" }, n),
          row(rs[i].results, "tv"),
        ),
      ),
    );
  });
  library("tv");
}
