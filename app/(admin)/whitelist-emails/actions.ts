"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type ActionResult = { error?: string };

const TABLE = "whitelist_email_addresses";

export async function createWhitelistEmail(
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const email_address = (formData.get("email_address") as string)
    ?.trim()
    .toLowerCase();
  if (!email_address) return { error: "Email address is required" };

  const { error } = await supabase.from(TABLE).insert({
    email_address,
    created_by_user_id: user.id,
    modified_by_user_id: user.id,
  });
  if (error) return { error: error.message };

  revalidatePath("/whitelist-emails");
  redirect("/whitelist-emails");
}

export async function updateWhitelistEmail(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const email_address = (formData.get("email_address") as string)
    ?.trim()
    .toLowerCase();
  if (!email_address) return { error: "Email address is required" };

  const { error } = await supabase
    .from(TABLE)
    .update({
      email_address,
      modified_by_user_id: user.id,
      modified_datetime_utc: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/whitelist-emails");
  revalidatePath(`/whitelist-emails/${id}/edit`);
  redirect("/whitelist-emails");
}

export async function deleteWhitelistEmail(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/whitelist-emails");
  redirect("/whitelist-emails");
}