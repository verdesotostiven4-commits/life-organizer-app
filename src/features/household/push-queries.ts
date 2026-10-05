"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/supabase/auth";
import { getCurrentHouseholdId } from "@/lib/supabase/household";

export async function getPushPublicKey(): Promise<string | null> {
  const supabase = await createClient();
  const userId = await getCurrentUserId(supabase);
  if (!userId) return null;

  const { data, error } = await supabase
    .from("push_public_config")
    .select("vapid_public")
    .eq("id", true)
    .maybeSingle();

  if (error) throw error;
  return data?.vapid_public ?? null;
}

export async function savePushSubscription(input: {
  endpoint: string;
  p256dh: string;
  auth: string;
  user_agent?: string;
}): Promise<void> {
  const supabase = await createClient();
  const userId = await getCurrentUserId(supabase);
  const householdId = await getCurrentHouseholdId(supabase);
  if (!userId || !householdId) throw new Error("No autenticado o sin hogar");

  const endpoint = input.endpoint.trim().slice(0, 4096);
  const p256dh = input.p256dh.trim().slice(0, 512);
  const auth = input.auth.trim().slice(0, 512);

  if (!endpoint.startsWith("https://") || !p256dh || !auth) {
    throw new Error("Suscripción push inválida");
  }

  const { error } = await supabase.from("web_push_subscriptions").upsert(
    {
      user_id: userId,
      household_id: householdId,
      endpoint,
      p256dh,
      auth,
      user_agent: input.user_agent?.slice(0, 300) ?? "",
      updated_at: new Date().toISOString(),
      last_error: null,
    },
    { onConflict: "endpoint" },
  );

  if (error) throw error;

  const { error: preferenceError } = await supabase
    .from("notification_preferences")
    .update({
      browser_enabled: true,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (preferenceError) throw preferenceError;
  revalidatePath("/household");
}

export async function removePushSubscription(
  endpoint: string,
): Promise<boolean> {
  const supabase = await createClient();
  const userId = await getCurrentUserId(supabase);
  if (!userId) throw new Error("No autenticado");

  const { error } = await supabase
    .from("web_push_subscriptions")
    .delete()
    .eq("user_id", userId)
    .eq("endpoint", endpoint);

  if (error) throw error;

  const { count, error: countError } = await supabase
    .from("web_push_subscriptions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (countError) throw countError;

  const hasAny = (count ?? 0) > 0;
  const { error: preferenceError } = await supabase
    .from("notification_preferences")
    .update({
      browser_enabled: hasAny,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (preferenceError) throw preferenceError;
  revalidatePath("/household");
  return hasAny;
}
