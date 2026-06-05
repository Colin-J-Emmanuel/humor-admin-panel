"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type ActionResult = {
  error?: string;
};

export async function createImage(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const url = (formData.get("url") as string)?.trim();
  if (!url) return { error: "URL is required" };

  const payload = {
    url,
    image_description:
      (formData.get("image_description") as string)?.trim() || null,
  };

  const { error } = await supabase
    .from("humor_project_images")
    .insert(payload);

  if (error) return { error: error.message };

  revalidatePath("/images");
  redirect("/images");
}

export async function updateImage(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const url = (formData.get("url") as string)?.trim();
  if (!url) return { error: "URL is required" };

  const payload = {
    url,
    image_description:
      (formData.get("image_description") as string)?.trim() || null,
  };

  const { error } = await supabase
    .from("humor_project_images")
    .update(payload)
    .eq("id", id);

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

  const { error } = await supabase
    .from("humor_project_images")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/images");
  redirect("/images");
}