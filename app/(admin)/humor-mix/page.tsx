import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HumorMixPage() {
  const supabase = await createClient();

  const { data: mix, count } = await supabase
    .from("humor_flavor_mix")
    .select("id, humor_flavor_id, caption_count, modified_datetime_utc", {
      count: "exact",
    })
    .order("humor_flavor_id", { ascending: true });

  const rows = mix ?? [];

  const flavorIds = Array.from(
    new Set(rows.map((m) => m.humor_flavor_id).filter(Boolean))
  );
  const flavorMap = new Map<number, string>();
  if (flavorIds.length) {
    const { data } = await supabase
      .from("humor_flavors")
      .select("id, slug")
      .in("id", flavorIds);
    (data ?? []).forEach((f) => flavorMap.set(f.id, f.slug));
  }

  const totalCaptions = rows.reduce(
    (sum, m) => sum + (m.caption_count ?? 0),
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Humor Mix</h1>
        <p className="mt-1 text-sm text-gray-600">
          {count?.toLocaleString() ?? 0} flavors ·{" "}
          {totalCaptions.toLocaleString()} captions per generation
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-4 py-3">Flavor</th>
              <th className="px-4 py-3 text-right">Caption Count</th>
              <th className="px-4 py-3">Last Modified</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">
                  {flavorMap.get(m.humor_flavor_id) ?? `#${m.humor_flavor_id}`}
                </td>
                <td className="px-4 py-3 text-right font-semibold tabular-nums text-gray-900">
                  {m.caption_count}
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {new Date(m.modified_datetime_utc).toLocaleDateString(
                    "en-US",
                    { month: "short", day: "numeric", year: "numeric" }
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-10 text-center text-sm text-gray-500"
                >
                  No humor mix entries found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-500">
        Inline editing of caption counts comes with the CRUD phase.
      </p>
    </div>
  );
}