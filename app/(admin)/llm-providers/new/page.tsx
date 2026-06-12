import { LlmProviderForm } from "../_components/llm-provider-form";

export default function NewLlmProviderPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">New LLM provider</h1>
        <p className="mt-1 text-sm text-gray-600">
          Register a new model provider.
        </p>
      </div>
      <LlmProviderForm />
    </div>
  );
}