import { redirect } from "next/navigation";
import { BarChart3 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getTasks } from "@/features/tasks/queries";
import { getFinanceSummary, getRecentTransactions } from "@/features/finance/queries";
import { getExamGrades } from "@/features/academic/queries";
import { getAttendanceSummary } from "@/features/attendance/queries";
import { getRecentWorkouts, getWeekWater } from "@/features/wellness/queries";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatsView } from "@/features/stats/StatsView";

export default async function StatsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [tasks, finance, transactions, grades, attendance, water, workouts] = await Promise.all([
    getTasks(),
    getFinanceSummary(),
    getRecentTransactions(),
    getExamGrades(),
    getAttendanceSummary(),
    getWeekWater(),
    getRecentWorkouts(),
  ]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 lg:px-10 lg:py-10">
      <PageHeader
        eyebrow="Resumen 360°"
        title="Cómo va todo, de verdad"
        description="Personal, académico y financiero con datos reales para detectar avances, hábitos y puntos a mejorar."
        icon={<BarChart3 className="h-4 w-4" />}
        tone="indigo"
      />
      <StatsView
        tasks={tasks}
        finance={finance}
        transactions={transactions}
        grades={grades}
        attendance={attendance}
        water={water}
        workouts={workouts}
      />
    </main>
  );
}
