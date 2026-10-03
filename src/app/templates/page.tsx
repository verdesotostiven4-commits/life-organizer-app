import { redirect } from "next/navigation";
import { Layers3 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { TemplatesView } from "@/features/templates/TemplatesView";
import { getPlannerDocuments } from "@/features/templates/queries";

export default async function TemplatesPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims?.sub) redirect("/login");

  const documents = await getPlannerDocuments();

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-8 lg:px-10 lg:py-10">
      <PageHeader
        eyebrow="Biblioteca de plantillas"
        title="Elige un formato y hazlo tuyo"
        description="Planners mensuales, semanales, diarios, académicos y de proyectos. Cambia el color, edita cada campo y guarda tus propias versiones."
        icon={<Layers3 className="h-4 w-4" />}
        tone="purple"
      />
      <TemplatesView documents={documents} />
    </main>
  );
}
