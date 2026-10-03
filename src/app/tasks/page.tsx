import { redirect } from "next/navigation";
import { ListChecks } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getTasks, getSubjects } from "@/features/tasks/queries";
import { TasksView } from "@/features/tasks/TasksView";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function TasksPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims?.sub) redirect("/login");

  const [tasks, subjects] = await Promise.all([getTasks(), getSubjects()]);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-8 lg:px-10 lg:py-10">
      <PageHeader
        eyebrow="Tareas & prioridades"
        title="Qué toca hacer"
        description="Estudio, vida personal y deseos organizados con prioridad Likert del 1 al 5."
        icon={<ListChecks className="h-4 w-4" />}
        tone="rose"
      />
      <TasksView initialTasks={tasks} subjects={subjects} />
    </main>
  );
}
