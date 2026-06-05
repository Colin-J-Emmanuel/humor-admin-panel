import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ImagesPage() {
  const supabase = await createClient();

  const { data: images, count } = await supabase
    .from("humor_project_images")
    .select("id, url, image_description, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(60);

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Images</h1>
          <p className="mt-1 text-sm text-gray-600">
            {count?.toLocaleString() ?? 0} total
          </p>
        </div>
        <Link
          href="/images/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + New image
        </Link>
      </div>

      {(images ?? []).length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
          <p className="text-sm text-gray-500">No images yet.</p>
          <Link
            href="/images/new"
            className="mt-3 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Create the first one →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {(images ?? []).map((img) => (
            <div
              key={img.id}
              className="group rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="aspect-square bg-gray-100">
                {img.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={img.url}
                    alt={img.image_description || "image"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                    No URL
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="text-sm text-gray-800 line-clamp-2">
                  {img.image_description || (
                    <span className="italic text-gray-400">No description</span>
                  )}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {img.created_at
                      ? new Date(img.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—"}
                  </span>
                  <Link
                    href={`/images/${img.id}/edit`}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700"
                  >
                    Edit →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}