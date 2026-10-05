"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/supabase/auth";
import { getCurrentHouseholdId } from "@/lib/supabase/household";

export type NeighborItemStatus = "pendiente" | "comprado" | "no_habia";

export type NeighborItem = {
  id: string;
  household_id: string;
  list_id: string;
  created_by: string;
  name: string;
  quantity: string;
  note: string;
  status: NeighborItemStatus;
  purchased_by: string | null;
  purchased_at: string | null;
  created_at: string;
  updated_at: string;
};

export type NeighborListData = {
  id: string;
  household_id: string;
  name: string;
  location: string;
  items: NeighborItem[];
};

export async function getNeighborList(): Promise<NeighborListData | null> {
  const supabase = await createClient();
  const householdId = await getCurrentHouseholdId(supabase);
  if (!householdId) return null;

  const { data: list, error: listError } = await supabase
    .from("household_purchase_lists")
    .select("id, household_id, name, location")
    .eq("household_id", householdId)
    .eq("active", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (listError) throw listError;
  if (!list) return null;

  const { data: items, error: itemsError } = await supabase
    .from("household_purchase_items")
    .select(
      "id, household_id, list_id, created_by, name, quantity, note, status, purchased_by, purchased_at, created_at, updated_at",
    )
    .eq("list_id", list.id)
    .order("status", { ascending: true })
    .order("created_at", { ascending: false });

  if (itemsError) throw itemsError;

  return {
    ...list,
    items: (items ?? []) as NeighborItem[],
  } as NeighborListData;
}

export async function addNeighborItem(input: {
  list_id: string;
  name: string;
  quantity?: string;
  note?: string;
}): Promise<NeighborItem> {
  const supabase = await createClient();
  const userId = await getCurrentUserId(supabase);
  const householdId = await getCurrentHouseholdId(supabase);
  if (!userId || !householdId) throw new Error("No perteneces a un hogar");

  const name = input.name.trim().slice(0, 120);
  if (!name) throw new Error("Producto inválido");

  const { data, error } = await supabase
    .from("household_purchase_items")
    .insert({
      household_id: householdId,
      list_id: input.list_id,
      created_by: userId,
      name,
      quantity: input.quantity?.trim().slice(0, 40) ?? "",
      note: input.note?.trim().slice(0, 160) ?? "",
      status: "pendiente",
    })
    .select(
      "id, household_id, list_id, created_by, name, quantity, note, status, purchased_by, purchased_at, created_at, updated_at",
    )
    .single();

  if (error) throw error;
  revalidatePath("/pantry");
  return data as NeighborItem;
}

export async function updateNeighborItem(
  id: string,
  input: {
    name: string;
    quantity?: string;
    note?: string;
  },
): Promise<NeighborItem> {
  const supabase = await createClient();
  const householdId = await getCurrentHouseholdId(supabase);
  if (!householdId) throw new Error("No perteneces a un hogar");

  const name = input.name.trim().slice(0, 120);
  if (!name) throw new Error("Producto inválido");

  const { data, error } = await supabase
    .from("household_purchase_items")
    .update({
      name,
      quantity: input.quantity?.trim().slice(0, 40) ?? "",
      note: input.note?.trim().slice(0, 160) ?? "",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("household_id", householdId)
    .select(
      "id, household_id, list_id, created_by, name, quantity, note, status, purchased_by, purchased_at, created_at, updated_at",
    )
    .single();

  if (error) throw error;
  revalidatePath("/pantry");
  return data as NeighborItem;
}

export async function setNeighborItemStatus(
  id: string,
  status: NeighborItemStatus,
): Promise<void> {
  const supabase = await createClient();
  const userId = await getCurrentUserId(supabase);
  const householdId = await getCurrentHouseholdId(supabase);
  if (!userId || !householdId) throw new Error("No perteneces a un hogar");

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("household_purchase_items")
    .update({
      status,
      purchased_by: status === "pendiente" ? null : userId,
      purchased_at: status === "pendiente" ? null : now,
      updated_at: now,
    })
    .eq("id", id)
    .eq("household_id", householdId);

  if (error) throw error;
  revalidatePath("/pantry");
}

export async function deleteNeighborItem(id: string): Promise<void> {
  const supabase = await createClient();
  const householdId = await getCurrentHouseholdId(supabase);
  if (!householdId) throw new Error("No perteneces a un hogar");

  const { error } = await supabase
    .from("household_purchase_items")
    .delete()
    .eq("id", id)
    .eq("household_id", householdId);

  if (error) throw error;
  revalidatePath("/pantry");
}
