import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getCurrentUserId } from "@/lib/supabase/auth";

export async function getCurrentHouseholdId(
  supabase: SupabaseClient<Database>,
): Promise<string | null> {
  const userId = await getCurrentUserId(supabase);
  if (!userId) return null;

  const { data, error } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data?.household_id ?? null;
}

export async function getCurrentHouseholdContext(
  supabase: SupabaseClient<Database>,
): Promise<{ userId: string; householdId: string } | null> {
  const userId = await getCurrentUserId(supabase);
  if (!userId) return null;

  const { data, error } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data?.household_id) return null;

  return { userId, householdId: data.household_id };
}
