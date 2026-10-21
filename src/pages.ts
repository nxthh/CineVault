import { details } from "./pages/details.js";
import { home } from "./pages/home.js";
import { movies } from "./pages/movies.js";
import { mylist } from "./pages/my-list.js";
import { tv } from "./pages/tv.js";

export const pages: Record<string, () => void> = {
  home,
  movies,
  tv,
  details,
  mylist,
};
