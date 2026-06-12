"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type ActionResult = { error?: string };

export async function updateImage(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const payload = {
    url: (formData.get("url") as string)?.trim() || null,
    image_description:
      (formData.get("image_description") as string)?.trim() || null,
    additional_context:
      (formData.get("additional_context") as string)?.trim() || null,
    is_common_use: formData.get("is_common_use") === "on",
    is_public: formData.get("is_public") === "on",
    modified_by_user_id: user.id,
    modified_datetime_utc: new Date().toISOString(),
  };

  const { error } = await supabase.from("images").update(payload).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/images");
  revalidatePath(`/images/${id}/edit`);
  redirect("/images");
}

export async function deleteImage(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("images").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/images");
  redirect("/images");
}
