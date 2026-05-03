import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
        Overview
      </h2>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Signed in as{" "}
        <span className="font-mono text-zinc-800 dark:text-zinc-200">
          {user?.email ?? "unknown"}
        </span>
      </p>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Project list and feedback feed will go here next.
      </p>
    </div>
  );
}
