import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

export default async function CaptionRequestsPage() {
  const supabase = await createClient();

  const { data: requests, count } = await supabase
    .from("caption_requests")
    .select("id, profile_id, image_id, created_datetime_utc", {
      count: "exact",
    })
    .order("created_datetime_utc", { ascending: false })
    .limit(PAGE_SIZE);

  const rows = requests ?? [];

  const profileIds = Array.from(
    new Set(rows.map((r) => r.profile_id).filter(Boolean))
  );
  const imageIds = Array.from(
    new Set(rows.map((r) => r.image_id).filter(Boolean))
  );

  const profileMap = new Map<string, string | null>();
  const imageMap = new Map<string, string | null>();

  if (profileIds.length) {
    const { data } = await supabase
      .from("profiles")
      .select("id, email")
      .in("id", profileIds);
    (data ?? []).forEach((p) => profileMap.set(p.id, p.email));
  }
  if (imageIds.length) {
    const { data } = await supabase
      .from("images")
      .select("id, url")
      .in("id", imageIds);
    (data ?? []).forEach((i) => imageMap.set(i.id, i.url));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Caption Requests</h1>
        <p className="mt-1 text-sm text-gray-600">
          {count?.toLocaleString() ?? 0} total requests
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-4 py-3">Request</th>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Requester</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((r) => {
              const url = imageMap.get(r.image_id);
              return (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 tabular-nums text-gray-500">
                    #{r.id}
                  </td>
                  <td className="px-4 py-3">
                    {url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={url}
                        alt=""
                        className="h-10 w-10 rounded border border-gray-200 object-cover"
                      />
                    ) : (
                      <span className="text-xs text-gray-400">no image</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {profileMap.get(r.profile_id) ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(r.created_datetime_utc).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric", year: "numeric" }
                    )}
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-10 text-center text-sm text-gray-500"
                >
                  No caption requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {count != null && count > PAGE_SIZE && (
        <p className="text-xs text-gray-500">
          Showing the {PAGE_SIZE} most recent of {count.toLocaleString()}{" "}
          requests.
        </p>
      )}
    </div>
  );
}