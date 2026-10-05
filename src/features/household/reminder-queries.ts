"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/supabase/auth";
import { getCurrentHouseholdId } from "@/lib/supabase/household";

export type HouseholdReminder = {
  id: string;
  title: string;
  note: string;
  remind_at: string;
  href: string;
  completed: boolean;
  created_at: string;
};

export async function getHouseholdReminders(): Promise<HouseholdReminder[]> {
  const supabase = await createClient();
  const householdId = await getCurrentHouseholdId(supabase);
  if (!householdId) return [];

  const { data, error } = await supabase
    .from("reminders")
    .select("id, title, note, remind_at, href, completed, created_at")
    .eq("household_id", householdId)
    .order("completed", { ascending: true })
    .order("remind_at", { ascending: true })
    .limit(40);

  if (error) throw error;
  return (data ?? []) as HouseholdReminder[];
}

export async function createHouseholdReminder(input: {
  title: string;
  note?: string;
  remind_at: string;
  href?: string;
}): Promise<HouseholdReminder> {
  const supabase = await createClient();
  const userId = await getCurrentUserId(supabase);
  const householdId = await getCurrentHouseholdId(supabase);
  if (!userId || !householdId) throw new Error("No perteneces a un hogar");

  const title = input.title.trim().slice(0, 120);
  if (!title) throw new Error("Escribe un título");

  const remindAt = new Date(input.remind_at);
  if (Number.isNaN(remindAt.getTime())) throw new Error("Fecha inválida");

  const { data, error } = await supabase
    .from("reminders")
    .insert({
      household_id: householdId,
      created_by: userId,
      title,
      note: input.note?.trim().slice(0, 300) ?? "",
      remind_at: remindAt.toISOString(),
      href: input.href ?? "/dashboard",
    })
    .select("id, title, note, remind_at, href, completed, created_at")
    .single();

  if (error) throw error;
  revalidatePath("/household");
  return data as HouseholdReminder;
}

export async function updateHouseholdReminder(
  id: string,
  input: {
    title: string;
    note?: string;
    remind_at: string;
    href?: string;
  },
): Promise<HouseholdReminder> {
  const supabase = await createClient();
  const householdId = await getCurrentHouseholdId(supabase);
  if (!householdId) throw new Error("No perteneces a un hogar");

  const title = input.title.trim().slice(0, 120);
  if (!title) throw new Error("Escribe un título");

  const remindAt = new Date(input.remind_at);
  if (Number.isNaN(remindAt.getTime())) throw new Error("Fecha inválida");

  const { data, error } = await supabase
    .from("reminders")
    .update({
      title,
      note: input.note?.trim().slice(0, 300) ?? "",
      remind_at: remindAt.toISOString(),
      href: input.href ?? "/dashboard",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("household_id", householdId)
    .select("id, title, note, remind_at, href, completed, created_at")
    .single();

  if (error) throw error;
  revalidatePath("/household");
  return data as HouseholdReminder;
}

export async function setHouseholdReminderCompleted(
  id: string,
  completed: boolean,
): Promise<void> {
  const supabase = await createClient();
  const householdId = await getCurrentHouseholdId(supabase);
  if (!householdId) throw new Error("No perteneces a un hogar");

  const { error } = await supabase
    .from("reminders")
    .update({
      completed,
      completed_at: completed ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("household_id", householdId);

  if (error) throw error;
  revalidatePath("/household");
}

export async function deleteHouseholdReminder(id: string): Promise<void> {
  const supabase = await createClient();
  const householdId = await getCurrentHouseholdId(supabase);
  if (!householdId) throw new Error("No perteneces a un hogar");

  const { error } = await supabase
    .from("reminders")
    .delete()
    .eq("id", id)
    .eq("household_id", householdId);

  if (error) throw error;
  revalidatePath("/household");
}
