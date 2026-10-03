import { redirect } from "next/navigation";
import { Clock3 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSchedule } from "@/features/schedule/queries";
import { getAttendanceRange, getAttendanceSummary } from "@/features/attendance/queries";
import { ScheduleView } from "@/features/schedule/ScheduleView";
import { mondayOf, toISODate, addDays } from "@/lib/dates";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function SchedulePage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims?.sub) redirect("/login");

  const today = toISODate();
  const monday = mondayOf(today);
  const [sessions, summary, attendance] = await Promise.all([
    getSchedule(),
    getAttendanceSummary(),
    getAttendanceRange(monday, addDays(monday, 6)),
  ]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 lg:px-10 lg:py-10">
      <PageHeader
        eyebrow="Horario oficial ESPOCH"
        title="Clases y asistencia"
        description="Navega por semanas y registra cada clase con fecha real."
        icon={<Clock3 className="h-4 w-4" />}
        tone="purple"
      />
      <ScheduleView sessions={sessions} initialSummary={summary} initialAttendance={attendance} />
    </main>
  );
}
