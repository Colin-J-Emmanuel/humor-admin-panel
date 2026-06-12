"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createLlmModel, updateLlmModel, type ActionResult } from "../actions";
import { Field } from "../../_components/field";

type Provider = { id: number; name: string };

type Props = {
  modelId?: string;
  providers: Provider[];
  initial?: {
    name: string;
    provider_model_id: string;
    llm_provider_id: number | null;
    is_temperature_supported: boolean;
  };
};

const DEFAULT_INITIAL = {
  name: "",
  provider_model_id: "",
  llm_provider_id: null as number | null,
  is_temperature_supported: true,
};

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

export function LlmModelForm({ modelId, providers, initial = DEFAULT_INITIAL }: Props) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    async (_prev, formData) => {
      if (modelId) return updateLlmModel(modelId, formData);
      return createLlmModel(formData);
    },
    null
  );

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <Field label="Display name" required hint="e.g. GPT-4.1, GPT-4o-mini.">
        <input type="text" name="name" defaultValue={initial.name} required className={inputClass} />
      </Field>

      <Field label="Provider" required>
        <select name="llm_provider_id" defaultValue={initial.llm_provider_id ?? ""} required className={inputClass}>
          <option value="" disabled>
            — Select a provider —
          </option>
          {providers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Provider model ID" required hint="The provider's own identifier, e.g. gpt-4.1-2025-04-14.">
        <input type="text" name="provider_model_id" defaultValue={initial.provider_model_id} required className={inputClass} />
      </Field>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          name="is_temperature_supported"
          defaultChecked={initial.is_temperature_supported}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-sm font-medium text-gray-700">
          Temperature supported
        </span>
      </label>

      {state?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div className="flex items-center gap-3 border-t border-gray-100 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Saving…" : modelId ? "Save changes" : "Create model"}
        </button>
        <Link href="/llm-models" className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Cancel
        </Link>
      </div>
    </form>
  );
}