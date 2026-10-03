import { redirect } from "next/navigation";
import { Droplets } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getTodayWater, getRecentWorkouts } from "@/features/wellness/queries";
import { WellnessView } from "@/features/wellness/WellnessView";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function WellnessPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims?.sub) redirect("/login");

  const [todayWater, workouts] = await Promise.all([getTodayWater(), getRecentWorkouts()]);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-8 lg:px-10 lg:py-10">
      <PageHeader
        eyebrow="Hábitos, agua & gym"
        title="Cuida tu ritmo"
        description="Hidratación diaria y movimiento sin convertirlo en una pantalla aburrida."
        icon={<Droplets className="h-4 w-4" />}
        tone="sky"
      />
      <WellnessView todayCups={todayWater?.cups ?? 0} workouts={workouts} />
    </main>
  );
}
