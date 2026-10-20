import { Bookmark, BookmarkCheck } from "lucide";
import { Media } from "../tmdb";
import { h, icon } from "./dom";
import { toast } from "./feedback";

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

export const inList = (type: Media, id: number) =>
  getList().some((item) => item.type === type && item.id === id);

export const syncListButton = (
  button: HTMLButtonElement,
  type: Media,
  id: number,
  title: string,
) => {
  const saved = inList(type, id);
  button.replaceChildren(icon(saved ? BookmarkCheck : Bookmark));
  button.setAttribute(
    "aria-label",
    `${saved ? "Remove from" : "Add to"} My List: ${title}`,
  );
  button.setAttribute("aria-pressed", String(saved));
};

document.addEventListener("cv-list", () => {
  document
    .querySelectorAll<HTMLButtonElement>(
      ".movie-card [data-media-type][data-media-id]",
    )
    .forEach((button) => {
      const type = button.dataset.mediaType;
      if (type !== "movie" && type !== "tv") return;
      syncListButton(
        button,
        type,
        Number(button.dataset.mediaId),
        button.dataset.title || "",
      );
    });
});

export function toggleList(type: Media, id: number) {
  let list = getList();
  list = inList(type, id)
    ? list.filter((item) => !(item.type === type && item.id === id))
    : [...list, { type, id }];
  localStorage.setItem(KEY, JSON.stringify(list));
  document.dispatchEvent(new Event("cv-list"));
  toast(inList(type, id) ? "Added to My List" : "Removed from My List");
}
