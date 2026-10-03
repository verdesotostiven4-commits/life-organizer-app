"use server";

import { createClient } from "@/lib/supabase/server";

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
};

function monthBounds(year: number, month0: number) {
  const mm = String(month0 + 1).padStart(2, "0");
  const start = `${year}-${mm}-01`;
  const end = new Date(Date.UTC(year, month0 + 1, 0)).toISOString().slice(0, 10);
  return { start, end };
}

export async function getCalendarMonth(year: number, month0: number): Promise<CalendarMonthData> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { tasks: [], water: [] };

  const { start, end } = monthBounds(year, month0);
  const [tasksResult, waterResult] = await Promise.all([
    supabase
      .from("tasks")
      .select("id, title, due_date, completed, priority")
      .eq("user_id", user.id)
      .gte("due_date", start)
      .lte("due_date", end)
      .order("priority", { ascending: false }),
    supabase
      .from("water_logs")
      .select("log_date, cups")
      .eq("user_id", user.id)
      .gte("log_date", start)
      .lte("log_date", end),
  ]);

  if (tasksResult.error) throw tasksResult.error;
  if (waterResult.error) throw waterResult.error;

  return {
    tasks: (tasksResult.data ?? []).filter((task) => task.due_date !== null) as CalendarTask[],
    water: (waterResult.data ?? []) as CalendarWater[],
  };
}
