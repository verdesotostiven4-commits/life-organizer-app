"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/supabase/auth";
import { getCurrentHouseholdId } from "@/lib/supabase/household";
import { toISODate } from "@/lib/dates";
import type { Json } from "@/types/database";
import { createDefaultContent, templateMeta } from "./catalog";
import type {
  PlannerAccent,
  PlannerContent,
  PlannerDocument,
  PlannerTemplateKey,
} from "./types";

function asPlannerDocument(row: {
  id: string;
  template_key: string;
  title: string;
  accent: string;
  content: Json;
  created_at: string;
  updated_at: string;
}): PlannerDocument {
  return {
    id: row.id,
    template_key: row.template_key as PlannerTemplateKey,
    title: row.title,
    accent: row.accent as PlannerAccent,
    content: row.content as PlannerContent,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function getPlannerDocuments(): Promise<PlannerDocument[]> {
  const supabase = await createClient();
  const userId = await getCurrentUserId(supabase);
  const householdId = await getCurrentHouseholdId(supabase);
  if (!userId || !householdId) return [];

  const { data, error } = await supabase
    .from("planner_documents")
    .select("id, template_key, title, accent, content, created_at, updated_at")
    .eq("household_id", householdId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(asPlannerDocument);
}

export async function getPlannerDocument(
  id: string,
): Promise<PlannerDocument | null> {
  const supabase = await createClient();
  const userId = await getCurrentUserId(supabase);
  const householdId = await getCurrentHouseholdId(supabase);
  if (!userId || !householdId) return null;

  const { data, error } = await supabase
    .from("planner_documents")
    .select("id, template_key, title, accent, content, created_at, updated_at")
    .eq("id", id)
    .eq("household_id", householdId)
    .maybeSingle();

  if (error) throw error;
  return data ? asPlannerDocument(data) : null;
}

export async function createPlannerDocument(
  templateKey: PlannerTemplateKey,
  accent?: PlannerAccent,
): Promise<string> {
  const supabase = await createClient();
  const userId = await getCurrentUserId(supabase);
  const householdId = await getCurrentHouseholdId(supabase);
  if (!userId || !householdId) throw new Error("No autenticado o sin hogar");

  const meta = templateMeta(templateKey);
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("planner_documents")
    .insert({
      user_id: userId,
      template_key: templateKey,
      title: meta.title,
      accent: accent ?? meta.accent,
      content: createDefaultContent(templateKey, toISODate()) as unknown as Json,
      updated_at: now,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

export async function savePlannerDocument(input: {
  id: string;
  title: string;
  accent: PlannerAccent;
  content: PlannerContent;
}): Promise<void> {
  const supabase = await createClient();
  const userId = await getCurrentUserId(supabase);
  const householdId = await getCurrentHouseholdId(supabase);
  if (!userId || !householdId) throw new Error("No autenticado o sin hogar");

  const { error } = await supabase
    .from("planner_documents")
    .update({
      title: input.title.trim() || "Mi plantilla",
      accent: input.accent,
      content: input.content as unknown as Json,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.id)
    .eq("household_id", householdId);

  if (error) throw error;
}

export async function deletePlannerDocument(id: string): Promise<void> {
  const supabase = await createClient();
  const userId = await getCurrentUserId(supabase);
  const householdId = await getCurrentHouseholdId(supabase);
  if (!userId || !householdId) throw new Error("No autenticado o sin hogar");

  const { error } = await supabase
    .from("planner_documents")
    .delete()
    .eq("id", id)
    .eq("household_id", householdId);

  if (error) throw error;
}
