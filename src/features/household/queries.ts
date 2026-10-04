"use server";

import { createHash, randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/supabase/auth";
import { getCurrentHouseholdId } from "@/lib/supabase/household";

export type HouseholdMember = {
  user_id: string;
  display_name: string;
  role: "owner" | "member";
  joined_at: string;
};

export type HouseholdOverview = {
  id: string;
  name: string;
  timezone: string;
  members: HouseholdMember[];
};

export type NotificationPreferences = {
  enabled: boolean;
  browser_enabled: boolean;
  tasks: boolean;
  purchases: boolean;
  schedule: boolean;
  academics: boolean;
  advance_minutes: number;
  quiet_start: string;
  quiet_end: string;
};

export async function getHouseholdOverview(): Promise<HouseholdOverview | null> {
  const supabase = await createClient();
  const userId = await getCurrentUserId(supabase);
  const householdId = await getCurrentHouseholdId(supabase);
  if (!userId || !householdId) return null;

  const [{ data: household, error: householdError }, { data: members, error: membersError }] =
    await Promise.all([
      supabase
        .from("households")
        .select("id, name, timezone")
        .eq("id", householdId)
        .single(),
      supabase
        .from("household_members")
        .select("user_id, role, joined_at")
        .eq("household_id", householdId)
        .order("joined_at", { ascending: true }),
    ]);

  if (householdError) throw householdError;
  if (membersError) throw membersError;

  const memberRows = (members ?? []) as {
    user_id: string;
    role: "owner" | "member";
    joined_at: string;
  }[];

  const ids = memberRows.map((member) => member.user_id);
  const { data: profiles, error: profilesError } = ids.length
    ? await supabase.from("profiles").select("id, display_name").in("id", ids)
    : { data: [], error: null };

  if (profilesError) throw profilesError;

  const names = new Map(
    ((profiles ?? []) as { id: string; display_name: string }[]).map((profile) => [
      profile.id,
      profile.display_name,
    ]),
  );

  return {
    id: household.id,
    name: household.name,
    timezone: household.timezone,
    members: memberRows.map((member) => ({
      ...member,
      display_name: names.get(member.user_id) ?? "Miembro",
    })),
  };
}

export async function createInviteCode(): Promise<{
  code: string;
  expires_at: string;
}> {
  const supabase = await createClient();
  const userId = await getCurrentUserId(supabase);
  const householdId = await getCurrentHouseholdId(supabase);
  if (!userId || !householdId) throw new Error("No perteneces a un hogar");

  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(8);
  const raw = Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
  const code = `HMY-${raw.slice(0, 4)}-${raw.slice(4)}`;
  const codeHash = createHash("sha256").update(code.toLowerCase()).digest("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await supabase.from("household_invites").insert({
    household_id: householdId,
    code_hash: codeHash,
    created_by: userId,
    expires_at: expiresAt,
  });

  if (error) throw error;
  return { code, expires_at: expiresAt };
}

export async function joinHousehold(code: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("join_household_by_code", {
    p_code: code.trim(),
  });

  if (error) throw error;

  revalidatePath("/household");
  revalidatePath("/dashboard");
  revalidatePath("/finance");
  revalidatePath("/pantry");
  revalidatePath("/tasks");
}

export async function updateHouseholdName(name: string): Promise<void> {
  const supabase = await createClient();
  const householdId = await getCurrentHouseholdId(supabase);
  if (!householdId) throw new Error("No perteneces a un hogar");

  const clean = name.trim().slice(0, 80);
  if (!clean) throw new Error("Nombre inválido");

  const { error } = await supabase
    .from("households")
    .update({ name: clean, updated_at: new Date().toISOString() })
    .eq("id", householdId);

  if (error) throw error;
  revalidatePath("/household");
}

export async function getNotificationPreferences(): Promise<NotificationPreferences | null> {
  const supabase = await createClient();
  const userId = await getCurrentUserId(supabase);
  const householdId = await getCurrentHouseholdId(supabase);
  if (!userId || !householdId) return null;

  const { data, error } = await supabase
    .from("notification_preferences")
    .select(
      "enabled, browser_enabled, tasks, purchases, schedule, academics, advance_minutes, quiet_start, quiet_end",
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;

  if (data) return data as NotificationPreferences;

  const defaults: NotificationPreferences = {
    enabled: true,
    browser_enabled: false,
    tasks: true,
    purchases: true,
    schedule: true,
    academics: true,
    advance_minutes: 30,
    quiet_start: "21:30:00",
    quiet_end: "07:00:00",
  };

  const { error: insertError } = await supabase.from("notification_preferences").insert({
    user_id: userId,
    household_id: householdId,
    ...defaults,
  });

  if (insertError) throw insertError;
  return defaults;
}

export async function saveNotificationPreferences(
  input: NotificationPreferences,
): Promise<void> {
  const supabase = await createClient();
  const userId = await getCurrentUserId(supabase);
  const householdId = await getCurrentHouseholdId(supabase);
  if (!userId || !householdId) throw new Error("No perteneces a un hogar");

  const { error } = await supabase.from("notification_preferences").upsert({
    user_id: userId,
    household_id: householdId,
    enabled: input.enabled,
    browser_enabled: input.browser_enabled,
    tasks: input.tasks,
    purchases: input.purchases,
    schedule: input.schedule,
    academics: input.academics,
    advance_minutes: Math.min(180, Math.max(5, input.advance_minutes)),
    quiet_start: input.quiet_start,
    quiet_end: input.quiet_end,
    updated_at: new Date().toISOString(),
  });

  if (error) throw error;
  revalidatePath("/household");
}
