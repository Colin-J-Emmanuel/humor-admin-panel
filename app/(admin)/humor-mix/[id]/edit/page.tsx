import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { HumorMixForm } from "../../_components/humor-mix-form";

export const dynamic = "force-dynamic";

export default async function EditHumorMixPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: mix, error } = await supabase
    .from("humor_flavor_mix")
    .select("id, humor_flavor_id, caption_count")
    .eq("id", id)
    .single();

  if (error || !mix) notFound();

  let flavorLabel = `#${mix.humor_flavor_id}`;
  if (mix.humor_flavor_id != null) {
    const { data: flavor } = await supabase
      .from("humor_flavors")
      .select("slug")
      .eq("id", mix.humor_flavor_id)
      .single();
    if (flavor?.slug) flavorLabel = flavor.slug;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit humor mix</h1>
        <p className="mt-1 text-sm text-gray-600">
          Adjust how many captions this flavor contributes.
        </p>
      </div>
      <HumorMixForm
        mixId={String(mix.id)}
        flavorLabel={flavorLabel}
        initial={{ caption_count: mix.caption_count ?? 0 }}
      />
    </div>
  );
}