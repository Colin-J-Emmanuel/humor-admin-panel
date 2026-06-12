import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 100;

export default async function FlavorsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("humor_flavors")
    .select("id, slug, description, is_pinned, created_datetime_utc", {
      count: "exact",
    })
    .order("slug", { ascending: true })
    .limit(PAGE_SIZE);

  if (q) {
    const safe = q.replace(/[,()'"]/g, "").slice(0, 100);
    query = query.or(`slug.ilike.%${safe}%,description.ilike.%${safe}%`);
  }

  const { data: flavors, count } = await query;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Humor Flavors</h1>
        <p className="mt-1 text-sm text-gray-600">
          {count?.toLocaleString() ?? 0} total flavors
          {q && ` · filtered by "${q}"`}
        </p>
      </div>

      <form className="flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search by slug or description…"
          className="flex-1 max-w-md rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Search
        </button>
        {q && (
          <Link
            href="/flavors"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Clear
          </Link>
        )}
      </form>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Pinned</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(flavors ?? []).map((f) => (
              <tr key={f.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 tabular-nums text-gray-500">{f.id}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{f.slug}</td>
                <td className="max-w-md px-4 py-3 text-gray-600">
                  <p className="line-clamp-2">
                    {f.description || (
                      <span className="italic text-gray-400">—</span>
                    )}
                  </p>
                </td>
                <td className="px-4 py-3">
                  {f.is_pinned && (
                    <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                      pinned
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {new Date(f.created_datetime_utc).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
              </tr>
            ))}
            {(flavors ?? []).length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-sm text-gray-500"
                >
                  No flavors found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}