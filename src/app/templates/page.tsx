import { redirect } from "next/navigation";
import { Layers3 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { TemplatesView } from "@/features/templates/TemplatesView";
import { toISODate } from "@/lib/dates";

export default async function TemplatesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 lg:px-10 lg:py-10">
      <PageHeader
        eyebrow="Plantillas & atajos"
        title="No escribas lo mismo dos veces"
        description="Crea grupos de tareas reutilizables y consulta el horario oficial con las fechas de la semana actual."
        icon={<Layers3 className="h-4 w-4" />}
        tone="purple"
      />
      <TemplatesView today={toISODate()} />
    </main>
  );
}
