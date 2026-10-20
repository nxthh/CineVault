import { createElement } from "lucide";

type Child = Node | string | null | false;

export const icon = (
  node: Parameters<typeof createElement>[0],
  className = "size-4",
) => createElement(node, { class: className, "aria-hidden": "true" });

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
