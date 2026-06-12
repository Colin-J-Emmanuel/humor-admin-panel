import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

export default async function CaptionExamplesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();

  const { data: examples, count } = await supabase
    .from("caption_examples")
    .select("id, image_description, caption, priority, image_id", { count: "exact" })
    .order("created_datetime_utc", { ascending: false })
    .range(from, to);

  const rows = examples ?? [];
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const imageIds = Array.from(
    new Set(rows.map((e) => e.image_id).filter(Boolean))
  );
  const imageMap = new Map<string, string | null>();
  if (imageIds.length) {
    const { data } = await supabase
      .from("images")
      .select("id, url")
      .in("id", imageIds);
    (data ?? []).forEach((i) => imageMap.set(i.id, i.url));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Caption Examples</h1>
          <p className="mt-1 text-sm text-gray-600">{total.toLocaleString()} total</p>
        </div>
        <Link
          href="/caption-examples/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + New example
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
          <p className="text-sm text-gray-500">No caption examples yet.</p>
          <Link
            href="/caption-examples/new"
            className="mt-3 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Add the first one →
          </Link>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-4 py-3">Image</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Caption</th>
                  <th className="px-4 py-3 text-right">Priority</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((e) => {
                  const url = e.image_id ? imageMap.get(e.image_id) : null;
                  return (
                    <tr key={e.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={url}
                            alt=""
                            className="h-10 w-10 rounded border border-gray-200 object-cover"
                          />
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="max-w-xs px-4 py-3 text-gray-600">
                        <p className="line-clamp-2">{e.image_description}</p>
                      </td>
                      <td className="max-w-xs px-4 py-3 text-gray-800">
                        <p className="line-clamp-2">{e.caption}</p>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-gray-500">
                        {e.priority}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/caption-examples/${e.id}/edit`}
                          className="text-xs font-medium text-blue-600 hover:text-blue-700"
                        >
                          Edit →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Showing {from + 1}–{Math.min(from + PAGE_SIZE, total)} of{" "}
              {total.toLocaleString()}
            </p>
            <div className="flex items-center gap-2">
              {currentPage > 1 ? (
                <Link
                  href={`/caption-examples?page=${currentPage - 1}`}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  ← Prev
                </Link>
              ) : (
                <span className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-300">
                  ← Prev
                </span>
              )}
              <span className="px-2 text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              {currentPage < totalPages ? (
                <Link
                  href={`/caption-examples?page=${currentPage + 1}`}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Next →
                </Link>
              ) : (
                <span className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-300">
                  Next →
                </span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
