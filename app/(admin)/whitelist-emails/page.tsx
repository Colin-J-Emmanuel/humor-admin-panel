import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function WhitelistEmailsPage() {
  const supabase = await createClient();

  const { data: emails, count } = await supabase
    .from("whitelist_email_addresses")
    .select("id, email_address, created_datetime_utc", { count: "exact" })
    .order("email_address", { ascending: true });

  const rows = emails ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Whitelisted Emails
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {count?.toLocaleString() ?? 0} total
          </p>
        </div>
        <Link
          href="/whitelist-emails/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + New email
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
          <p className="text-sm text-gray-500">No whitelisted emails yet.</p>
          <Link
            href="/whitelist-emails/new"
            className="mt-3 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Add the first one →
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Added</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {e.email_address}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(e.created_datetime_utc).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric", year: "numeric" }
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/whitelist-emails/${e.id}/edit`}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700"
                    >
                      Edit →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}