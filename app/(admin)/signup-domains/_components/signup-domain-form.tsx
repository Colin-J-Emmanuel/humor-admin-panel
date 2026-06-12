"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  createSignupDomain,
  updateSignupDomain,
  type ActionResult,
} from "../actions";

type Props = {
  domainId?: string;
  initial?: { apex_domain: string };
};

export function SignupDomainForm({
  domainId,
  initial = { apex_domain: "" },
}: Props) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    async (_prev, formData) => {
      if (domainId) return updateSignupDomain(domainId, formData);
      return createSignupDomain(formData);
    },
    null
  );

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <label className="block">
        <span className="text-sm font-medium text-gray-700">
          Apex domain<span className="ml-1 text-red-500">*</span>
        </span>
        <span className="mt-0.5 block text-xs text-gray-500">
          The bare domain allowed to register, e.g. columbia.edu (no @, no
          subdomain).
        </span>
        <div className="mt-1.5">
          <input
            type="text"
            name="apex_domain"
            defaultValue={initial.apex_domain}
            required
            placeholder="columbia.edu"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
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
          {pending ? "Saving…" : domainId ? "Save changes" : "Add domain"}
        </button>
        <Link
          href="/signup-domains"
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}