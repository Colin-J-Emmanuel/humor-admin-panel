import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function LlmModelsPage() {
  const supabase = await createClient();

  const { data: models, count } = await supabase
    .from("llm_models")
    .select("id, name, provider_model_id, llm_provider_id, is_temperature_supported", {
      count: "exact",
    })
    .order("name", { ascending: true });

  const rows = models ?? [];

  const providerIds = Array.from(
    new Set(rows.map((m) => m.llm_provider_id).filter(Boolean))
  );
  const providerMap = new Map<number, string>();
  if (providerIds.length) {
    const { data } = await supabase
      .from("llm_providers")
      .select("id, name")
      .in("id", providerIds);
    (data ?? []).forEach((p) => providerMap.set(p.id, p.name));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">LLM Models</h1>
          <p className="mt-1 text-sm text-gray-600">
            {count?.toLocaleString() ?? 0} total
          </p>
        </div>
        <Link
          href="/llm-models/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + New model
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
          <p className="text-sm text-gray-500">No models yet.</p>
          <Link
            href="/llm-models/new"
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
                <th className="px-4 py-3">Provider</th>
                <th className="px-4 py-3">Provider Model ID</th>
                <th className="px-4 py-3">Temp?</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{m.name}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {m.llm_provider_id != null
                      ? providerMap.get(m.llm_provider_id) ?? `#${m.llm_provider_id}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">
                    {m.provider_model_id}
                  </td>
                  <td className="px-4 py-3">
                    {m.is_temperature_supported ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                        no
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/llm-models/${m.id}/edit`}
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