import {
  Item,
  Page,
  api,
  detail,
  img,
  titleOf,
  yearOf,
  hasToken,
} from "../tmdb";
import {
  $,
  h,
  mount,
  load,
  row,
  href,
  getList,
  toggleList,
  errorBox,
  skeletons,
} from "../ui";
import { openPlayer } from "../player";

export function mylist() {
  const render = async () => {
    const l = getList();
    let tab = "all";
    const counts = (t: string) => l.filter((x) => x.type === t).length;
    mount("#c1");
    const col = $("#c2");
    const body = h("div");
    const draw = async () => {
      const sub = l.filter((x) => tab === "all" || x.type === tab);
      if (!sub.length) {
        body.replaceChildren(
          h(
            "div",
            { class: "py-8 text-center" },
            h("p", {}, "Nothing here yet."),
            h(
              "a",
              {
                href: "index.html",
                class:
                  "mt-4 inline-flex rounded-xl bg-accent px-4 py-2 font-semibold text-white transition-colors hover:bg-violet-500 focus-visible:outline-offset-2",
              },
              "Discover something to watch",
            ),
          ),
        );
        return;
      }
      body.replaceChildren(skeletons());
      try {
        const ds = await Promise.all(sub.map((x) => detail(x.type, x.id)));
        body.replaceChildren(
          h(
            "div",
            { class: "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5" },
            ...ds.map((d, i) => {
              const t = sub[i].type;
              const rm = h(
                "button",
                {
                  type: "button",
                  class:
                    "rounded-lg border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-600 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-500 dark:border-white/10 dark:text-zinc-300 dark:hover:text-red-400",
                  "aria-label": `Remove ${titleOf(d)} from My Collection`,
                },
                "Remove",
              );
              rm.onclick = () => {
                toggleList(t, d.id);
                render();
              };
              const w = h(
                "button",
                {
                  type: "button",
                  class:
                    "flex-1 rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-white hover:bg-violet-500 focus-visible:outline-offset-2",
                },
                "Watch Now",
              );
              w.onclick = () => openPlayer(d, t);
              return h(
                "article",
                {
                  class:
                    "movie-card group min-w-0 overflow-hidden rounded-2xl border border-zinc-200/80 bg-white transition-all duration-300 ease-out hover:-translate-y-1 dark:border-white/10 dark:bg-zinc-900/80",
                },
                h(
                  "a",
                  {
                    href: href(t, d.id),
                    "aria-label": `View ${titleOf(d)} details`,
                    class: "relative block overflow-hidden",
                  },
                  d.poster_path
                    ? h("img", {
                        src: img(d.poster_path),
                        alt: `${titleOf(d)} poster`,
                        class:
                          "aspect-[2/3] w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.06]",
                        loading: "lazy",
                      })
                    : h(
                        "div",
                        {
                          class:
                            "flex aspect-[2/3] items-center justify-center bg-zinc-200 p-3 text-center text-sm font-medium dark:bg-zinc-800",
                        },
                        titleOf(d),
                      ),
                  h(
                    "span",
                    {
                      class:
                        "absolute left-3 top-3 rounded-full border border-white/20 bg-black/65 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur",
                    },
                    t === "tv" ? "TV Series" : "Movie",
                  ),
                  h(
                    "span",
                    {
                      class:
                        "absolute bottom-3 right-3 rounded-full border border-white/20 bg-black/65 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur",
                    },
                    `★ ${d.vote_average ? d.vote_average.toFixed(1) : "N/A"}`,
                  ),
                ),
                h(
                  "div",
                  { class: "p-3" },
                  h(
                    "h3",
                    {
                      class: "truncate text-sm font-semibold sm:text-base",
                      title: titleOf(d),
                    },
                    titleOf(d),
                  ),
                  h(
                    "p",
                    {
                      class: "mt-1 text-xs text-zinc-500 dark:text-zinc-400",
                    },
                    `${yearOf(d)} · ${t === "tv" ? "TV" : "Movie"}`,
                  ),
                  h("div", { class: "mt-3 flex items-center gap-2" }, w, rm),
                ),
              );
            }),
          ),
        );
      } catch (e) {
        body.replaceChildren(errorBox(e));
      }
    };
    const tabs = h(
      "div",
      { role: "tablist", class: "mb-4 flex gap-2" },
      ...(
        [
          ["all", "All"],
          ["movie", "Movies"],
          ["tv", "TV Shows"],
        ] as [string, string][]
      ).map(([k, n]) => {
        const b = h(
          "button",
          {
            type: "button",
            role: "tab",
            "aria-selected": String(k === tab),
            class: "rounded-full border border-zinc-500/40 px-3 py-1 text-sm",
          },
          n,
        );
        b.onclick = () => {
          tab = k;
          tabs
            .querySelectorAll("button")
            .forEach((x) => x.setAttribute("aria-selected", String(x === b)));
          draw();
        };
        return b;
      }),
    );
    col.replaceChildren(tabs, body);
    draw();
  };
  if (!hasToken() && getList().length) mount("#c2", errorBox(new Error("")));
  else render();
  load("#c3", async () =>
    row((await api<Page<Item>>("/trending/all/week")).results, "movie"),
  );
}
