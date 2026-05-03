import { timingSafeEqual } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

export function keysMatch(a: string, b: string): boolean {
  try {
    const ba = Buffer.from(a, "utf8");
    const bb = Buffer.from(b, "utf8");
    if (ba.length !== bb.length) return false;
    return timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}

/** Returns project id if slug + embed key are valid; null otherwise (same for wrong slug or wrong key). */
export async function resolveProjectByEmbedCredentials(
  admin: SupabaseClient,
  slug: string,
  embedPublicKey: string,
): Promise<{ id: string } | null> {
  const { data: project, error } = await admin
    .from("projects")
    .select("id, embed_public_key")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !project) return null;
  if (!keysMatch(embedPublicKey, project.embed_public_key)) return null;
  return { id: project.id };
}

/** Same auth as resolve, plus feedback passcode for verification endpoint. */
export async function resolveProjectEmbedWithPasscode(
  admin: SupabaseClient,
  slug: string,
  embedPublicKey: string,
): Promise<{ id: string; feedback_passcode: string } | null> {
  const { data: project, error } = await admin
    .from("projects")
    .select("id, embed_public_key, feedback_passcode")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !project) return null;
  if (!keysMatch(embedPublicKey, project.embed_public_key)) return null;
  const code = project.feedback_passcode;
  if (typeof code !== "string" || !/^\d{4}$/.test(code)) return null;
  return { id: project.id, feedback_passcode: code };
}
