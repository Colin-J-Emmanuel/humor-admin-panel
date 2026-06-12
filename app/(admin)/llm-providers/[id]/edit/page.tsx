import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LlmProviderForm } from "../../_components/llm-provider-form";
import { DeleteButton } from "../../../_components/delete-button";
import { deleteLlmProvider } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditLlmProviderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: row, error } = await supabase
    .from("llm_providers")
    .select("id, name")
    .eq("id", id)
    .single();

  if (error || !row) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit LLM provider</h1>
        <p className="mt-1 text-sm text-gray-600">
          Update or remove this provider.
        </p>
      </div>

      <LlmProviderForm
        providerId={String(row.id)}
        initial={{ name: row.name ?? "" }}
      />

      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="text-sm font-semibold text-red-900">Danger zone</h2>
        <p className="mt-1 text-xs text-red-700">
          Removing a provider may break models that reference it.
        </p>
        <div className="mt-3">
          <DeleteButton
            action={deleteLlmProvider.bind(null, String(row.id))}
            label="Delete provider"
          />
        </div>
      </div>
    </div>
  );
}