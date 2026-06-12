import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function LlmProvidersPage() {
  const supabase = await createClient();

  const { data: providers, count } = await supabase
    .from("llm_providers")
    .select("id, name, created_datetime_utc", { count: "exact" })
    .order("name", { ascending: true });

  const rows = providers ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">LLM Providers</h1>
          <p className="mt-1 text-sm text-gray-600">
            {count?.toLocaleString() ?? 0} total
          </p>
        </div>
        <Link
          href="/llm-providers/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + New provider
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
          <p className="text-sm text-gray-500">No providers yet.</p>
          <Link
            href="/llm-providers/new"
            className="mt-3 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Add the first one →
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Added</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {p.name}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(p.created_datetime_utc).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric", year: "numeric" }
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/llm-providers/${p.id}/edit`}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700"
                    >
                      Edit →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}