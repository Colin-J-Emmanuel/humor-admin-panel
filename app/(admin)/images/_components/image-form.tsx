"use client";

import { useActionState } from "react";
import Link from "next/link";
import { updateImage, type ActionResult } from "../actions";
import { Field } from "../../_components/field";

type InitialValues = {
  url: string;
  image_description: string;
  additional_context: string;
  is_common_use: boolean;
  is_public: boolean;
};

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

export function ImageForm({
  imageId,
  initial,
}: {
  imageId: string;
  initial: InitialValues;
}) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    async (_prev, formData) => updateImage(imageId, formData),
    null
  );

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <Field label="Image URL" hint="Direct link to the hosted image.">
        <input type="url" name="url" defaultValue={initial.url} placeholder="https://..." className={inputClass} />
      </Field>

      <Field label="Description" hint="What the image shows.">
        <textarea name="image_description" defaultValue={initial.image_description} rows={2} className={inputClass} />
      </Field>

      <Field label="Additional context" hint="Optional notes.">
        <textarea name="additional_context" defaultValue={initial.additional_context} rows={2} className={inputClass} />
      </Field>

      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="is_common_use" defaultChecked={initial.is_common_use} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
          <span className="text-sm font-medium text-gray-700">Common use</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="is_public" defaultChecked={initial.is_public} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
          <span className="text-sm font-medium text-gray-700">Public</span>
        </label>
      </div>

      {state?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div className="flex items-center gap-3 border-t border-gray-100 pt-2">
        <button type="submit" disabled={pending} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
          {pending ? "Saving…" : "Save changes"}
        </button>
        <Link href="/images" className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Cancel
        </Link>
      </div>
    </form>
  );
}
