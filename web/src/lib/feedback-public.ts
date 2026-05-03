import type { SupabaseClient } from "@supabase/supabase-js";

/** Ensures feedback row belongs to project (for public API). */
export async function feedbackBelongsToProject(
  admin: SupabaseClient,
  projectId: string,
  feedbackId: string,
): Promise<boolean> {
  const { data, error } = await admin
    .from("feedback")
    .select("id")
    .eq("id", feedbackId)
    .eq("project_id", projectId)
    .maybeSingle();

  if (error || !data) return false;
  return true;
}
