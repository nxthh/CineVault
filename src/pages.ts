import { details } from "./pages/details";
import { home } from "./pages/home";
import { movies } from "./pages/movies";
import { mylist } from "./pages/my-list";
import { tv } from "./pages/tv";

export const pages: Record<string, () => void> = {
  home,
  movies,
  tv,
  details,
  mylist,
};
