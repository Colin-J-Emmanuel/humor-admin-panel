import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function FlavorStepsPage() {
  const supabase = await createClient();

  const { data: steps, count } = await supabase
    .from("humor_flavor_steps")
    .select(
      "id, humor_flavor_id, humor_flavor_step_type_id, llm_model_id, order_by, llm_temperature, description",
      { count: "exact" }
    )
    .order("humor_flavor_id", { ascending: true })
    .order("order_by", { ascending: true });

  const rows = steps ?? [];

  const flavorIds = Array.from(
    new Set(rows.map((s) => s.humor_flavor_id).filter(Boolean))
  );
  const stepTypeIds = Array.from(
    new Set(rows.map((s) => s.humor_flavor_step_type_id).filter(Boolean))
  );
  const modelIds = Array.from(
    new Set(rows.map((s) => s.llm_model_id).filter(Boolean))
  );

  const flavorMap = new Map<number, string>();
  const stepTypeMap = new Map<number, string>();
  const modelMap = new Map<number, string>();

  if (flavorIds.length) {
    const { data } = await supabase
      .from("humor_flavors")
      .select("id, slug")
      .in("id", flavorIds);
    (data ?? []).forEach((f) => flavorMap.set(f.id, f.slug));
  }
  if (stepTypeIds.length) {
    const { data } = await supabase
      .from("humor_flavor_step_types")
      .select("id, slug")
      .in("id", stepTypeIds);
    (data ?? []).forEach((t) => stepTypeMap.set(t.id, t.slug));
  }
  if (modelIds.length) {
    const { data } = await supabase
      .from("llm_models")
      .select("id, name")
      .in("id", modelIds);
    (data ?? []).forEach((m) => modelMap.set(m.id, m.name));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Flavor Steps</h1>
        <p className="mt-1 text-sm text-gray-600">
          {count?.toLocaleString() ?? 0} steps across all flavors
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-4 py-3">Flavor</th>
              <th className="px-4 py-3 text-right">Order</th>
              <th className="px-4 py-3">Step Type</th>
              <th className="px-4 py-3">Model</th>
              <th className="px-4 py-3 text-right">Temp</th>
              <th className="px-4 py-3">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">
                  {flavorMap.get(s.humor_flavor_id) ?? `#${s.humor_flavor_id}`}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-gray-500">
                  {s.order_by}
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {stepTypeMap.get(s.humor_flavor_step_type_id) ??
                    `#${s.humor_flavor_step_type_id}`}
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {modelMap.get(s.llm_model_id) ?? `#${s.llm_model_id}`}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-gray-500">
                  {s.llm_temperature ?? "—"}
                </td>
                <td className="max-w-xs px-4 py-3 text-gray-600">
                  <p className="line-clamp-2">
                    {s.description || (
                      <span className="italic text-gray-400">—</span>
                    )}
                  </p>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-sm text-gray-500"
                >
                  No flavor steps found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}