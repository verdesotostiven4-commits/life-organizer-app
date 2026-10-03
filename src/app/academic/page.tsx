import { redirect } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getRecentPractices, getExamGrades } from "@/features/academic/queries";
import { getSubjects } from "@/features/tasks/queries";
import { AcademicView } from "@/features/academic/AcademicView";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function AcademicPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [practices, examGrades, subjects] = await Promise.all([
    getRecentPractices(), getExamGrades(), getSubjects(),
  ]);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-8 lg:px-10 lg:py-10">
      <PageHeader
        eyebrow="Académico"
        title="Prácticas y calificaciones"
        description="Registra tus prácticas laborales y mantén las notas del semestre a la vista."
        icon={<GraduationCap className="h-4 w-4" />}
        tone="purple"
      />
      <AcademicView practices={practices} examGrades={examGrades} subjects={subjects} />
    </main>
  );
}
