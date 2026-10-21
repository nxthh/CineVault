import type { Item, Media } from "../tmdb.js";
import { api, titleOf, yearOf } from "../tmdb.js";
import { errorBox } from "./feedback.js";
import { h, icon, mount } from "./dom.js";
import { href } from "./cards.js";

export function initChrome() {
  const root = document.documentElement;
  const themeButton = h("button", {
    type: "button",
    class:
      "inline-flex size-10 items-center justify-center rounded-full border border-zinc-300 bg-white transition-all duration-300 hover:rotate-12 hover:border-accent hover:text-accent dark:border-white/15 dark:bg-zinc-900",
  });
  const syncThemeButton = () => {
    const isDark = root.classList.contains("dark");
    themeButton.replaceChildren(icon(isDark ? "sun" : "moon"));
    themeButton.setAttribute(
      "aria-label",
      isDark ? "Switch to light theme" : "Switch to dark theme",
    );
  };
  syncThemeButton();
  themeButton.onclick = () => {
    root.classList.toggle("dark");
    try {
      localStorage.setItem(
        "cv-theme",
        root.classList.contains("dark") ? "dark" : "light",
      );
    } catch {}
    syncThemeButton();
  };

  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const navItems: [string, string][] = [
    ["index.html", "Home"],
    ["movies.html", "Movies"],
    ["tv-shows.html", "TV Shows"],
  ];
  const links = navItems.map(([url, label]) =>
    h(
      "a",
      {
        href: url,
        class:
          "rounded-full px-3 py-2 font-semibold text-zinc-600 transition-colors hover:bg-accent/10 hover:text-accent dark:text-zinc-300" +
          (currentPage === url ? " nav-link-current" : ""),
        ...(currentPage === url ? { "aria-current": "page" } : {}),
      },
      label,
    ),
  );
  const input = h("input", {
    type: "search",
    placeholder: "Search…",
    "aria-label": "Search movies and TV shows",
    class:
      "min-w-0 flex-1 rounded-full border border-zinc-300 bg-white py-2 pl-10 pr-4 text-sm outline-none transition focus:border-accent dark:border-white/15 dark:bg-zinc-900 sm:w-56",
  }) as HTMLInputElement;
  const dropdown = h("ul", {
    class:
      "absolute right-0 top-full z-50 mt-2 hidden max-h-80 w-full overflow-auto rounded-2xl border border-zinc-200 bg-white text-sm dark:border-white/10 dark:bg-zinc-900 sm:w-72",
    role: "listbox",
    id: "nav-search-results",
  });
  input.setAttribute("aria-controls", "nav-search-results");
  input.setAttribute("aria-autocomplete", "list");
  input.setAttribute("aria-expanded", "false");
  let requestId = 0;
  let shownQuery = "";
  const findResults = async (query: string) => {
    const response = await api<{ results: Item[] }>("/search/multi", { query });
    return response.results
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
    dropdown.replaceChildren(
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
    dropdown.classList.remove("hidden");
    input.setAttribute("aria-expanded", "true");
  };
  const hideResults = () => {
    requestId++;
    dropdown.classList.add("hidden");
    input.setAttribute("aria-expanded", "false");
  };
  let timeout = 0;
  input.oninput = () => {
    clearTimeout(timeout);
    const query = input.value.trim();
    if (!query) {
      requestId++;
      hideResults();
      return;
    }
    const request = ++requestId;
    timeout = window.setTimeout(async () => {
      try {
        const results = await findResults(query);
        if (request === requestId && input.value.trim() === query)
          renderResults(query, results);
      } catch (error) {
        if (request !== requestId) return;
        dropdown.replaceChildren(errorBox(error));
        dropdown.classList.remove("hidden");
        input.setAttribute("aria-expanded", "true");
      }
    }, 350);
  };
  input.onkeydown = async (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      (dropdown.querySelector("a") as HTMLElement | null)?.focus();
    }
    if (event.key === "Escape") hideResults();
    if (event.key === "Enter") {
      event.preventDefault();
      const query = input.value.trim();
      if (!query) return;
      const current = dropdown.querySelector<HTMLAnchorElement>("a");
      if (shownQuery === query && current) {
        window.location.assign(current.href);
        return;
      }
      const request = ++requestId;
      try {
        const results = await findResults(query);
        if (request !== requestId || input.value.trim() !== query) return;
        renderResults(query, results);
        const first = dropdown.querySelector<HTMLAnchorElement>("a");
        if (first) window.location.assign(first.href);
      } catch (error) {
        if (request !== requestId) return;
        dropdown.replaceChildren(errorBox(error));
        dropdown.classList.remove("hidden");
        input.setAttribute("aria-expanded", "true");
      }
    }
  };
  dropdown.onkeydown = (event) => {
    const active = document.activeElement as HTMLElement;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      (
        active
          .closest("li")
          ?.nextElementSibling?.querySelector("a") as HTMLElement | null
      )?.focus();
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      (
        (active.closest("li")?.previousElementSibling?.querySelector("a") ||
          input) as HTMLElement
      ).focus();
    }
    if (event.key === "Escape") {
      hideResults();
      input.focus();
    }
  };

  const nav = h(
    "nav",
    {
      class:
        "relative z-50 w-full border-b border-zinc-200/70 bg-zinc-50/85 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/80",
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
            "mr-auto inline-flex items-center text-xl font-black tracking-tight sm:mr-0",
        },
        "Cine",
        h("span", { class: "text-accent" }, "Vault"),
      ),
      ...links,
      h(
        "a",
        {
          href: "my-list.html",
          class:
            "rounded-full px-3 py-2 font-semibold text-zinc-600 transition-colors hover:bg-accent/10 hover:text-accent dark:text-zinc-300" +
            (currentPage === "my-list.html" ? " nav-link-current" : ""),
          ...(currentPage === "my-list.html" ? { "aria-current": "page" } : {}),
        },
        icon("bookmark", "mr-1 inline size-4 align-[-3px]"),
        "My List",
      ),
      h(
        "div",
        {
          class:
            "relative order-3 flex w-full items-center gap-2 sm:order-none sm:ml-auto sm:w-auto",
        },
        icon(
          "search",
          "absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400",
        ),
        input,
        dropdown,
        themeButton,
      ),
    ),
  );
  mount("#nav", nav);
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
