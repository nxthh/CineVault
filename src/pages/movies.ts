import type { Item, Page, Media } from "../tmdb.js";
import { api } from "../tmdb.js";
import { load, row } from "../ui.js";
import { heroFor } from "./shared.js";
import { library } from "./library.js";

export function movies() {
  load("#c1", async () => {
    const item = (await api<Page<Item>>("/movie/popular")).results[0];
    if (!item) throw new Error("TMDB returned no popular movies.");
    return heroFor("movie", item.id, "Watch Now");
  });
  load("#c2", async () =>
    row(
      (await api<Page<Item>>("/movie/top_rated")).results.slice(0, 10),
      "movie",
      true,
    ),
  );
  library("movie");
}
