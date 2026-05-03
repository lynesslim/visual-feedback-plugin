import { createAdminClient } from "@/lib/supabase/admin";
import { resolveProjectByEmbedCredentials } from "@/lib/embed-auth";
import { publicApiCorsHeaders, publicCorsJson } from "@/lib/public-api-cors";
import { NextRequest, NextResponse } from "next/server";

const PRIORITIES = new Set(["low", "medium", "high"]);
const AUTHOR_LABELS = new Set(["Client", "Supercraft"]);
const MAX_IMAGE_URLS = 8;

function parseCoordinates(raw: unknown): { x: number; y: number } | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const x = Number(o.x);
  const y = Number(o.y);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  const cx = Math.min(1, Math.max(0, x));
  const cy = Math.min(1, Math.max(0, y));
  return { x: cx, y: cy };
}

function normalizeUrlPath(input: string): string {
  if (!input) return "";
  const [path, qs] = input.split("?", 2);
  const normalizedPath =
    path !== "/" && path.endsWith("/") ? path.slice(0, -1) : path;
  return qs != null && qs !== "" ? `${normalizedPath}?${qs}` : normalizedPath;
}

function parseImageUrls(raw: unknown): string[] | null {
  if (raw == null || raw === "") return [];
  if (!Array.isArray(raw)) return null;
  if (raw.length > MAX_IMAGE_URLS) return null;
  const out: string[] = [];
  for (const v of raw) {
    if (typeof v !== "string") return null;
    const s = v.trim();
    if (!s) continue;
    if (!/^https?:\/\//i.test(s)) return null;
    out.push(s);
  }
  return out;
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: publicApiCorsHeaders(request),
  });
}

export async function GET(request: NextRequest) {
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return publicCorsJson(request, { error: "Server configuration error" }, 500);
  }

  const { searchParams } = new URL(request.url);
  const projectSlug = searchParams.get("projectSlug")?.trim() ?? "";
  const embedPublicKey = searchParams.get("embedPublicKey")?.trim() ?? "";
  const urlPath = normalizeUrlPath(searchParams.get("urlPath") ?? "");
  const includeResolved =
    searchParams.get("includeResolved") === "1" ||
    searchParams.get("includeResolved") === "true";

  if (!projectSlug || !embedPublicKey) {
    return publicCorsJson(
      request,
      { error: "Missing projectSlug or embedPublicKey" },
      400,
    );
  }

  const project = await resolveProjectByEmbedCredentials(
    admin,
    projectSlug,
    embedPublicKey,
  );
  if (!project) {
    return publicCorsJson(request, { error: "Unauthorized" }, 401);
  }

  const buildQuery = () => {
    let q = admin
      .from("feedback")
      .select(
        "id, selector, coordinates, comment_text, author, metadata, status, priority, url_path, image_urls, created_at",
      )
      .eq("project_id", project.id)
      .order("created_at", { ascending: true });
    if (!includeResolved) {
      q = q.in("status", ["open", "in_progress"]);
    }
    return q;
  };

  let data: unknown[] | null = null;
  let error: { message?: string } | null = null;
  const pathOnly = urlPath.split("?")[0] ?? "";
  const slashVariant =
    pathOnly && pathOnly !== "/" ? `${pathOnly}/` : pathOnly.replace(/\/+$/, "");

  if (urlPath === "") {
    const res = await buildQuery();
    data = res.data;
    error = res.error;
  } else {
    const exact = await buildQuery().eq("url_path", urlPath);
    data = exact.data;
    error = exact.error;

    // Query-insensitive fallback: allow records saved with or without search params.
    if (!error && (data?.length ?? 0) === 0 && pathOnly !== "" && pathOnly !== urlPath) {
      const fallback = await buildQuery().eq("url_path", pathOnly);
      data = fallback.data;
      error = fallback.error;
    }
    if (
      !error &&
      (data?.length ?? 0) === 0 &&
      slashVariant !== "" &&
      slashVariant !== pathOnly
    ) {
      const fallbackSlash = await buildQuery().eq("url_path", slashVariant);
      data = fallbackSlash.data;
      error = fallbackSlash.error;
    }
    if (!error && (data?.length ?? 0) === 0 && pathOnly !== "") {
      const fallbackLike = await buildQuery().like("url_path", `${pathOnly}?%`);
      data = fallbackLike.data;
      error = fallbackLike.error;
    }
  }

  if (error) {
    return publicCorsJson(request, { error: "Failed to load feedback" }, 500);
  }

  return publicCorsJson(request, { feedback: data ?? [] }, 200);
}

export async function POST(request: NextRequest) {
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return publicCorsJson(request, { error: "Server configuration error" }, 500);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return publicCorsJson(request, { error: "Invalid JSON body" }, 400);
  }

  if (!body || typeof body !== "object") {
    return publicCorsJson(request, { error: "Expected JSON object" }, 400);
  }

  const b = body as Record<string, unknown>;
  const projectSlug = String(b.projectSlug ?? "").trim();
  const embedPublicKey = String(b.embedPublicKey ?? "").trim();
  const selector = String(b.selector ?? "").trim();
  const commentText = String(
    b.commentText ?? b.comment_text ?? "",
  ).trim();
  const author = String(b.author ?? "").trim();
  const urlPath = normalizeUrlPath(String(b.urlPath ?? b.url_path ?? "").trim());
  const coordinates = parseCoordinates(b.coordinates);
  const imageUrls = parseImageUrls(b.imageUrls ?? b.image_urls);

  const metadata =
    b.metadata && typeof b.metadata === "object" && !Array.isArray(b.metadata)
      ? (b.metadata as Record<string, unknown>)
      : {};

  let priority: "low" | "medium" | "high" | null = null;
  if (b.priority != null && b.priority !== "") {
    const p = String(b.priority);
    if (!PRIORITIES.has(p)) {
      return publicCorsJson(request, { error: "Invalid priority" }, 400);
    }
    priority = p as "low" | "medium" | "high";
  }

  if (!projectSlug || !embedPublicKey) {
    return publicCorsJson(
      request,
      { error: "Missing projectSlug or embedPublicKey" },
      400,
    );
  }
  if (!selector || !author || !coordinates || imageUrls == null) {
    return publicCorsJson(
      request,
      {
        error:
          "Missing or invalid fields: selector, coordinates {x,y}, author, imageUrls[]",
      },
      400,
    );
  }
  if (!commentText && imageUrls.length === 0) {
    return publicCorsJson(
      request,
      { error: "Provide commentText or at least one image" },
      400,
    );
  }

  if (!AUTHOR_LABELS.has(author)) {
    return publicCorsJson(
      request,
      { error: "author must be Client or Supercraft" },
      400,
    );
  }

  const project = await resolveProjectByEmbedCredentials(
    admin,
    projectSlug,
    embedPublicKey,
  );
  if (!project) {
    return publicCorsJson(request, { error: "Unauthorized" }, 401);
  }

  const { data, error } = await admin
    .from("feedback")
    .insert({
      project_id: project.id,
      selector,
      coordinates,
      comment_text: commentText,
      author,
      metadata,
      priority,
      url_path: urlPath,
      image_urls: imageUrls,
      status: "open",
    })
    .select("id, created_at")
    .single();

  if (error) {
    return publicCorsJson(request, { error: "Failed to save feedback" }, 500);
  }

  return publicCorsJson(request, { id: data.id, created_at: data.created_at }, 201);
}
