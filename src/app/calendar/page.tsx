import { redirect } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCalendarMonth } from "@/features/calendar/queries";
import { CalendarView } from "@/features/calendar/CalendarView";
import { PageHeader } from "@/components/layout/PageHeader";
import { parseISO, toISODate } from "@/lib/dates";

export default async function CalendarPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims?.sub) redirect("/login");

  const today = parseISO(toISODate());
  const year = today.getFullYear();
  const month = today.getMonth();
  const data = await getCalendarMonth(year, month);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 lg:px-10 lg:py-10">
      <PageHeader
        eyebrow="Calendario académico & personal"
        title="Todo lo que pasa en tu mes"
        description="Toca una fecha para ver clases, asistencia, tareas e hidratación. El horario se registra desde la misma fecha real."
        icon={<CalendarDays className="h-4 w-4" />}
        tone="indigo"
      />
      <CalendarView initialYear={year} initialMonth={month} initialData={data} />
    </main>
  );
}
