import { redirect } from "next/navigation";
import { BarChart3 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getTasks } from "@/features/tasks/queries";
import { getFinanceSummary } from "@/features/finance/queries";
import { getExamGrades } from "@/features/academic/queries";
import { getAttendanceSummary } from "@/features/attendance/queries";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatsView } from "@/features/stats/StatsView";

export default async function StatsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [tasks, finance, grades, attendance] = await Promise.all([
    getTasks(),
    getFinanceSummary(),
    getExamGrades(),
    getAttendanceSummary(),
  ]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 lg:px-10 lg:py-10">
      <PageHeader
        eyebrow="Resumen & gráficas"
        title="Cómo va todo"
        description="Indicadores reales de tareas, finanzas, notas y asistencia en una sola pantalla."
        icon={<BarChart3 className="h-4 w-4" />}
        tone="indigo"
      />
      <StatsView tasks={tasks} finance={finance} grades={grades} attendance={attendance} />
    </main>
  );
}
