import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ImageForm } from "../../_components/image-form";
import { DeleteButton } from "../../_components/delete-button";

export const dynamic = "force-dynamic";

export default async function EditImagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: image, error } = await supabase
    .from("images")
    .select("id, url, image_description, additional_context, is_common_use, is_public")
    .eq("id", id)
    .single();

  if (error || !image) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit image</h1>
        <p className="mt-1 text-sm text-gray-600">Update or delete this image.</p>
      </div>

      <ImageForm
        imageId={String(image.id)}
        initial={{
          url: image.url ?? "",
          image_description: image.image_description ?? "",
          additional_context: image.additional_context ?? "",
          is_common_use: image.is_common_use ?? false,
          is_public: image.is_public ?? false,
        }}
      />

      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="text-sm font-semibold text-red-900">Danger zone</h2>
        <p className="mt-1 text-xs text-red-700">Permanently delete this image.</p>
        <div className="mt-3">
          <DeleteButton imageId={String(image.id)} />
        </div>
      </div>
    </div>
  );
}
