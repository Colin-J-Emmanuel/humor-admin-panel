"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type ActionResult = { error?: string };

const TABLE = "allowed_signup_domains";

export async function createSignupDomain(
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const apex_domain = (formData.get("apex_domain") as string)
    ?.trim()
    .toLowerCase();
  if (!apex_domain) return { error: "Domain is required" };

  const { error } = await supabase.from(TABLE).insert({
    apex_domain,
    created_by_user_id: user.id,
    modified_by_user_id: user.id,
  });
  if (error) return { error: error.message };

  revalidatePath("/signup-domains");
  redirect("/signup-domains");
}

export async function updateSignupDomain(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const apex_domain = (formData.get("apex_domain") as string)
    ?.trim()
    .toLowerCase();
  if (!apex_domain) return { error: "Domain is required" };

  const { error } = await supabase
    .from(TABLE)
    .update({
      apex_domain,
      modified_by_user_id: user.id,
      modified_datetime_utc: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/signup-domains");
  revalidatePath(`/signup-domains/${id}/edit`);
  redirect("/signup-domains");
}

export async function deleteSignupDomain(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/signup-domains");
  redirect("/signup-domains");
}