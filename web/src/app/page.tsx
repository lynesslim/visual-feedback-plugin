import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-16 dark:bg-zinc-950">
      <main className="max-w-lg text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          AgencyFeedback
        </h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          Dashboard for viewing client pins on staging sites. Embed the widget on
          client sites; staff sign in here.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Staff sign in
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            Open dashboard
          </Link>
        </div>
        <p className="mt-10 text-left text-xs text-zinc-500 dark:text-zinc-500">
          Copy{" "}
          <code className="rounded bg-zinc-200 px-1 py-0.5 font-mono dark:bg-zinc-800">
            web/.env.example
          </code>{" "}
          to{" "}
          <code className="rounded bg-zinc-200 px-1 py-0.5 font-mono dark:bg-zinc-800">
            .env.local
          </code>{" "}
          and add your Supabase URL and keys before signing in.
        </p>
      </main>
    </div>
  );
}
