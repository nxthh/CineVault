import { initChrome } from "./ui.js";
import { pages } from "./pages.js";
initChrome();
pages[document.body.dataset.page||'']?.();
