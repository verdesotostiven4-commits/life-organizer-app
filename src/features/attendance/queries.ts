"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/supabase/auth";
import { getCurrentHouseholdId } from "@/lib/supabase/household";
import type { AttendanceStatus } from "@/types/domain";

export type AttendanceRecord = {
  session_id: string;
  session_date: string;
  status: AttendanceStatus;
  note: string;
};

/** Trae todos los registros de asistencia del usuario para un rango de fechas. */
export async function getAttendanceRange(
  startDate: string,
  endDate: string,
): Promise<AttendanceRecord[]> {
  const supabase = await createClient();
  const userId = await getCurrentUserId(supabase);
  const householdId = await getCurrentHouseholdId(supabase);
  if (!userId || !householdId) return [];

  const { data, error } = await supabase
    .from("attendance")
    .select("session_id, session_date, status, note")
    .eq("household_id", householdId)
    .gte("session_date", startDate)
    .lte("session_date", endDate);

  if (error) throw error;

  return (data ?? []) as AttendanceRecord[];
}

/** Inserta o actualiza asistencia y nota para una sesión en una fecha. */
export async function saveAttendance(
  sessionId: string,
  sessionDate: string,
  status: AttendanceStatus,
  note = "",
): Promise<AttendanceRecord> {
  const supabase = await createClient();
  const userId = await getCurrentUserId(supabase);
  const householdId = await getCurrentHouseholdId(supabase);
  if (!userId || !householdId) throw new Error("No autenticado o sin hogar");

  const { data, error } = await supabase
    .from("attendance")
    .upsert(
      {
        user_id: userId,
        session_id: sessionId,
        session_date: sessionDate,
        status,
        note: note.trim(),
      } as never,
      {
        onConflict: "household_id, session_id, session_date",
      },
    )
    .select("session_id, session_date, status, note")
    .single();

  if (error) throw error;
  revalidatePath("/schedule");
  revalidatePath("/dashboard");
  revalidatePath("/stats");
  return data as AttendanceRecord;
}

/** Elimina un registro de asistencia. */
export async function deleteAttendance(
  sessionId: string,
  sessionDate: string,
): Promise<void> {
  const supabase = await createClient();
  const userId = await getCurrentUserId(supabase);
  const householdId = await getCurrentHouseholdId(supabase);
  if (!userId || !householdId) throw new Error("No autenticado o sin hogar");

  const { error } = await supabase
    .from("attendance")
    .delete()
    .eq("household_id", householdId)
    .eq("session_id", sessionId)
    .eq("session_date", sessionDate);

  if (error) throw error;
  revalidatePath("/schedule");
  revalidatePath("/dashboard");
  revalidatePath("/stats");
}

/** Trae el resumen de asistencia por materia (vista attendance_aggregate). */
export async function getAttendanceSummary(): Promise<
  {
    subject_id: string;
    subject_name: string;
    attended: number;
    missed: number;
    cancelled: number;
    attendance_pct: number | null;
  }[]
> {
  const supabase = await createClient();
  const userId = await getCurrentUserId(supabase);
  const householdId = await getCurrentHouseholdId(supabase);
  if (!userId || !householdId) return [];

  const { data, error } = await supabase
    .from("attendance_aggregate")
    .select("subject_id, subject_name, attended, missed, cancelled, attendance_pct")
    .eq("household_id", householdId);

  if (error) throw error;

  return (data ?? []) as {
    subject_id: string;
    subject_name: string;
    attended: number;
    missed: number;
    cancelled: number;
    attendance_pct: number | null;
  }[];
}
