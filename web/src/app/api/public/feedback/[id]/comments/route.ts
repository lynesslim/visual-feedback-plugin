import { createAdminClient } from "@/lib/supabase/admin";
import { feedbackBelongsToProject } from "@/lib/feedback-public";
import { publicApiCorsHeaders, publicCorsJson } from "@/lib/public-api-cors";
import { resolveProjectByEmbedCredentials } from "@/lib/embed-auth";
import { NextRequest, NextResponse } from "next/server";

const AUTHOR_TYPES = new Set(["client", "agency"]);
const MAX_IMAGE_URLS = 8;

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

export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return publicCorsJson(request, { error: "Server configuration error" }, 500);
  }

  const { id: feedbackId } = await ctx.params;
  if (!feedbackId || !/^[0-9a-f-]{36}$/i.test(feedbackId)) {
    return publicCorsJson(request, { error: "Invalid feedback id" }, 400);
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
  const authorType = String(b.authorType ?? "").trim().toLowerCase();
  const text = String(b.body ?? "").trim();
  const imageUrls = parseImageUrls(b.imageUrls ?? b.image_urls);

  if (!projectSlug || !embedPublicKey) {
    return publicCorsJson(
      request,
      { error: "Missing projectSlug or embedPublicKey" },
      400,
    );
  }

  if (!AUTHOR_TYPES.has(authorType)) {
    return publicCorsJson(
      request,
      { error: "authorType must be client or agency" },
      400,
    );
  }

  if (imageUrls == null) {
    return publicCorsJson(
      request,
      { error: "imageUrls must be an array of http(s) URLs" },
      400,
    );
  }

  if (text.length > 8000) {
    return publicCorsJson(
      request,
      { error: "body max length is 8000 chars" },
      400,
    );
  }
  if (!text && imageUrls.length === 0) {
    return publicCorsJson(
      request,
      { error: "body or imageUrls is required" },
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

  const belongs = await feedbackBelongsToProject(
    admin,
    project.id,
    feedbackId,
  );
  if (!belongs) {
    return publicCorsJson(request, { error: "Unauthorized" }, 401);
  }

  const { data, error } = await admin
    .from("feedback_comments")
    .insert({
      feedback_id: feedbackId,
      author_type: authorType as "client" | "agency",
      body: text,
      image_urls: imageUrls,
    })
    .select("id, author_type, body, image_urls, created_at")
    .single();

  if (error) {
    return publicCorsJson(request, { error: "Failed to save comment" }, 500);
  }

  return publicCorsJson(request, { comment: data }, 201);
}
