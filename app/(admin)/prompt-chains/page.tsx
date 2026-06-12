import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

export default async function PromptChainsPage() {
  const supabase = await createClient();

  const { data: chains, count } = await supabase
    .from("llm_prompt_chains")
    .select("id, caption_request_id, created_by_user_id, created_datetime_utc", {
      count: "exact",
    })
    .order("created_datetime_utc", { ascending: false })
    .limit(PAGE_SIZE);

  const rows = chains ?? [];

  const userIds = Array.from(
    new Set(rows.map((c) => c.created_by_user_id).filter(Boolean))
  );
  const userMap = new Map<string, string | null>();
  if (userIds.length) {
    const { data } = await supabase
      .from("profiles")
      .select("id, email")
      .in("id", userIds);
    (data ?? []).forEach((p) => userMap.set(p.id, p.email));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Prompt Chains</h1>
        <p className="mt-1 text-sm text-gray-600">
          {count?.toLocaleString() ?? 0} total chains
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-4 py-3">Chain</th>
              <th className="px-4 py-3">Caption Request</th>
              <th className="px-4 py-3">Created By</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 tabular-nums text-gray-500">#{c.id}</td>
                <td className="px-4 py-3 tabular-nums text-gray-700">
                  #{c.caption_request_id}
                </td>
                <td className="px-4 py-3 text-xs text-gray-600">
                  {userMap.get(c.created_by_user_id) ?? "—"}
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {new Date(c.created_datetime_utc).toLocaleDateString("en-US", {
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
                  colSpan={4}
                  className="px-4 py-10 text-center text-sm text-gray-500"
                >
                  No prompt chains found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {count != null && count > PAGE_SIZE && (
        <p className="text-xs text-gray-500">
          Showing the {PAGE_SIZE} most recent of {count.toLocaleString()} chains.
        </p>
      )}
    </div>
  );
}