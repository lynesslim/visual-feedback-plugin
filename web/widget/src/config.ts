import type { WidgetConfig } from "./types";

function trimSlash(s: string): string {
  return s.replace(/\/+$/, "");
}

export function readConfig(script: HTMLScriptElement): WidgetConfig | null {
  const projectSlug =
    script.getAttribute("data-af-project")?.trim() ||
    script.getAttribute("data-project")?.trim() ||
    "";
  const apiRaw =
    script.getAttribute("data-af-api")?.trim() ||
    script.getAttribute("data-api")?.trim() ||
    "";
  const embedPublicKey =
    script.getAttribute("data-af-key")?.trim() ||
    script.getAttribute("data-key")?.trim() ||
    "";

  if (!projectSlug || !apiRaw || !embedPublicKey) {
    console.error(
      "[AgencyFeedback] Missing data-project, data-api, or data-key on script tag.",
    );
    return null;
  }

  return {
    apiBase: trimSlash(apiRaw),
    projectSlug,
    embedPublicKey,
  };
}
