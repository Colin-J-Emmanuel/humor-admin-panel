import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

export default async function LlmResponsesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("llm_model_responses")
    .select(
      "id, llm_model_response, processing_time_seconds, llm_model_id, humor_flavor_id, created_datetime_utc",
      { count: "exact" }
    )
    .order("created_datetime_utc", { ascending: false })
    .limit(PAGE_SIZE);

  if (q) {
    const safe = q.replace(/[%]/g, "").slice(0, 200);
    query = query.ilike("llm_model_response", `%${safe}%`);
  }

  const { data: responses, count } = await query;
  const rows = responses ?? [];

  const modelIds = Array.from(
    new Set(rows.map((r) => r.llm_model_id).filter(Boolean))
  );
  const flavorIds = Array.from(
    new Set(rows.map((r) => r.humor_flavor_id).filter(Boolean))
  );

  const modelMap = new Map<number, string>();
  const flavorMap = new Map<number, string>();
  if (modelIds.length) {
    const { data } = await supabase
      .from("llm_models")
      .select("id, name")
      .in("id", modelIds);
    (data ?? []).forEach((m) => modelMap.set(m.id, m.name));
  }
  if (flavorIds.length) {
    const { data } = await supabase
      .from("humor_flavors")
      .select("id, slug")
      .in("id", flavorIds);
    (data ?? []).forEach((f) => flavorMap.set(f.id, f.slug));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">LLM Responses</h1>
        <p className="mt-1 text-sm text-gray-600">
          {count?.toLocaleString() ?? 0} total responses
          {q && ` · filtered by "${q}"`}
        </p>
      </div>

      <form className="flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search response text…"
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
            href="/llm-responses"
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
              <th className="px-4 py-3">Response</th>
              <th className="px-4 py-3">Model</th>
              <th className="px-4 py-3">Flavor</th>
              <th className="px-4 py-3 text-right">Time</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="max-w-md px-4 py-3 text-gray-800">
                  <p className="line-clamp-2">
                    {r.llm_model_response || (
                      <span className="italic text-gray-400">empty</span>
                    )}
                  </p>
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {modelMap.get(r.llm_model_id) ?? `#${r.llm_model_id}`}
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {r.humor_flavor_id != null
                    ? flavorMap.get(r.humor_flavor_id) ?? `#${r.humor_flavor_id}`
                    : "—"}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-gray-500">
                  {r.processing_time_seconds}s
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {new Date(r.created_datetime_utc).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-sm text-gray-500"
                >
                  No responses match this search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {count != null && count > PAGE_SIZE && (
        <p className="text-xs text-gray-500">
          Showing the {PAGE_SIZE} most recent of {count.toLocaleString()}{" "}
          responses{q ? " matching the search" : ""}.
        </p>
      )}
    </div>
  );
}