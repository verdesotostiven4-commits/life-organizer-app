"use server";

import { createClient } from "@/lib/supabase/server";
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
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("attendance")
    .select("session_id, session_date, status, note")
    .eq("user_id", user.id)
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
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { error } = await supabase.from("attendance").upsert(
    {
      user_id: user.id,
      session_id: sessionId,
      session_date: sessionDate,
      status,
      note: note.trim(),
    } as never,
    {
      onConflict: "user_id, session_id, session_date",
    },
  );

  if (error) throw error;
}

/** Elimina un registro de asistencia. */
export async function deleteAttendance(
  sessionId: string,
  sessionDate: string,
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { error } = await supabase
    .from("attendance")
    .delete()
    .eq("user_id", user.id)
    .eq("session_id", sessionId)
    .eq("session_date", sessionDate);

  if (error) throw error;
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
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("attendance_aggregate")
    .select("subject_id, subject_name, attended, missed, cancelled, attendance_pct")
    .eq("user_id", user.id);

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
