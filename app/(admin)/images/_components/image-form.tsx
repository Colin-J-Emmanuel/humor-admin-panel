"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createImage, updateImage, type ActionResult } from "../actions";

type InitialValues = {
  url: string;
  image_description: string;
};

type Props = {
  imageId?: string;
  initial?: InitialValues;
};

const DEFAULT_INITIAL: InitialValues = {
  url: "",
  image_description: "",
};

export function ImageForm({ imageId, initial = DEFAULT_INITIAL }: Props) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    async (_prev, formData) => {
      if (imageId) {
        return updateImage(imageId, formData);
      }
      return createImage(formData);
    },
    null
  );

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <Field label="Image URL" required hint="Direct link to the hosted image.">
        <input
          type="url"
          name="url"
          defaultValue={initial.url}
          required
          placeholder="https://..."
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </Field>

      <Field
        label="Description"
        hint="A short caption-like description of the image."
      >
        <textarea
          name="image_description"
          defaultValue={initial.image_description}
          rows={2}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </Field>

      {state?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? "Saving…" : imageId ? "Save changes" : "Create image"}
        </button>
        <Link
          href="/images"
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </span>
      {hint && (
        <span className="block text-xs text-gray-500 mt-0.5">{hint}</span>
      )}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}