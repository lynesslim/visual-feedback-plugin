/**
 * Build a CSS path to `el` for feedback anchoring.
 * Prefer the nearest ancestor (or self) with a non-empty `data-id` (e.g. Elementor
 * wrappers), then a short nth-of-type chain from that anchor to the clicked node.
 * Otherwise fall back to `body > …` using tag + nth-of-type.
 */

function nthOfTypeSegments(fromAncestor: Element, toDescendant: Element): string[] {
  const parts: string[] = [];
  let current: Element | null = toDescendant;

  while (current && current !== fromAncestor) {
    const parentEl = current.parentElement;
    if (!parentEl) return [];

    const tag = current.tagName.toLowerCase();
    const self = current;
    const sameTagSiblings = Array.from(parentEl.children).filter(
      (c) => c.tagName === self.tagName,
    );
    const index = sameTagSiblings.indexOf(self) + 1;
    parts.unshift(`${tag}:nth-of-type(${index})`);
    current = parentEl;
  }

  return current === fromAncestor ? parts : [];
}

function attrDataIdSelector(dataId: string): string {
  const v = dataId.trim();
  if (!v) return "";
  const escaped = v.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `[data-id="${escaped}"]`;
}

/** Walk up from `el` and return the closest element with a non-empty `data-id`. */
function closestDataIdAnchor(el: Element): Element | null {
  let node: Element | null = el;
  while (node && node !== document.body) {
    const id = node.getAttribute("data-id")?.trim();
    if (id) return node;
    node = node.parentElement;
  }
  return null;
}

function bodyRelativePath(el: Element): string {
  const parts: string[] = [];
  let current: Element | null = el;

  while (current && current !== document.body) {
    const tag = current.tagName.toLowerCase();
    const parentEl: HTMLElement | null = current.parentElement;
    if (!parentEl) break;

    const self = current;
    const sameTagSiblings = Array.from(parentEl.children).filter(
      (c) => c.tagName === self.tagName,
    );
    const index = sameTagSiblings.indexOf(self) + 1;
    parts.unshift(`${tag}:nth-of-type(${index})`);
    current = parentEl;
  }

  return parts.length ? `body > ${parts.join(" > ")}` : "body";
}

export function elementToCssPath(el: Element): string {
  if (el === document.body || el === document.documentElement) {
    return el.tagName.toLowerCase();
  }

  const dataAnchor = closestDataIdAnchor(el);
  if (dataAnchor) {
    const raw = dataAnchor.getAttribute("data-id");
    const base = raw ? attrDataIdSelector(raw) : "";
    if (base) {
      const tail = nthOfTypeSegments(dataAnchor, el);
      return tail.length ? `${base} > ${tail.join(" > ")}` : base;
    }
  }

  return bodyRelativePath(el);
}
