import { createAdminClient } from "@/lib/supabase/admin";
import { feedbackBelongsToProject } from "@/lib/feedback-public";
import { publicApiCorsHeaders, publicCorsJson } from "@/lib/public-api-cors";
import { resolveProjectByEmbedCredentials } from "@/lib/embed-auth";
import { NextRequest, NextResponse } from "next/server";

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: publicApiCorsHeaders(request),
  });
}

export async function GET(
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

  const { searchParams } = new URL(request.url);
  const projectSlug = searchParams.get("projectSlug")?.trim() ?? "";
  const embedPublicKey = searchParams.get("embedPublicKey")?.trim() ?? "";

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

  const ok = await feedbackBelongsToProject(
    admin,
    project.id,
    feedbackId,
  );
  if (!ok) {
    return publicCorsJson(request, { error: "Unauthorized" }, 401);
  }

  const { data: row, error: fe } = await admin
    .from("feedback")
    .select(
      "id, selector, coordinates, comment_text, author, metadata, status, priority, url_path, image_urls, created_at",
    )
    .eq("id", feedbackId)
    .single();

  if (fe || !row) {
    return publicCorsJson(request, { error: "Not found" }, 404);
  }

  const { data: comments, error: ce } = await admin
    .from("feedback_comments")
    .select("id, author_type, body, image_urls, created_at")
    .eq("feedback_id", feedbackId)
    .order("created_at", { ascending: true });

  if (ce) {
    return publicCorsJson(request, { error: "Failed to load comments" }, 500);
  }

  return publicCorsJson(
    request,
    { feedback: row, comments: comments ?? [] },
    200,
  );
}

export async function PATCH(
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
  const status = String(b.status ?? "").trim();

  if (!projectSlug || !embedPublicKey) {
    return publicCorsJson(
      request,
      { error: "Missing projectSlug or embedPublicKey" },
      400,
    );
  }

  if (status !== "resolved") {
    return publicCorsJson(
      request,
      { error: "Only status resolved is supported" },
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

  const { error } = await admin
    .from("feedback")
    .update({ status: "resolved" })
    .eq("id", feedbackId);

  if (error) {
    return publicCorsJson(request, { error: "Failed to update" }, 500);
  }

  return publicCorsJson(request, { ok: true }, 200);
}
