import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WhitelistEmailForm } from "../../_components/whitelist-email-form";
import { DeleteButton } from "../../../_components/delete-button";
import { deleteWhitelistEmail } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditWhitelistEmailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: row, error } = await supabase
    .from("whitelist_email_addresses")
    .select("id, email_address")
    .eq("id", id)
    .single();

  if (error || !row) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Edit whitelisted email
        </h1>
        <p className="mt-1 text-sm text-gray-600">Update or remove this email.</p>
      </div>

      <WhitelistEmailForm
        emailId={String(row.id)}
        initial={{ email_address: row.email_address ?? "" }}
      />

      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="text-sm font-semibold text-red-900">Danger zone</h2>
        <p className="mt-1 text-xs text-red-700">
          Permanently remove this email from the whitelist.
        </p>
        <div className="mt-3">
          <DeleteButton
            action={deleteWhitelistEmail.bind(null, String(row.id))}
            label="Delete email"
          />
        </div>
      </div>
    </div>
  );
}