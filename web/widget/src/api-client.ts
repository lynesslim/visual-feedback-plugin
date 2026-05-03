import type {
  CommentAuthorType,
  CommentRow,
  FeedbackRow,
  WidgetConfig,
} from "./types";

function urlPath(): string {
  const rawPath = location.pathname || "/";
  const path =
    rawPath !== "/" && rawPath.endsWith("/") ? rawPath.slice(0, -1) : rawPath;
  return `${path}${location.search}`;
}

export async function fetchFeedback(
  cfg: WidgetConfig,
): Promise<FeedbackRow[]> {
  const q = new URLSearchParams({
    projectSlug: cfg.projectSlug,
    embedPublicKey: cfg.embedPublicKey,
    urlPath: urlPath(),
    includeResolved: "1",
  });
  const res = await fetch(`${cfg.apiBase}/api/public/feedback?${q}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    console.error("[AgencyFeedback] GET failed", res.status);
    return [];
  }
  const data = (await res.json()) as { feedback?: FeedbackRow[] };
  return data.feedback ?? [];
}

export async function fetchFeedbackDetail(
  cfg: WidgetConfig,
  feedbackId: string,
): Promise<{ feedback: FeedbackRow; comments: CommentRow[] } | null> {
  const q = new URLSearchParams({
    projectSlug: cfg.projectSlug,
    embedPublicKey: cfg.embedPublicKey,
  });
  const res = await fetch(
    `${cfg.apiBase}/api/public/feedback/${feedbackId}?${q}`,
    { headers: { Accept: "application/json" } },
  );
  if (!res.ok) return null;
  const data = (await res.json()) as {
    feedback?: FeedbackRow;
    comments?: CommentRow[];
  };
  if (!data.feedback) return null;
  return { feedback: data.feedback, comments: data.comments ?? [] };
}

export async function submitFeedback(
  cfg: WidgetConfig,
  payload: {
    selector: string;
    coordinates: { x: number; y: number };
    commentText: string;
    imageUrls: string[];
    author: string;
    priority: string | null;
    metadata: Record<string, unknown>;
  },
): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch(`${cfg.apiBase}/api/public/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      projectSlug: cfg.projectSlug,
      embedPublicKey: cfg.embedPublicKey,
      selector: payload.selector,
      coordinates: payload.coordinates,
      commentText: payload.commentText,
      imageUrls: payload.imageUrls,
      author: payload.author,
      priority: payload.priority,
      urlPath: urlPath(),
      metadata: payload.metadata,
    }),
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const j = (await res.json()) as { error?: string };
      if (j.error) msg = j.error;
    } catch {
      /* ignore */
    }
    return { ok: false, error: msg };
  }
  return { ok: true };
}

export async function postThreadComment(
  cfg: WidgetConfig,
  feedbackId: string,
  authorType: CommentAuthorType,
  body: string,
  imageUrls: string[],
): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch(
    `${cfg.apiBase}/api/public/feedback/${feedbackId}/comments`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectSlug: cfg.projectSlug,
        embedPublicKey: cfg.embedPublicKey,
        authorType,
        body,
        imageUrls,
      }),
    },
  );
  if (!res.ok) {
    let msg = "Could not post comment";
    try {
      const j = (await res.json()) as { error?: string };
      if (j.error) msg = j.error;
    } catch {
      /* ignore */
    }
    return { ok: false, error: msg };
  }
  return { ok: true };
}

export async function uploadFeedbackImage(
  cfg: WidgetConfig,
  file: File,
): Promise<{ ok: boolean; url?: string; error?: string }> {
  const form = new FormData();
  form.set("projectSlug", cfg.projectSlug);
  form.set("embedPublicKey", cfg.embedPublicKey);
  form.set("file", file);
  const res = await fetch(`${cfg.apiBase}/api/public/feedback/upload`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    let msg = "Upload failed";
    try {
      const j = (await res.json()) as { error?: string };
      if (j.error) msg = j.error;
    } catch {
      /* ignore */
    }
    return { ok: false, error: msg };
  }
  const data = (await res.json()) as { url?: string };
  if (!data.url) {
    return { ok: false, error: "Upload failed" };
  }
  return { ok: true, url: data.url };
}

export async function markFeedbackResolved(
  cfg: WidgetConfig,
  feedbackId: string,
): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch(`${cfg.apiBase}/api/public/feedback/${feedbackId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      projectSlug: cfg.projectSlug,
      embedPublicKey: cfg.embedPublicKey,
      status: "resolved",
    }),
  });
  if (!res.ok) {
    let msg = "Could not update";
    try {
      const j = (await res.json()) as { error?: string };
      if (j.error) msg = j.error;
    } catch {
      /* ignore */
    }
    return { ok: false, error: msg };
  }
  return { ok: true };
}

export async function verifyFeedbackPasscode(
  cfg: WidgetConfig,
  passcode: string,
): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch(`${cfg.apiBase}/api/public/feedback/verify-pin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      projectSlug: cfg.projectSlug,
      embedPublicKey: cfg.embedPublicKey,
      passcode,
    }),
  });
  if (!res.ok) {
    let msg = "Invalid code";
    try {
      const j = (await res.json()) as { error?: string };
      if (j.error) msg = j.error;
    } catch {
      /* ignore */
    }
    return { ok: false, error: msg };
  }
  return { ok: true };
}
