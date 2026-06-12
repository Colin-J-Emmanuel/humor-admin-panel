"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type ActionResult = { error?: string };

export async function updateHumorMix(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const raw = (formData.get("caption_count") as string)?.trim();
  if (!raw) return { error: "Caption count is required" };
  const caption_count = Number(raw);
  if (!Number.isInteger(caption_count) || caption_count < 0) {
    return { error: "Caption count must be a non-negative whole number" };
  }

  const { error } = await supabase
    .from("humor_flavor_mix")
    .update({
      caption_count,
      modified_by_user_id: user.id,
      modified_datetime_utc: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/humor-mix");
  revalidatePath(`/humor-mix/${id}/edit`);
  redirect("/humor-mix");
}