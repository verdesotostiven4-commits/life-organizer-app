import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { TemplatesView } from "@/features/templates/TemplatesView";
import { toISODate } from "@/lib/dates";

export default async function TemplatesPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims?.sub) redirect("/login");

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 lg:px-10 lg:py-10">
      <PageHeader
        eyebrow="Atajos rápidos"
        title="Haz varias tareas en un solo toque"
        description="Elige un atajo y Harmony OS crea por ti un pequeño grupo de tareas para hoy."
        icon={<Sparkles className="h-4 w-4" />}
        tone="purple"
      />
      <TemplatesView today={toISODate()} />
    </main>
  );
}
