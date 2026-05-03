import { createAdminClient } from "@/lib/supabase/admin";
import { resolveProjectByEmbedCredentials } from "@/lib/embed-auth";
import { publicApiCorsHeaders, publicCorsJson } from "@/lib/public-api-cors";
import { NextRequest, NextResponse } from "next/server";

const BUCKET = "feedback-attachments";
const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: publicApiCorsHeaders(request),
  });
}

function extFromType(type: string): string {
  if (type === "image/jpeg") return "jpg";
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/gif") return "gif";
  return "bin";
}

export async function POST(request: NextRequest) {
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return publicCorsJson(request, { error: "Server configuration error" }, 500);
  }

  const form = await request.formData();
  const projectSlug = String(form.get("projectSlug") ?? "").trim();
  const embedPublicKey = String(form.get("embedPublicKey") ?? "").trim();
  const file = form.get("file");

  if (!projectSlug || !embedPublicKey) {
    return publicCorsJson(
      request,
      { error: "Missing projectSlug or embedPublicKey" },
      400,
    );
  }
  if (!(file instanceof File)) {
    return publicCorsJson(request, { error: "Missing image file" }, 400);
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return publicCorsJson(request, { error: "Unsupported image type" }, 400);
  }
  if (file.size <= 0 || file.size > MAX_BYTES) {
    return publicCorsJson(request, { error: "Image exceeds 8MB limit" }, 400);
  }

  const project = await resolveProjectByEmbedCredentials(
    admin,
    projectSlug,
    embedPublicKey,
  );
  if (!project) {
    return publicCorsJson(request, { error: "Unauthorized" }, 401);
  }

  const ext = extFromType(file.type);
  const path = `${project.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const data = await file.arrayBuffer();
  const { error } = await admin.storage
    .from(BUCKET)
    .upload(path, data, { contentType: file.type, upsert: false });
  if (error) {
    return publicCorsJson(request, { error: "Upload failed" }, 500);
  }

  const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(path);
  return publicCorsJson(request, { url: pub.publicUrl, path }, 201);
}
