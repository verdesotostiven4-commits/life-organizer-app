"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/supabase/auth";
import { getSchedule, type SessionWithSubject } from "@/features/schedule/queries";
import { getAttendanceRange, type AttendanceRecord } from "@/features/attendance/queries";

export type CalendarTask = {
  id: string;
  title: string;
  due_date: string;
  completed: boolean;
  priority: number;
};

export type CalendarWater = {
  log_date: string;
  cups: number;
};

export type CalendarMonthData = {
  tasks: CalendarTask[];
  water: CalendarWater[];
  classes: SessionWithSubject[];
  attendance: AttendanceRecord[];
};

function monthBounds(year: number, month0: number) {
  const mm = String(month0 + 1).padStart(2, "0");
  const start = `${year}-${mm}-01`;
  const end = new Date(Date.UTC(year, month0 + 1, 0)).toISOString().slice(0, 10);
  return { start, end };
}

export async function getCalendarMonth(
  year: number,
  month0: number,
): Promise<CalendarMonthData> {
  const supabase = await createClient();
  const userId = await getCurrentUserId(supabase);
  if (!userId) return { tasks: [], water: [], classes: [], attendance: [] };

  const { start, end } = monthBounds(year, month0);

  const [tasksResult, waterResult, classes, attendance] = await Promise.all([
    supabase
      .from("tasks")
      .select("id, title, due_date, completed, priority")
      .eq("user_id", userId)
      .gte("due_date", start)
      .lte("due_date", end)
      .order("priority", { ascending: false }),
    supabase
      .from("water_logs")
      .select("log_date, cups")
      .eq("user_id", userId)
      .gte("log_date", start)
      .lte("log_date", end),
    getSchedule(),
    getAttendanceRange(start, end),
  ]);

  if (tasksResult.error) throw tasksResult.error;
  if (waterResult.error) throw waterResult.error;

  return {
    tasks: (tasksResult.data ?? []) as unknown as CalendarTask[],
    water: (waterResult.data ?? []) as CalendarWater[],
    classes,
    attendance,
  };
}
