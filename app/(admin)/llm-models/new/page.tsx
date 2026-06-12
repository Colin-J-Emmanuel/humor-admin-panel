import { createClient } from "@/lib/supabase/server";
import { LlmModelForm } from "../_components/llm-model-form";

export const dynamic = "force-dynamic";

export default async function NewLlmModelPage() {
  const supabase = await createClient();
  const { data: providers } = await supabase
    .from("llm_providers")
    .select("id, name")
    .order("name", { ascending: true });

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">New LLM model</h1>
        <p className="mt-1 text-sm text-gray-600">Register a model under a provider.</p>
      </div>
      <LlmModelForm providers={providers ?? []} />
    </div>
  );
}