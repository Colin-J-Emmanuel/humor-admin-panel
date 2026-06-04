// export default function UsersPage() {
//   return (
//     <div>
//       <h1 className="text-3xl font-bold text-gray-900">Users</h1>
//       <p className="mt-1 text-sm text-gray-600">Coming in Chunk B.</p>
//     </div>
//   );
// }

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("profiles")
    .select(
      "id, email, first_name, last_name, is_superadmin, is_in_study, is_matrix_admin, created_datetime_utc",
      { count: "exact" }
    )
    .order("created_datetime_utc", { ascending: false })
    .limit(PAGE_SIZE);

  if (q) {
    // Strip characters that could break the PostgREST `or` filter syntax
    const safe = q.replace(/[,()'"]/g, "").slice(0, 100);
    query = query.or(
      `email.ilike.%${safe}%,first_name.ilike.%${safe}%,last_name.ilike.%${safe}%`
    );
  }

  const { data: profiles, count } = await query;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
        <p className="mt-1 text-sm text-gray-600">
          {count?.toLocaleString() ?? 0} total profiles
          {q && ` · filtered by "${q}"`}
        </p>
      </div>

      <form className="flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search by email or name…"
          className="flex-1 max-w-md rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Search
        </button>
        {q && (
          <Link
            href="/users"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Clear
          </Link>
        )}
      </form>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Roles</th>
              <th className="px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(profiles ?? []).map((p) => {
              const fullName = [p.first_name, p.last_name]
                .filter(Boolean)
                .join(" ");
              return (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-800">
                    {fullName || (
                      <span className="text-gray-400 italic">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {p.email ?? <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {p.is_superadmin && (
                        <RoleBadge color="purple">superadmin</RoleBadge>
                      )}
                      {p.is_matrix_admin && (
                        <RoleBadge color="blue">matrix</RoleBadge>
                      )}
                      {p.is_in_study && (
                        <RoleBadge color="emerald">in study</RoleBadge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(p.created_datetime_utc).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric", year: "numeric" }
                    )}
                  </td>
                </tr>
              );
            })}
            {(profiles ?? []).length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-10 text-center text-sm text-gray-500"
                >
                  No users match this search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {count != null && count > PAGE_SIZE && (
        <p className="text-xs text-gray-500">
          Showing first {PAGE_SIZE} of {count.toLocaleString()} users
          {q ? " matching the search" : ""}. Refine your search to narrow.
        </p>
      )}
    </div>
  );
}

function RoleBadge({
  color,
  children,
}: {
  color: "purple" | "blue" | "emerald";
  children: React.ReactNode;
}) {
  const map = {
    purple: "bg-purple-100 text-purple-700",
    blue: "bg-blue-100 text-blue-700",
    emerald: "bg-emerald-100 text-emerald-700",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${map[color]}`}
    >
      {children}
    </span>
  );
}