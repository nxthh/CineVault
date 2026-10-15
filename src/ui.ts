import { Item, Media, api, img, titleOf, yearOf, hasToken } from "./tmdb";
import {
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Moon,
  Search,
  Sun,
  createElement,
} from "lucide";
type K = Node | string | null | false;
const icon = (
  node: Parameters<typeof createElement>[0],
  className = "size-4",
) => createElement(node, { class: className, "aria-hidden": "true" });
export const h = (t: string, a: Record<string, string> = {}, ...c: K[]) => {
  const e = document.createElement(t);
  for (const [k, v] of Object.entries(a))
    k === "class" ? (e.className = v) : e.setAttribute(k, v);
  e.append(...c.filter((x): x is Node | string => !!x));
  return e;
};
export const $ = (s: string) => document.querySelector<HTMLElement>(s)!;
export const mount = (s: string, ...n: Node[]) => {
  $(s).replaceChildren(...n);
};
// storage
interface Saved {
  type: Media;
  id: number;
}
const KEY = "cv-list";
export const getList = (): Saved[] => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
};
export const inList = (t: Media, id: number) =>
  getList().some((x) => x.type === t && x.id === id);
const syncListButton = (
  btn: HTMLButtonElement,
  t: Media,
  id: number,
  title: string,
) => {
  const saved = inList(t, id);
  btn.replaceChildren(icon(saved ? BookmarkCheck : Bookmark));
  btn.setAttribute(
    "aria-label",
    `${saved ? "Remove from" : "Add to"} My List: ${title}`,
  );
  btn.setAttribute("aria-pressed", String(saved));
};
document.addEventListener("cv-list", () => {
  document
    .querySelectorAll<HTMLButtonElement>(
      ".movie-card [data-media-type][data-media-id]",
    )
    .forEach((btn) => {
      const type = btn.dataset.mediaType;
      if (type !== "movie" && type !== "tv") return;
      syncListButton(
        btn,
        type,
        Number(btn.dataset.mediaId),
        btn.dataset.title || "",
      );
    });
});
export function toggleList(t: Media, id: number) {
  let l = getList();
  l = inList(t, id)
    ? l.filter((x) => !(x.type === t && x.id === id))
    : [...l, { type: t, id }];
  localStorage.setItem(KEY, JSON.stringify(l));
  document.dispatchEvent(new Event("cv-list"));
  toast(inList(t, id) ? "Added to My List" : "Removed from My List");
}
export function toast(m: string) {
  const t = h(
    "div",
    {
      role: "status",
      class:
        "fixed bottom-4 left-1/2 -translate-x-1/2 z-50 rounded-lg bg-accent px-4 py-2 text-white shadow",
    },
    m,
  );
  document.body.append(t);
  setTimeout(() => t.remove(), 2200);
}
// ui bits
export const skeletons = (n = 6) =>
  h(
    "div",
    {
      class:
        "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6",
    },
    ...Array.from({ length: n }, () =>
      h("div", { class: "skeleton aspect-[2/3] rounded-2xl" }),
    ),
  );
export const errorBox = (e: unknown) =>
  h(
    "p",
    {
      role: "alert",
      class: "rounded-lg border border-red-500/40 p-4 text-red-500",
    },
    hasToken()
      ? `Couldn't load data: ${(e as Error).message}`
      : "No TMDB token configured. Copy .env.example to .env, add your token and run npm run build.",
  );
export async function load(sel: string, fn: () => Promise<Node>) {
  mount(sel, skeletons());
  try {
    mount(sel, await fn());
  } catch (e) {
    mount(sel, errorBox(e));
  }
}
export const href = (t: Media, id: number) => `details.html?type=${t}&id=${id}`;
export function card(i: Item, fallback: Media, rank?: number) {
  const t = (
    i.media_type === "tv" || i.media_type === "movie" ? i.media_type : fallback
  ) as Media;
  const src = img(i.poster_path);
  const poster = src
    ? h("img", {
        src,
        alt: `${titleOf(i)} poster`,
        loading: "lazy",
        class:
          "aspect-[2/3] w-full object-cover transition-transform duration-500 group-hover:scale-105",
      })
    : h(
        "div",
        {
          class:
            "flex aspect-[2/3] items-center justify-center bg-zinc-200 p-2 text-center text-sm dark:bg-zinc-800",
        },
        titleOf(i),
      );
  const btn = h("button", {
    type: "button",
    "data-media-type": t,
    "data-media-id": String(i.id),
    "data-title": titleOf(i),
    class:
      "absolute right-2 top-2 inline-flex size-9 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white shadow-lg backdrop-blur transition hover:scale-110 hover:bg-accent focus-visible:outline-white",
  }) as HTMLButtonElement;
  syncListButton(btn, t, i.id, titleOf(i));
  btn.onclick = () => {
    toggleList(t, i.id);
  };
  return h(
    "article",
    {
      class:
        "movie-card group relative min-w-0 overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-zinc-900/80 " +
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
    h("div", { class: "relative overflow-hidden bg-zinc-200 dark:bg-zinc-800" }, poster),
    btn,
    h(
      "div",
      { class: "p-3" },
      h(
        "a",
        {
          href: href(t, i.id),
          class: "block rounded-sm focus-visible:outline-offset-4",
        },
        h(
          "h3",
          { class: "truncate text-sm font-semibold sm:text-base" },
          titleOf(i),
        ),
      ),
      h(
        "p",
        { class: "mt-1 text-xs text-zinc-500 dark:text-zinc-400" },
        `${yearOf(i)} · ${t === "tv" ? "TV" : "Movie"} · ★ ${i.vote_average ? i.vote_average.toFixed(1) : "N/A"}`,
      ),
    ),
  );
}
export const pagination = (
  page: number,
  totalPages: number,
  onChange: (page: number) => void,
) => {
  const nav = h("nav", {
    class: "mt-8 flex flex-wrap items-center justify-center gap-2",
    "aria-label": "Pagination",
  });
  if (totalPages <= 1) return nav;
  const pageButton = (label: string, target: number, current = false) => {
    const b = h(
      "button",
      {
        type: "button",
        class:
          "inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 " +
          (current
            ? "border-accent bg-accent text-white"
            : "border-zinc-300 bg-white hover:border-accent hover:text-accent dark:border-white/15 dark:bg-zinc-900"),
        "aria-label": label === String(target) ? `Page ${target}` : label,
        ...(current ? { "aria-current": "page" } : {}),
      },
      label,
    );
    b.onclick = () => onChange(target);
    return b;
  };
  const previous = h(
    "button",
    {
      type: "button",
      class:
        "inline-flex min-h-10 items-center gap-1 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-medium transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/15 dark:bg-zinc-900",
      "aria-label": "Previous page",
      disabled: String(page <= 1),
    },
    icon(ChevronLeft),
    "Previous",
  ) as HTMLButtonElement;
  previous.disabled = page <= 1;
  previous.onclick = () => onChange(page - 1);
  nav.append(previous);
  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const end = Math.min(totalPages, start + 4);
  for (let n = start; n <= end; n++)
    nav.append(pageButton(String(n), n, n === page));
  const next = h(
    "button",
    {
      type: "button",
      class:
        "inline-flex min-h-10 items-center gap-1 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-medium transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/15 dark:bg-zinc-900",
      "aria-label": "Next page",
      disabled: String(page >= totalPages),
    },
    "Next",
    icon(ChevronRight),
  ) as HTMLButtonElement;
  next.disabled = page >= totalPages;
  next.onclick = () => onChange(page + 1);
  nav.append(next);
  return nav;
};
export const paginatedGrid = (
  items: Item[],
  fallback: Media,
  pageSize = 12,
  ranked = false,
) => {
  if (!items.length) return h("p", { class: "text-zinc-500" }, "Nothing to show.");
  const content = h("div");
  const controls = h("div");
  const totalPages = Math.ceil(items.length / pageSize);
  const render = (page: number) => {
    content.replaceChildren(
      h(
        "div",
        {
          class:
            "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6",
        },
        ...items
          .slice((page - 1) * pageSize, page * pageSize)
          .map((item, index) =>
            card(
              item,
              fallback,
              ranked ? (page - 1) * pageSize + index + 1 : undefined,
            ),
          ),
      ),
    );
    controls.replaceChildren(
      pagination(page, totalPages, (nextPage) => render(nextPage)),
    );
  };
  render(1);
  return h("div", {}, content, controls);
};
export const row = (items: Item[], fb: Media, ranked = false) =>
  paginatedGrid(items, fb, 12, ranked);
export const grid = (items: Item[], fb: Media) =>
  items.length
    ? h(
        "div",
        {
          class:
            "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 [&>*]:w-full",
        },
        ...items.map((i) => card(i, fb)),
      )
    : h("p", { class: "text-zinc-500" }, "No results found.");
// theme, nav, footer
export function initChrome() {
  const root = document.documentElement;
  const themeBtn = h("button", {
    type: "button",
    class:
      "inline-flex size-10 items-center justify-center rounded-full border border-zinc-300 bg-white transition-all duration-300 hover:rotate-12 hover:border-accent hover:text-accent dark:border-white/15 dark:bg-zinc-900",
  });
  const sync = () => {
    const d = root.classList.contains("dark");
    themeBtn.replaceChildren(icon(d ? Sun : Moon));
    themeBtn.setAttribute(
      "aria-label",
      d ? "Switch to light theme" : "Switch to dark theme",
    );
  };
  sync();
  themeBtn.onclick = () => {
    root.classList.toggle("dark");
    try {
      localStorage.setItem(
        "cv-theme",
        root.classList.contains("dark") ? "dark" : "light",
      );
    } catch {}
    sync();
  };
  const links = [
    ["index.html", "Home"],
    ["movies.html", "Movies"],
    ["tv-shows.html", "TV Shows"],
  ].map(([u, l]) =>
    h(
      "a",
      {
        href: u,
        class:
          "rounded-full px-3 py-2 font-medium text-zinc-600 transition-colors hover:bg-accent/10 hover:text-accent dark:text-zinc-300",
      },
      l,
    ),
  );
  const input = h("input", {
    type: "search",
    placeholder: "Search…",
    "aria-label": "Search movies and TV shows",
    class:
      "min-w-0 flex-1 rounded-full border border-zinc-300 bg-white py-2 pl-10 pr-4 text-sm shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 dark:border-white/15 dark:bg-zinc-900 sm:w-56",
  }) as HTMLInputElement;
  const dd = h("ul", {
    class:
      "absolute right-0 top-full z-50 mt-2 hidden max-h-80 w-full overflow-auto rounded-2xl border border-zinc-200 bg-white text-sm shadow-xl dark:border-white/10 dark:bg-zinc-900 sm:w-72",
    role: "listbox",
    id: "nav-search-results",
  });
  input.setAttribute("aria-controls", "nav-search-results");
  input.setAttribute("aria-autocomplete", "list");
  input.setAttribute("aria-expanded", "false");
  let requestId = 0;
  let shownQuery = "";
  const findResults = async (query: string) => {
    const r = await api<{ results: Item[] }>("/search/multi", { query });
    return r.results
      .filter(
        (item): item is Omit<Item, "media_type"> & { media_type: Media } =>
          item.media_type === "movie" || item.media_type === "tv",
      )
      .slice(0, 8);
  };
  const renderResults = (
    query: string,
    results: (Omit<Item, "media_type"> & { media_type: Media })[],
  ) => {
    shownQuery = query;
    dd.replaceChildren(
      ...(results.length
        ? results.map((item) =>
            h(
              "li",
              { role: "presentation" },
              h(
                "a",
                {
                  href: href(item.media_type, item.id),
                  role: "option",
                  class:
                    "block px-3 py-2 hover:bg-accent/20 focus:bg-accent/20",
                },
                `${titleOf(item)} (${yearOf(item)})`,
              ),
            ),
          )
        : [
            h(
              "li",
              { class: "px-3 py-2 text-zinc-500" },
              `No results for "${query}"`,
            ),
          ]),
    );
    dd.classList.remove("hidden");
    input.setAttribute("aria-expanded", "true");
  };
  const hideResults = () => {
    requestId++;
    dd.classList.add("hidden");
    input.setAttribute("aria-expanded", "false");
  };
  let tm = 0;
  input.oninput = () => {
    clearTimeout(tm);
    const q = input.value.trim();
    if (!q) {
      requestId++;
      hideResults();
      return;
    }
    const request = ++requestId;
    tm = window.setTimeout(async () => {
      try {
        const results = await findResults(q);
        if (request === requestId && input.value.trim() === q)
          renderResults(q, results);
      } catch (e) {
        if (request !== requestId) return;
        dd.replaceChildren(errorBox(e));
        dd.classList.remove("hidden");
        input.setAttribute("aria-expanded", "true");
      }
    }, 350);
  };
  input.onkeydown = async (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      (dd.querySelector("a") as HTMLElement | null)?.focus();
    }
    if (e.key === "Escape") hideResults();
    if (e.key === "Enter") {
      e.preventDefault();
      const query = input.value.trim();
      if (!query) return;
      const current = dd.querySelector<HTMLAnchorElement>("a");
      if (shownQuery === query && current) {
        window.location.assign(current.href);
        return;
      }
      const request = ++requestId;
      try {
        const results = await findResults(query);
        if (request !== requestId || input.value.trim() !== query) return;
        renderResults(query, results);
        const first = dd.querySelector<HTMLAnchorElement>("a");
        if (first) window.location.assign(first.href);
      } catch (error) {
        if (request !== requestId) return;
        dd.replaceChildren(errorBox(error));
        dd.classList.remove("hidden");
        input.setAttribute("aria-expanded", "true");
      }
    }
  };
  dd.onkeydown = (e) => {
    const a = document.activeElement as HTMLElement;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      (
        a
          .closest("li")
          ?.nextElementSibling?.querySelector("a") as HTMLElement | null
      )?.focus();
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      (
        (a.closest("li")?.previousElementSibling?.querySelector("a") ||
          input) as HTMLElement
      ).focus();
    }
    if (e.key === "Escape") {
      hideResults();
      input.focus();
    }
  };
  mount(
    "#nav",
    h(
      "nav",
      {
        class:
          "sticky top-0 z-40 border-b border-zinc-200/70 bg-zinc-50/85 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/80",
        "aria-label": "Main",
      },
      h(
        "div",
        {
          class:
            "mx-auto flex max-w-7xl flex-wrap items-center gap-x-2 gap-y-2 px-4 py-3 text-sm sm:gap-x-4",
        },
        h(
          "a",
          {
            href: "index.html",
            class:
              "mr-auto inline-flex items-center gap-2 text-lg font-black tracking-tight sm:mr-0",
          },
          h(
            "span",
            {
              class:
                "inline-flex size-9 items-center justify-center rounded-xl bg-accent text-white shadow-lg shadow-accent/25",
            },
            icon(Clapperboard),
          ),
          "Cine",
          h("span", { class: "text-accent" }, "Vault"),
        ),
        ...links,
        h(
          "a",
          {
            href: "my-list.html",
            class:
              "rounded-full px-3 py-2 font-medium text-zinc-600 transition-colors hover:bg-accent/10 hover:text-accent dark:text-zinc-300",
          },
          icon(Bookmark, "mr-1 inline size-4 align-[-3px]"),
          "My List",
        ),
        h(
          "div",
          {
            class:
              "relative order-3 flex w-full items-center gap-2 sm:order-none sm:ml-auto sm:w-auto",
          },
          icon(Search, "absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400"),
          input,
          dd,
          themeBtn,
        ),
      ),
    ),
  );
  mount(
    "#footer",
    h(
      "div",
      {
        class:
          "mt-16 border-t border-zinc-200/70 px-4 py-10 text-center text-sm text-zinc-500 dark:border-white/10",
      },
      h(
        "p",
        {},
        "CineVault — a digital vault for discovering movies and series.",
      ),
      h(
        "p",
        { class: "mt-2" },
        "This product uses the TMDB API but is not endorsed or certified by TMDB.",
      ),
      h(
        "p",
        { class: "mt-2 space-x-3" },
        h("a", { href: "index.html" }, "Home"),
        h("a", { href: "movies.html" }, "Movies"),
        h("a", { href: "tv-shows.html" }, "TV Shows"),
        h("a", { href: "my-list.html" }, "My List"),
      ),
    ),
  );
}
