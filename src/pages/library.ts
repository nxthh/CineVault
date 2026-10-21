import type { Item, Page, Media } from "../tmdb.js";
import { api, titleOf, yearOf } from "../tmdb.js";
import { $, h, errorBox, grid, pagination, skeletons } from "../ui.js";

export async function library(type: Media) {
  const root = $("#c3");
  const state = {
    q: "",
    genre: "",
    year: "",
    rating: "0",
    sort: "popularity.desc",
    page: 1,
  };
  let items: Item[] = [];
  let requestId = 0;
  const sel = (label: string, opts: [string, string][]) => {
    const s = h(
      "select",
      {
        "aria-label": label,
        class: "cv-select",
      },
      ...opts.map(([v, t]) => h("option", { value: v }, t)),
    ) as HTMLSelectElement;
    return s;
  };
  const q = h("input", {
    type: "search",
    "aria-label": "Search library",
    placeholder: `Search ${type === "movie" ? "movies" : "TV shows"}…`,
    class: "rounded-xl border border-zinc-500/40 bg-transparent px-2 py-1",
  }) as HTMLInputElement;
  const g = sel("Genre", [["", "All genres"]]),
    y = sel("Year", [
      ["", "Any year"],
      ...Array.from({ length: 30 }, (_, i) => {
        const v = String(new Date().getFullYear() - i);
        return [v, v] as [string, string];
      }),
    ]);
  const r = sel("Minimum rating", [
    ["0", "Any rating"],
    ["6", "6+"],
    ["7", "7+"],
    ["8", "8+"],
  ]);
  const s = sel("Sort", [
    ["popularity.desc", "Popular"],
    ["title", "Title"],
    ["date", "Release date"],
    ["rating", "Rating"],
  ]);
  const clear = h(
    "button",
    { type: "button", class: "rounded-xl border border-zinc-500/40 px-2 py-1" },
    "Clear filters",
  );
  const out = h("div"),
    pager = h("div");
  root.replaceChildren(
    h(
      "div",
      {
        class:
          "mb-5 flex flex-wrap gap-2 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-zinc-900/60",
      },
      q,
      g,
      y,
      r,
      s,
      clear,
    ),
    out,
    pager,
  );
  try {
    (
      await api<{ genres: { id: number; name: string }[] }>(
        `/genre/${type}/list`,
      )
    ).genres.forEach((x) =>
      g.append(h("option", { value: String(x.id) }, x.name)),
    );
  } catch (e) {
    root.prepend(errorBox(e));
  }
  const view = () => {
    let l = [...items];
    l = l.filter(
      (i) =>
        (!state.year || yearOf(i) === state.year) &&
        (!state.genre || i.genre_ids?.includes(+state.genre)) &&
        i.vote_average >= +state.rating,
    );
    if (state.sort === "title")
      l.sort((a, b) => titleOf(a).localeCompare(titleOf(b)));
    if (state.sort === "date")
      l.sort((a, b) =>
        (b.release_date || b.first_air_date || "").localeCompare(
          a.release_date || a.first_air_date || "",
        ),
      );
    if (state.sort === "rating")
      l.sort((a, b) => b.vote_average - a.vote_average);
    out.replaceChildren(grid(l, type));
  };
  const fetchPage = async (reset: boolean) => {
    if (reset) {
      state.page = 1;
      items = [];
    }
    const request = ++requestId;
    out.replaceChildren(skeletons());
    try {
      let p: Page<Item>;
      if (state.q)
        p = await api<Page<Item>>(`/search/${type}`, {
          query: state.q,
          page: state.page,
        });
      else {
        const sm: Record<string, string> = {
          title: type === "movie" ? "original_title.asc" : "original_name.asc",
          date:
            type === "movie"
              ? "primary_release_date.desc"
              : "first_air_date.desc",
          rating: "vote_average.desc",
          "popularity.desc": "popularity.desc",
        };
        const sortBy = sm[state.sort];
        if (!sortBy) throw new Error("Invalid sort selection.");
        const o: Record<string, string | number> = {
          page: state.page,
          sort_by: sortBy,
          "vote_average.gte": state.rating,
          "vote_count.gte": state.sort === "rating" ? 200 : 0,
        };
        if (state.genre) o.with_genres = state.genre;
        if (state.year)
          o[type === "movie" ? "primary_release_year" : "first_air_date_year"] =
            state.year;
        p = await api<Page<Item>>(`/discover/${type}`, o);
      }
      if (request !== requestId) return;
      items = p.results;
      view();
      pager.replaceChildren(
        pagination(state.page, Math.min(p.total_pages, 500), (next) => {
          state.page = next;
          fetchPage(false);
        }),
      );
    } catch (e) {
      if (request === requestId) {
        out.replaceChildren(errorBox(e));
        pager.replaceChildren();
      }
    }
  };
  let tm = 0;
  q.oninput = () => {
    clearTimeout(tm);
    tm = window.setTimeout(() => {
      state.q = q.value.trim();
      fetchPage(true);
    }, 400);
  };
  g.onchange = () => {
    state.genre = g.value;
    fetchPage(true);
  };
  y.onchange = () => {
    state.year = y.value;
    fetchPage(true);
  };
  r.onchange = () => {
    state.rating = r.value;
    fetchPage(true);
  };
  s.onchange = () => {
    state.sort = s.value;
    state.q ? view() : fetchPage(true);
  };
  clear.onclick = () => {
    q.value = "";
    g.value = y.value = "";
    r.value = "0";
    s.value = "popularity.desc";
    Object.assign(state, {
      q: "",
      genre: "",
      year: "",
      rating: "0",
      sort: "popularity.desc",
    });
    fetchPage(true);
  };
  fetchPage(true);
}
