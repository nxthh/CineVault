type Child = Node | string | null | false;

export type IconName =
  | "bookmark"
  | "bookmark-check"
  | "chevron-left"
  | "chevron-right"
  | "moon"
  | "search"
  | "sun";

const iconMarkup: Record<IconName, string> = {
  bookmark: '<path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-4-6 4z"/>',
  "bookmark-check":
    '<path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-4-6 4z"/><path d="m9 10 2 2 4-4"/>',
  "chevron-left": '<path d="m15 18-6-6 6-6"/>',
  "chevron-right": '<path d="m9 18 6-6-6-6"/>',
  moon: '<path d="M20.985 12.486A9 9 0 1 1 11.514 3.015a7 7 0 0 0 9.471 9.471"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/>',
};

export const icon = (
  name: IconName,
  className = "size-4",
) => {
  const element = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  element.setAttribute("viewBox", "0 0 24 24");
  element.setAttribute("fill", "none");
  element.setAttribute("stroke", "currentColor");
  element.setAttribute("stroke-width", "2");
  element.setAttribute("stroke-linecap", "round");
  element.setAttribute("stroke-linejoin", "round");
  element.setAttribute("class", className);
  element.setAttribute("aria-hidden", "true");
  element.innerHTML = iconMarkup[name];
  return element;
};

export const h = (
  tag: string,
  attributes: Record<string, string> = {},
  ...children: Child[]
) => {
  const element = document.createElement(tag);
  for (const [key, value] of Object.entries(attributes))
    key === "class"
      ? (element.className = value)
      : element.setAttribute(key, value);
  element.append(...children.filter((child): child is Node | string => !!child));
  return element;
};

export const $ = (selector: string) =>
  document.querySelector<HTMLElement>(selector)!;

export const mount = (selector: string, ...nodes: Node[]) => {
  $(selector).replaceChildren(...nodes);
};
