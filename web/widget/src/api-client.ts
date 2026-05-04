import type {
  CommentAuthorType,
  CommentRow,
  FeedbackRow,
  WidgetConfig,
} from "./types";

type FeedbackApiRow = Partial<FeedbackRow> & {
  commentText?: string;
  imageUrls?: string[];
  urlPath?: string;
  createdAt?: string;
};

type CommentApiRow = Partial<CommentRow> & {
  authorType?: CommentAuthorType;
  imageUrls?: string[];
  createdAt?: string;
};

type FeedbackDetailApiResponse =
  | (FeedbackApiRow & { comments?: CommentApiRow[] })
  | {
      feedback?: FeedbackApiRow;
      comments?: CommentApiRow[];
    };

function urlPath(): string {
  const rawPath = location.pathname || "/";
  const path =
    rawPath !== "/" && rawPath.endsWith("/") ? rawPath.slice(0, -1) : rawPath;
  return `${path}${location.search}`;
}

function normalizeFeedbackRow(row: FeedbackApiRow): FeedbackRow | null {
  if (!row.id || !row.selector || !row.coordinates) return null;

  return {
    id: row.id,
    selector: row.selector,
    coordinates: row.coordinates,
    comment_text: row.comment_text ?? row.commentText ?? "",
    image_urls: row.image_urls ?? row.imageUrls ?? [],
    author: row.author ?? "",
    metadata: row.metadata ?? {},
    status: row.status ?? "open",
    priority: row.priority ?? null,
    url_path: row.url_path ?? row.urlPath ?? "",
    created_at: row.created_at ?? row.createdAt ?? "",
  };
}

function normalizeCommentRow(row: CommentApiRow): CommentRow | null {
  if (!row.id) return null;

  return {
    id: row.id,
    author_type: row.author_type ?? row.authorType ?? "client",
    body: row.body ?? "",
    image_urls: row.image_urls ?? row.imageUrls ?? [],
    created_at: row.created_at ?? row.createdAt ?? "",
  };
}

function isFeedbackEnvelope(
  data: FeedbackDetailApiResponse,
): data is { feedback?: FeedbackApiRow; comments?: CommentApiRow[] } {
  return "feedback" in data;
}

function isCommentEnvelope(
  data: CommentApiRow | { comment?: CommentApiRow },
): data is { comment?: CommentApiRow } {
  return "comment" in data;
}


export async function fetchFeedback(
  cfg: WidgetConfig,
): Promise<FeedbackRow[]> {
  const q = new URLSearchParams({
    embed_key: cfg.embedKey,
    url_path: urlPath(),
    include_resolved: "1",
  });
  const res = await fetch(`${cfg.apiBase}?${q}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    console.error("[AgencyFeedback] GET failed", res.status);
    return [];
  }
  const data = (await res.json()) as
    | { feedback?: FeedbackApiRow[] }
    | FeedbackApiRow[];
  const rows = Array.isArray(data) ? data : (data.feedback ?? []);
  return rows
    .map((row) => normalizeFeedbackRow(row))
    .filter((row): row is FeedbackRow => row != null);
}

export async function fetchFeedbackDetail(
  cfg: WidgetConfig,
  feedbackId: string,
): Promise<{ feedback: FeedbackRow; comments: CommentRow[] } | null> {
  const q = new URLSearchParams({ embed_key: cfg.embedKey });
  const res = await fetch(`${cfg.apiBase}/${feedbackId}?${q}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as FeedbackDetailApiResponse;
  const feedbackSource = isFeedbackEnvelope(data) ? data.feedback : data;
  if (!feedbackSource) return null;
  const feedback = normalizeFeedbackRow(feedbackSource);
  if (!feedback) return null;
  const comments = (data.comments ?? [])
    .map((row) => normalizeCommentRow(row))
    .filter((row): row is CommentRow => row != null);
  return { feedback, comments };
}

export async function fetchFeedbackComments(
  cfg: WidgetConfig,
  feedbackId: string,
): Promise<CommentRow[]> {
  const q = new URLSearchParams({ embed_key: cfg.embedKey });
  const res = await fetch(`${cfg.apiBase}/${feedbackId}/comments?${q}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as CommentApiRow[] | { comments?: CommentApiRow[] };
  const rows = Array.isArray(data) ? data : (data.comments ?? []);
  return rows
    .map((row) => normalizeCommentRow(row))
    .filter((row): row is CommentRow => row != null);
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
  const res = await fetch(cfg.apiBase, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      embed_key: cfg.embedKey,
      selector: payload.selector,
      coordinates: payload.coordinates,
      comment_text: payload.commentText,
      image_urls: payload.imageUrls,
      author: payload.author,
      priority: payload.priority,
      url_path: urlPath(),
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
): Promise<{ ok: boolean; comment?: CommentRow; error?: string }> {
  const res = await fetch(`${cfg.apiBase}/${feedbackId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      embed_key: cfg.embedKey,
      author_type: authorType,
      body,
      image_urls: imageUrls,
    }),
  });
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
  try {
    const data = (await res.json()) as CommentApiRow | { comment?: CommentApiRow };
    const source = isCommentEnvelope(data) ? data.comment : data;
    if (source) {
      const comment = normalizeCommentRow(source);
      if (comment) return { ok: true, comment };
    }
  } catch {
    /* POST may return an empty body. */
  }
  return {
    ok: true,
    comment: {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}`,
      author_type: authorType,
      body,
      image_urls: imageUrls,
      created_at: new Date().toISOString(),
    },
  };
}

export async function uploadFeedbackImage(
  cfg: WidgetConfig,
  file: File,
): Promise<{ ok: boolean; url?: string; error?: string }> {
  const form = new FormData();
  form.set("embed_key", cfg.embedKey);
  form.set("file", file);
  const res = await fetch(`${cfg.apiBase}/upload`, {
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
  const res = await fetch(`${cfg.apiBase}/${feedbackId}?embed_key=${encodeURIComponent(cfg.embedKey)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
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
  code: string,
): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch(`${cfg.apiBase}/verify-pin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      embed_key: cfg.embedKey,
      passcode: code,
    }),
  });
  if (!res.ok) {
    return { ok: false, error: "Invalid passcode" };
  }
  const data = (await res.json()) as { valid?: boolean };
  if (!data.valid) {
    return { ok: false, error: "Invalid passcode" };
  }
  return { ok: true };
}
