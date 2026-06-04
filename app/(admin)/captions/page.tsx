// export default function CaptionsPage() {
//   return (
//     <div>
//       <h1 className="text-3xl font-bold text-gray-900">Captions</h1>
//       <p className="mt-1 text-sm text-gray-600">Coming in Chunk B.</p>
//     </div>
//   );
// }

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

type ProfileInfo = {
  email: string | null;
  first_name: string | null;
  last_name: string | null;
};

export default async function CaptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string }>;
}) {
  const { q, sort } = await searchParams;
  const sortBy = sort === "top" ? "like_count" : "created_datetime_utc";
  const supabase = await createClient();

  let query = supabase
    .from("captions")
    .select(
      "id, content, created_datetime_utc, like_count, profile_id, is_public, is_featured",
      { count: "exact" }
    )
    .order(sortBy, { ascending: false })
    .limit(PAGE_SIZE);

  if (q) {
    const safe = q.replace(/[%]/g, "").slice(0, 200);
    query = query.ilike("content", `%${safe}%`);
  }

  const { data: captions, count } = await query;

  // Fetch author info in one batch (avoids needing to know FK constraint name)
  const profileIds = Array.from(
    new Set((captions ?? []).map((c) => c.profile_id).filter(Boolean))
  );

  const profileMap = new Map<string, ProfileInfo>();
  if (profileIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email, first_name, last_name")
      .in("id", profileIds);
    (profiles ?? []).forEach((p) =>
      profileMap.set(p.id, {
        email: p.email,
        first_name: p.first_name,
        last_name: p.last_name,
      })
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Captions</h1>
        <p className="mt-1 text-sm text-gray-600">
          {count?.toLocaleString() ?? 0} total captions
          {q && ` · filtered by "${q}"`}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <form className="flex gap-2 flex-1 min-w-0">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search caption text…"
            className="flex-1 max-w-md rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {sort && <input type="hidden" name="sort" value={sort} />}
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Search
          </button>
          {q && (
            <Link
              href={`/captions${sort ? `?sort=${sort}` : ""}`}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Clear
            </Link>
          )}
        </form>

        <div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-0.5">
          <SortLink
            href={buildHref(q, undefined)}
            active={sortBy === "created_datetime_utc"}
          >
            Recent
          </SortLink>
          <SortLink href={buildHref(q, "top")} active={sortBy === "like_count"}>
            Top liked
          </SortLink>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Caption</th>
              <th className="px-4 py-3">Author</th>
              <th className="px-4 py-3 text-right">Likes</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Flags</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(captions ?? []).map((c) => {
              const author = profileMap.get(c.profile_id);
              const authorDisplay =
                author?.email ||
                [author?.first_name, author?.last_name]
                  .filter(Boolean)
                  .join(" ") ||
                "—";
              return (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-800 max-w-md">
                    <p className="line-clamp-2">
                      {c.content || (
                        <span className="text-gray-400 italic">empty</span>
                      )}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {authorDisplay}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900 tabular-nums">
                    {c.like_count?.toLocaleString() ?? 0}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(c.created_datetime_utc).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric", year: "numeric" }
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {c.is_featured && (
                        <FlagBadge color="amber">featured</FlagBadge>
                      )}
                      {!c.is_public && (
                        <FlagBadge color="gray">private</FlagBadge>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {(captions ?? []).length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-sm text-gray-500"
                >
                  No captions match this search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {count != null && count > PAGE_SIZE && (
        <p className="text-xs text-gray-500">
          Showing first {PAGE_SIZE} of {count.toLocaleString()} captions
          {q ? " matching the search" : ""}.
        </p>
      )}
    </div>
  );
}

function buildHref(q: string | undefined, sort: string | undefined) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (sort) params.set("sort", sort);
  const qs = params.toString();
  return `/captions${qs ? `?${qs}` : ""}`;
}

function SortLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
        active ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:text-gray-900"
      }`}
    >
      {children}
    </Link>
  );
}

function FlagBadge({
  color,
  children,
}: {
  color: "amber" | "gray";
  children: React.ReactNode;
}) {
  const map = {
    amber: "bg-amber-100 text-amber-700",
    gray: "bg-gray-100 text-gray-700",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${map[color]}`}
    >
      {children}
    </span>
  );
}