import { createAdminClient } from "@/lib/supabase/admin";
import { keysMatch, resolveProjectEmbedWithPasscode } from "@/lib/embed-auth";
import { NextRequest, NextResponse } from "next/server";

function corsHeaders(request: NextRequest): HeadersInit {
  const origin = request.headers.get("origin");
  const allow = origin && origin !== "null" ? origin : "*";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

function json(request: NextRequest, body: unknown, status: number): NextResponse {
  const res = NextResponse.json(body, { status });
  const h = corsHeaders(request);
  for (const [k, v] of Object.entries(h)) res.headers.set(k, v);
  return res;
}

function normalizePin(raw: unknown): string | null {
  if (raw == null) return null;
  const digits = String(raw).replace(/\D/g, "").slice(0, 4);
  return digits.length === 4 ? digits : null;
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(request) });
}

export async function POST(request: NextRequest) {
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return json(request, { error: "Server configuration error" }, 500);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json(request, { error: "Invalid JSON body" }, 400);
  }

  if (!body || typeof body !== "object") {
    return json(request, { error: "Expected JSON object" }, 400);
  }

  const b = body as Record<string, unknown>;
  const projectSlug = String(b.projectSlug ?? "").trim();
  const embedPublicKey = String(b.embedPublicKey ?? "").trim();
  const passcode = normalizePin(b.passcode);

  if (!projectSlug || !embedPublicKey) {
    return json(
      request,
      { error: "Missing projectSlug or embedPublicKey" },
      400,
    );
  }

  if (!passcode) {
    return json(request, { error: "passcode must be 4 digits" }, 400);
  }

  const project = await resolveProjectEmbedWithPasscode(
    admin,
    projectSlug,
    embedPublicKey,
  );

  if (!project) {
    return json(request, { error: "Unauthorized" }, 401);
  }

  if (!keysMatch(passcode, project.feedback_passcode)) {
    return json(request, { error: "Invalid passcode" }, 401);
  }

  return json(request, { ok: true }, 200);
}
