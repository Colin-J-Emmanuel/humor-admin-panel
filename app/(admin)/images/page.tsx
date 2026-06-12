import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 24;

export default async function ImagesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();
  const { data: images, count } = await supabase
    .from("images")
    .select("id, url, image_description, is_common_use, is_public, created_datetime_utc", { count: "exact" })
    .order("created_datetime_utc", { ascending: false })
    .range(from, to);

  const rows = images ?? [];
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Images</h1>
          <p className="mt-1 text-sm text-gray-600">{total.toLocaleString()} total</p>
        </div>
        <Link href="/images/new" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          + New image
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
          <p className="text-sm text-gray-500">No images yet.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {rows.map((img) => (
              <div key={img.id} className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                <div className="aspect-square bg-gray-100">
                  {img.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img.url} alt={img.image_description || "image"} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">No URL</div>
                  )}
                </div>
                <div className="p-3">
                  <p className="line-clamp-2 text-sm text-gray-800">
                    {img.image_description || <span className="italic text-gray-400">No description</span>}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {img.is_common_use && <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">common</span>}
                    {img.is_public && <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">public</span>}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {new Date(img.created_datetime_utc).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    <Link href={`/images/${img.id}/edit`} className="text-xs font-medium text-blue-600 hover:text-blue-700">Edit →</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Showing {from + 1}–{Math.min(from + PAGE_SIZE, total)} of {total.toLocaleString()}
            </p>
            <div className="flex items-center gap-2">
              {currentPage > 1 ? (
                <Link href={`/images?page=${currentPage - 1}`} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">← Prev</Link>
              ) : (
                <span className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-300">← Prev</span>
              )}
              <span className="px-2 text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
              {currentPage < totalPages ? (
                <Link href={`/images?page=${currentPage + 1}`} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Next →</Link>
              ) : (
                <span className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-300">Next →</span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
