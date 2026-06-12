"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type ActionResult = { error?: string };

const TABLE = "caption_examples";

function parse(formData: FormData) {
  const priorityRaw = (formData.get("priority") as string)?.trim();
  const imageIdRaw = (formData.get("image_id") as string)?.trim();
  return {
    image_description: (formData.get("image_description") as string)?.trim(),
    caption: (formData.get("caption") as string)?.trim(),
    explanation: (formData.get("explanation") as string)?.trim(),
    priority: priorityRaw ? Number(priorityRaw) : 0,
    image_id: imageIdRaw || null,
  };
}

function validate(v: ReturnType<typeof parse>): string | null {
  if (!v.image_description) return "Image description is required";
  if (!v.caption) return "Caption is required";
  if (!v.explanation) return "Explanation is required";
  return null;
}

export async function createCaptionExample(
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const v = parse(formData);
  const invalid = validate(v);
  if (invalid) return { error: invalid };

  const { error } = await supabase.from(TABLE).insert({
    ...v,
    created_by_user_id: user.id,
    modified_by_user_id: user.id,
  });
  if (error) return { error: error.message };

  revalidatePath("/caption-examples");
  redirect("/caption-examples");
}

export async function updateCaptionExample(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const v = parse(formData);
  const invalid = validate(v);
  if (invalid) return { error: invalid };

  const { error } = await supabase
    .from(TABLE)
    .update({
      ...v,
      modified_by_user_id: user.id,
      modified_datetime_utc: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/caption-examples");
  revalidatePath(`/caption-examples/${id}/edit`);
  redirect("/caption-examples");
}

export async function deleteCaptionExample(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/caption-examples");
  redirect("/caption-examples");
}