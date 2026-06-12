import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LlmModelForm } from "../../_components/llm-model-form";
import { DeleteButton } from "../../../_components/delete-button";
import { deleteLlmModel } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditLlmModelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: model, error }, { data: providers }] = await Promise.all([
    supabase
      .from("llm_models")
      .select("id, name, provider_model_id, llm_provider_id, is_temperature_supported")
      .eq("id", id)
      .single(),
    supabase.from("llm_providers").select("id, name").order("name", { ascending: true }),
  ]);

  if (error || !model) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit LLM model</h1>
        <p className="mt-1 text-sm text-gray-600">Update or delete this model.</p>
      </div>

      <LlmModelForm
        modelId={String(model.id)}
        providers={providers ?? []}
        initial={{
          name: model.name ?? "",
          provider_model_id: model.provider_model_id ?? "",
          llm_provider_id: model.llm_provider_id ?? null,
          is_temperature_supported: model.is_temperature_supported ?? false,
        }}
      />

      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="text-sm font-semibold text-red-900">Danger zone</h2>
        <p className="mt-1 text-xs text-red-700">
          Removing a model may break flavor steps that reference it.
        </p>
        <div className="mt-3">
          <DeleteButton action={deleteLlmModel.bind(null, String(model.id))} label="Delete model" />
        </div>
      </div>
    </div>
  );
}