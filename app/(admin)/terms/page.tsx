import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 100;

export default async function TermsPage() {
  const supabase = await createClient();

  const { data: terms, count } = await supabase
    .from("terms")
    .select("id, term, definition, priority, term_type_id", { count: "exact" })
    .order("priority", { ascending: true })
    .order("term", { ascending: true })
    .limit(PAGE_SIZE);

  const rows = terms ?? [];

  const typeIds = Array.from(
    new Set(rows.map((t) => t.term_type_id).filter(Boolean))
  );
  const typeMap = new Map<number, string>();
  if (typeIds.length) {
    const { data } = await supabase
      .from("term_types")
      .select("id, name")
      .in("id", typeIds);
    (data ?? []).forEach((t) => typeMap.set(t.id, t.name));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Terms</h1>
          <p className="mt-1 text-sm text-gray-600">
            {count?.toLocaleString() ?? 0} total
          </p>
        </div>
        <Link
          href="/terms/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + New term
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
          <p className="text-sm text-gray-500">No terms yet.</p>
          <Link
            href="/terms/new"
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
                <th className="px-4 py-3">Term</th>
                <th className="px-4 py-3">Definition</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3 text-right">Priority</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{t.term}</td>
                  <td className="max-w-md px-4 py-3 text-gray-600">
                    <p className="line-clamp-2">{t.definition}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {t.term_type_id != null
                      ? typeMap.get(t.term_type_id) ?? `#${t.term_type_id}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-500">
                    {t.priority}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/terms/${t.id}/edit`}
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