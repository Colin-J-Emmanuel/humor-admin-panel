"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  createCaptionExample,
  updateCaptionExample,
  type ActionResult,
} from "../actions";
import { Field } from "../../_components/field";

type Props = {
  exampleId?: string;
  initial?: {
    image_description: string;
    caption: string;
    explanation: string;
    priority: number;
    image_id: string;
  };
};

const DEFAULT_INITIAL = {
  image_description: "",
  caption: "",
  explanation: "",
  priority: 0,
  image_id: "",
};

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

export function CaptionExampleForm({
  exampleId,
  initial = DEFAULT_INITIAL,
}: Props) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    async (_prev, formData) => {
      if (exampleId) return updateCaptionExample(exampleId, formData);
      return createCaptionExample(formData);
    },
    null
  );

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <Field label="Image description" required hint="What the image shows.">
        <textarea name="image_description" defaultValue={initial.image_description} required rows={2} className={inputClass} />
      </Field>

      <Field label="Caption" required hint="The example caption for the image.">
        <textarea name="caption" defaultValue={initial.caption} required rows={2} className={inputClass} />
      </Field>

      <Field label="Explanation" required hint="Why this caption works.">
        <textarea name="explanation" defaultValue={initial.explanation} required rows={2} className={inputClass} />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Priority" required hint="Lower shows first.">
          <input type="number" name="priority" defaultValue={initial.priority} required className={inputClass} />
        </Field>

        <Field label="Image ID" hint="Optional UUID of a linked image.">
          <input type="text" name="image_id" defaultValue={initial.image_id} placeholder="(optional)" className={inputClass} />
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
          {pending ? "Saving…" : exampleId ? "Save changes" : "Create example"}
        </button>
        <Link href="/caption-examples" className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Cancel
        </Link>
      </div>
    </form>
  );
}