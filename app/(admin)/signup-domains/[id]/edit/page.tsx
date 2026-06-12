import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignupDomainForm } from "../../_components/signup-domain-form";
import { DeleteButton } from "../../../_components/delete-button";
import { deleteSignupDomain } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditSignupDomainPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: domain, error } = await supabase
    .from("allowed_signup_domains")
    .select("id, apex_domain")
    .eq("id", id)
    .single();

  if (error || !domain) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit signup domain</h1>
        <p className="mt-1 text-sm text-gray-600">
          Update or remove this domain.
        </p>
      </div>

      <SignupDomainForm
        domainId={String(domain.id)}
        initial={{ apex_domain: domain.apex_domain ?? "" }}
      />

      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="text-sm font-semibold text-red-900">Danger zone</h2>
        <p className="mt-1 text-xs text-red-700">
          Permanently remove this domain. New users with this email domain may no
          longer be able to register.
        </p>
        <div className="mt-3">
          <DeleteButton
            action={deleteSignupDomain.bind(null, String(domain.id))}
            label="Delete domain"
          />
        </div>
      </div>
    </div>
  );
}