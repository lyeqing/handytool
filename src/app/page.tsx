import Link from "next/link";
import { listDefinitions } from "@/lib/handytool-api";

export default async function Home() {
  const result = await listDefinitions();

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">HandyTool</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Every schema below is metadata. Records of all of them share one table
        and one C# entity.
      </p>

      <Link
        href="/schemas/new"
        className="mt-6 inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
      >
        Create a schema
      </Link>

      <div className="mt-8">
        {!result.ok ? (
          <p className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            {result.message}
          </p>
        ) : result.data.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No schemas yet.
          </p>
        ) : (
          <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
            {result.data.map((definition) => (
              <li
                key={definition.id}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {definition.name}
                  </p>
                  <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                    #{definition.id} · {definition.description || "No description."}
                  </p>
                </div>
                <Link
                  href={`/schemas/${definition.id}/records/new`}
                  className="shrink-0 rounded-md border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
                >
                  Add instance
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
