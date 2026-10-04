import { redirect } from "next/navigation";
import { Home } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  getHouseholdOverview,
  getNotificationPreferences,
} from "@/features/household/queries";
import { getHouseholdReminders } from "@/features/household/reminder-queries";
import { HouseholdView } from "@/features/household/HouseholdView";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function HouseholdPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims?.sub) redirect("/login");

  const [overview, preferences, reminders] = await Promise.all([
    getHouseholdOverview(),
    getNotificationPreferences(),
    getHouseholdReminders(),
  ]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 lg:px-10 lg:py-10">
      <PageHeader
        eyebrow="Espacio compartido"
        title="Nuestro hogar"
        description="Los dos pueden ver y actualizar tareas, compras, estudios y finanzas; Harmony conserva quién hizo cada cambio."
        icon={<Home className="h-4 w-4" />}
        tone="purple"
      />
      <HouseholdView
        initialOverview={overview}
        initialPreferences={preferences}
        initialReminders={reminders}
      />
    </main>
  );
}
