import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  Clock3,
  CreditCard,
  Droplets,
  GraduationCap,
  ListChecks,
  ShoppingBag,
  Layers3,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentHouseholdId } from "@/lib/supabase/household";
import { getTasks } from "@/features/tasks/queries";
import { getFinanceSummary } from "@/features/finance/queries";
import { getTodayWater } from "@/features/wellness/queries";
import { getExamGrades } from "@/features/academic/queries";
import { getAttendanceSummary } from "@/features/attendance/queries";
import { formatLong, toISODate } from "@/lib/dates";
import { PageHeader } from "@/components/layout/PageHeader";

const MODULES = [
  { href: "/schedule", label: "Horario", desc: "Clases y asistencia", icon: Clock3, className: "from-purple-50 to-indigo-50 text-purple-700 border-purple-100" },
  { href: "/calendar", label: "Calendario", desc: "Mes completo", icon: CalendarDays, className: "from-indigo-50 to-sky-50 text-indigo-700 border-indigo-100" },
  { href: "/tasks", label: "Tareas", desc: "Prioridades reales", icon: ListChecks, className: "from-rose-50 to-orange-50 text-rose-700 border-rose-100" },
  { href: "/wellness", label: "Bienestar", desc: "Agua y movimiento", icon: Droplets, className: "from-sky-50 to-blue-50 text-sky-700 border-sky-100" },
  { href: "/pantry", label: "Despensa", desc: "Compras y presupuesto", icon: ShoppingBag, className: "from-emerald-50 to-teal-50 text-emerald-700 border-emerald-100" },
  { href: "/finance", label: "Finanzas", desc: "Cuentas y ahorros", icon: CreditCard, className: "from-amber-50 to-yellow-50 text-amber-700 border-amber-100" },
  { href: "/academic", label: "Académico", desc: "Prácticas y notas", icon: GraduationCap, className: "from-violet-50 to-purple-50 text-violet-700 border-violet-100" },
  { href: "/templates", label: "Plantillas", desc: "Formatos y planners", icon: Layers3, className: "from-purple-50 to-sky-50 text-purple-700 border-purple-100" },
  { href: "/stats", label: "Resumen", desc: "Indicadores y progreso", icon: BarChart3, className: "from-slate-50 to-purple-50 text-slate-700 border-slate-200" },
] as const;

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  const userId = auth?.claims?.sub;
  if (!userId) redirect("/login");
  const email = typeof auth.claims.email === "string" ? auth.claims.email : null;
  const householdId = await getCurrentHouseholdId(supabase);
  if (!householdId) redirect("/household");

  const { count } = await supabase
    .from("subjects")
    .select("*", { count: "exact", head: true })
    .eq("household_id", householdId);

  if (count === 0) await supabase.rpc("seed_initial_data");

  const [{ data: profile }, tasks, finance, water, grades, attendance] = await Promise.all([
    supabase.from("profiles").select("display_name").eq("id", userId).single(),
    getTasks(),
    getFinanceSummary(),
    getTodayWater(),
    getExamGrades(),
    getAttendanceSummary(),
  ]);

  const name = (profile as { display_name?: string } | null)?.display_name ?? email?.split("@")[0] ?? "Mónica";
  const pending = tasks.filter((task) => !task.completed).length;
  const averageGrade = grades.length
    ? grades.reduce((sum, grade) => sum + (grade.grade / grade.max_grade) * 10, 0) / grades.length
    : null;
  const attendanceValues = attendance.map((item) => item.attendance_pct).filter((value): value is number => value !== null);
  const averageAttendance = attendanceValues.length
    ? attendanceValues.reduce((sum, value) => sum + value, 0) / attendanceValues.length
    : null;
  const today = toISODate();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 lg:px-10 lg:py-10">
      <PageHeader
        eyebrow="Nuestro hogar"
        title={`Hola, ${name}`}
        description={formatLong(today)}
        tone="purple"
      />

      <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-3xl border border-rose-100 bg-gradient-to-br from-white to-rose-50 p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-rose-500">Pendientes</p>
          <p className="mt-1 text-3xl font-black text-slate-950">{pending}</p>
          <p className="text-xs text-slate-400">tareas por completar</p>
        </div>
        <div className="rounded-3xl border border-sky-100 bg-gradient-to-br from-white to-sky-50 p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-sky-600">Hidratación</p>
          <p className="mt-1 text-3xl font-black text-slate-950">{(water?.cups ?? 0) * 250}<span className="ml-1 text-sm font-bold text-slate-400">ml</span></p>
          <p className="text-xs text-slate-400">de 2000 ml hoy</p>
        </div>
        <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50 p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Disponible</p>
          <p className="mt-1 text-3xl font-black text-slate-950">${finance.totalBalance.toFixed(2)}</p>
          <p className="text-xs text-slate-400">ahorro: ${finance.totalSavings.toFixed(2)}</p>
        </div>
        <div className="rounded-3xl border border-purple-100 bg-gradient-to-br from-white to-purple-50 p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-purple-600">Académico</p>
          <p className="mt-1 text-3xl font-black text-slate-950">{averageGrade?.toFixed(1) ?? "—"}<span className="ml-1 text-sm font-bold text-slate-400">/10</span></p>
          <p className="text-xs text-slate-400">{averageAttendance === null ? "sin asistencia aún" : `${averageAttendance.toFixed(0)}% asistencia media`}</p>
        </div>
      </section>

      <section>
        <div className="mb-3">
          <h2 className="text-sm font-black text-slate-900">Todo en un solo lugar</h2>
          <p className="text-xs text-slate-400">Entra al módulo que necesites ahora.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {MODULES.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.href}
                href={mod.href}
                prefetch={true}
                className={`group rounded-3xl border bg-gradient-to-br p-5 transition-shadow duration-100 hover:shadow-md ${mod.className}`}
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 shadow-sm">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-sm font-black text-slate-900">{mod.label}</p>
                <p className="mt-0.5 text-xs text-slate-500">{mod.desc}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
