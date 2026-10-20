import { Item, Page, api } from "../tmdb";
import { h, load, row, getList } from "../ui";
import { heroFor } from "./shared";

const rec = async () => {
  const l = getList().slice(-1)[0];
  if (l) {
    const r = await api<Page<Item>>(`/${l.type}/${l.id}/recommendations`);
    if (r.results.length) return r.results;
  }
  return (await api<Page<Item>>("/movie/popular")).results;
};

export function home() {
  load("#c1", async () => {
    const r = await api<Page<Item>>("/trending/all/week");
    const f = r.results.find((i) => i.backdrop_path) || r.results[0];
    return heroFor(f.media_type === "tv" ? "tv" : "movie", f.id, "Watch Now");
  });
  load("#c2", async () =>
    row((await api<Page<Item>>("/trending/all/week")).results, "movie"),
  );
  load("#c3", async () =>
    h(
      "div",
      {},
      h(
        "p",
        { class: "mb-2 text-sm text-zinc-500" },
        getList().length
          ? "Based on your most recently saved title"
          : "Popular right now",
      ),
      row(await rec(), "movie"),
    ),
  );
}
