import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CaptionExampleForm } from "../../_components/caption-example-form";
import { DeleteButton } from "../../../_components/delete-button";
import { deleteCaptionExample } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditCaptionExamplePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: row, error } = await supabase
    .from("caption_examples")
    .select("id, image_description, caption, explanation, priority, image_id")
    .eq("id", id)
    .single();

  if (error || !row) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit caption example</h1>
        <p className="mt-1 text-sm text-gray-600">Update or delete this example.</p>
      </div>

      <CaptionExampleForm
        exampleId={String(row.id)}
        initial={{
          image_description: row.image_description ?? "",
          caption: row.caption ?? "",
          explanation: row.explanation ?? "",
          priority: row.priority ?? 0,
          image_id: row.image_id ?? "",
        }}
      />

      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="text-sm font-semibold text-red-900">Danger zone</h2>
        <p className="mt-1 text-xs text-red-700">Permanently delete this example.</p>
        <div className="mt-3">
          <DeleteButton action={deleteCaptionExample.bind(null, String(row.id))} label="Delete example" />
        </div>
      </div>
    </div>
  );
}