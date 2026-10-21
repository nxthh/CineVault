import type { Item, Media } from "../tmdb.js";
import { h, icon } from "./dom.js";
import { card } from "./cards.js";

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
    const button = h(
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
    button.onclick = () => onChange(target);
    return button;
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
    icon("chevron-left"),
    "Previous",
  ) as HTMLButtonElement;
  previous.disabled = page <= 1;
  previous.onclick = () => onChange(page - 1);
  nav.append(previous);
  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const end = Math.min(totalPages, start + 4);
  for (let number = start; number <= end; number++)
    nav.append(pageButton(String(number), number, number === page));
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
    icon("chevron-right"),
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
  if (!items.length)
    return h("p", { class: "text-zinc-500" }, "Nothing to show.");
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

export const row = (items: Item[], fallback: Media, ranked = false) =>
  paginatedGrid(items, fallback, 12, ranked);
