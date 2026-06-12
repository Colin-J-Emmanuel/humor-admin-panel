"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type ActionResult = { error?: string };

const TABLE = "llm_models";

function parse(formData: FormData) {
  const providerRaw = (formData.get("llm_provider_id") as string)?.trim();
  return {
    name: (formData.get("name") as string)?.trim(),
    provider_model_id: (formData.get("provider_model_id") as string)?.trim(),
    llm_provider_id: providerRaw ? Number(providerRaw) : null,
    is_temperature_supported: formData.get("is_temperature_supported") === "on",
  };
}

function validate(v: ReturnType<typeof parse>): string | null {
  if (!v.name) return "Name is required";
  if (!v.provider_model_id) return "Provider model ID is required";
  if (v.llm_provider_id == null) return "Provider is required";
  return null;
}

export async function createLlmModel(
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

  revalidatePath("/llm-models");
  redirect("/llm-models");
}

export async function updateLlmModel(
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

  revalidatePath("/llm-models");
  revalidatePath(`/llm-models/${id}/edit`);
  redirect("/llm-models");
}

export async function deleteLlmModel(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/llm-models");
  redirect("/llm-models");
}