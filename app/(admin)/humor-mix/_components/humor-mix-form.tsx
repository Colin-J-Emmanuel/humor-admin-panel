"use client";

import { useActionState } from "react";
import Link from "next/link";
import { updateHumorMix, type ActionResult } from "../actions";
import { Field } from "../../_components/field";

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

export function HumorMixForm({
  mixId,
  flavorLabel,
  initial,
}: {
  mixId: string;
  flavorLabel: string;
  initial: { caption_count: number };
}) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    async (_prev, formData) => updateHumorMix(mixId, formData),
    null
  );

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <Field label="Flavor" hint="The flavor this mix entry belongs to (not editable).">
        <input
          type="text"
          defaultValue={flavorLabel}
          disabled
          className={`${inputClass} bg-gray-50 text-gray-500`}
        />
      </Field>

      <Field
        label="Caption count"
        required
        hint="How many captions this flavor contributes per generation."
      >
        <input
          type="number"
          name="caption_count"
          min={0}
          defaultValue={initial.caption_count}
          required
          className={inputClass}
        />
      </Field>

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
          {pending ? "Saving…" : "Save changes"}
        </button>
        <Link
          href="/humor-mix"
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}