import { hasToken } from "../tmdb";
import { h, mount } from "./dom";

export function toast(message: string) {
  const element = h(
    "div",
    {
      role: "status",
      class:
        "fixed bottom-4 left-1/2 -translate-x-1/2 z-50 rounded-lg bg-accent px-4 py-2 text-white",
    },
    message,
  );
  document.body.append(element);
  setTimeout(() => element.remove(), 2200);
}

export const skeletons = (count = 6) =>
  h(
    "div",
    {
      class:
        "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6",
    },
    ...Array.from({ length: count }, () =>
      h("div", { class: "skeleton aspect-[2/3] rounded-2xl" }),
    ),
  );

export const errorBox = (error: unknown) =>
  h(
    "p",
    {
      role: "alert",
      class: "rounded-lg border border-red-500/40 p-4 text-red-500",
    },
    hasToken()
      ? `Couldn't load data: ${(error as Error).message}`
      : "No TMDB token configured. Copy .env.example to .env, add your token and run npm run build.",
  );

export async function load(selector: string, render: () => Promise<Node>) {
  mount(selector, skeletons());
  try {
    mount(selector, await render());
  } catch (error) {
    mount(selector, errorBox(error));
  }
}
