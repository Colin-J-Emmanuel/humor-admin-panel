"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type ActionResult = { error?: string };

const TABLE = "terms";

function parse(formData: FormData) {
  const priorityRaw = (formData.get("priority") as string)?.trim();
  const typeRaw = (formData.get("term_type_id") as string)?.trim();
  return {
    term: (formData.get("term") as string)?.trim(),
    definition: (formData.get("definition") as string)?.trim(),
    example: (formData.get("example") as string)?.trim(),
    priority: priorityRaw ? Number(priorityRaw) : 0,
    term_type_id: typeRaw ? Number(typeRaw) : null,
  };
}

function validate(v: ReturnType<typeof parse>): string | null {
  if (!v.term) return "Term is required";
  if (!v.definition) return "Definition is required";
  if (!v.example) return "Example is required";
  return null;
}

export async function createTerm(formData: FormData): Promise<ActionResult> {
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

  revalidatePath("/terms");
  redirect("/terms");
}

export async function updateTerm(
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

  revalidatePath("/terms");
  revalidatePath(`/terms/${id}/edit`);
  redirect("/terms");
}

export async function deleteTerm(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/terms");
  redirect("/terms");
}