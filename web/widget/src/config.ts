import type { WidgetConfig } from "./types";

function trimSlash(s: string): string {
  return s.replace(/\/+$/, "");
}

export function readConfig(script: HTMLScriptElement): WidgetConfig | null {
  const apiRaw =
    script.getAttribute("data-af-api")?.trim() ||
    script.getAttribute("data-api")?.trim() ||
    "";
  const embedKey =
    script.getAttribute("data-af-key")?.trim() ||
    script.getAttribute("data-key")?.trim() ||
    "";

  if (!apiRaw || !embedKey) {
    console.error(
      "[AgencyFeedback] Missing data-api or data-key on script tag.",
    );
    return null;
  }

  return {
    apiBase: trimSlash(apiRaw),
    embedKey,
  };
}
