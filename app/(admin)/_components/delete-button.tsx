"use client";

import { useState, useTransition } from "react";

type DeleteAction = () => Promise<{ error?: string } | void>;

export function DeleteButton({
  action,
  label = "Delete",
  confirmPrompt = "Are you sure?",
  confirmLabel = "Yes, delete",
}: {
  action: DeleteAction;
  label?: string;
  confirmPrompt?: string;
  confirmLabel?: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result?.error) {
        setError(result.error);
        setConfirming(false);
      }
      // success path: server action redirects
    });
  }

  if (!confirming) {
    return (
      <>
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100"
        >
          {label}
        </button>
        {error && <p className="mt-2 text-xs text-red-700">{error}</p>}
      </>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-red-900">{confirmPrompt}</span>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
      >
        {isPending ? "Deleting…" : confirmLabel}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        Cancel
      </button>
    </div>
  );
}