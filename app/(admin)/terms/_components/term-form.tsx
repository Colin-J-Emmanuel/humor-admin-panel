"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createTerm, updateTerm, type ActionResult } from "../actions";
import { Field } from "../../_components/field";

type TermType = { id: number; name: string };

type Props = {
  termId?: string;
  termTypes: TermType[];
  initial?: {
    term: string;
    definition: string;
    example: string;
    priority: number;
    term_type_id: number | null;
  };
};

const DEFAULT_INITIAL = {
  term: "",
  definition: "",
  example: "",
  priority: 0,
  term_type_id: null as number | null,
};

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

export function TermForm({ termId, termTypes, initial = DEFAULT_INITIAL }: Props) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    async (_prev, formData) => {
      if (termId) return updateTerm(termId, formData);
      return createTerm(formData);
    },
    null
  );

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <Field label="Term" required>
        <input type="text" name="term" defaultValue={initial.term} required className={inputClass} />
      </Field>

      <Field label="Definition" required>
        <textarea name="definition" defaultValue={initial.definition} required rows={2} className={inputClass} />
      </Field>

      <Field label="Example" required>
        <textarea name="example" defaultValue={initial.example} required rows={2} className={inputClass} />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Priority" required hint="Lower shows first.">
          <input type="number" name="priority" defaultValue={initial.priority} required className={inputClass} />
        </Field>

        <Field label="Type" hint="Optional category.">
          <select name="term_type_id" defaultValue={initial.term_type_id ?? ""} className={inputClass}>
            <option value="">— None —</option>
            {termTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

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
          {pending ? "Saving…" : termId ? "Save changes" : "Create term"}
        </button>
        <Link href="/terms" className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Cancel
        </Link>
      </div>
    </form>
  );
}