import { Item, Page, Media, api } from "../tmdb";
import { load, row } from "../ui";
import { heroFor } from "./shared";
import { library } from "./library";

export function movies() {
  load("#c1", async () =>
    heroFor(
      "movie",
      (await api<Page<Item>>("/movie/popular")).results[0].id,
      "Watch Now",
    ),
  );
  load("#c2", async () =>
    row(
      (await api<Page<Item>>("/movie/top_rated")).results.slice(0, 10),
      "movie",
      true,
    ),
  );
  library("movie");
}
