import {
  BarChart3,
  BookOpenCheck,
  CheckCircle2,
  Droplets,
  Dumbbell,
  GraduationCap,
  PiggyBank,
  WalletCards,
} from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { formatCurrency } from "@/config/finance";
import type { Task } from "@/features/tasks/queries";
import type { Transaction } from "@/features/finance/queries";
import type { WaterLog, WorkoutLog } from "@/features/wellness/queries";
import type { TaskCategory } from "@/types/domain";

type AttendanceItem = {
  subject_id: string;
  subject_name: string;
  attended: number;
  missed: number;
  cancelled: number;
  attendance_pct: number | null;
};

type GradeItem = {
  id: string;
  subject_name: string;
  exam_name: string;
  grade: number;
  max_grade: number;
  exam_date: string;
};

function percentage(done: number, total: number) {
  return total > 0 ? Math.round((done / total) * 100) : 0;
}

function categoryProgress(tasks: Task[], category: TaskCategory) {
  const rows = tasks.filter((task) => task.category === category);
  return {
    total: rows.length,
    done: rows.filter((task) => task.completed).length,
    pct: percentage(rows.filter((task) => task.completed).length, rows.length),
  };
}

function sevenDayLabels() {
  const formatter = new Intl.DateTimeFormat("es-EC", { weekday: "short" });
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    const iso = date.toISOString().slice(0, 10);
    return {
      iso,
      label: formatter.format(date).replace(".", "").slice(0, 3),
    };
  });
}

function ProgressRow({
  label,
  value,
  helper,
  tone = "purple",
}: {
  label: string;
  value: number;
  helper: string;
  tone?: "purple" | "emerald" | "sky" | "amber" | "rose";
}) {
  const toneClass = {
    purple: "bg-purple-600",
    emerald: "bg-emerald-500",
    sky: "bg-sky-500",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
  }[tone];

  return (
    <div>
      <div className="mb-1.5 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-black text-slate-800">{label}</p>
          <p className="text-[10px] text-slate-400">{helper}</p>
        </div>
        <span className="text-xs font-black text-slate-700">{value}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${toneClass}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      </div>
    </div>
  );
}

export function StatsView({
  tasks,
  finance,
  transactions,
  grades,
  attendance,
  water,
  workouts,
}: {
  tasks: Task[];
  finance: { totalSavings: number; totalBalance: number; debtsOwed: number; debtsOwedToMe: number };
  transactions: Transaction[];
  grades: GradeItem[];
  attendance: AttendanceItem[];
  water: WaterLog[];
  workouts: WorkoutLog[];
}) {
  const completed = tasks.filter((task) => task.completed).length;
  const completion = percentage(completed, tasks.length);

  const gradeAverage = grades.length
    ? grades.reduce((sum, item) => sum + (item.grade / item.max_grade) * 10, 0) / grades.length
    : null;

  const attendanceRows = attendance.filter((item) => item.attendance_pct !== null);
  const attendanceAverage = attendanceRows.length
    ? Math.round(
        attendanceRows.reduce((sum, item) => sum + (item.attendance_pct ?? 0), 0) /
          attendanceRows.length,
      )
    : 0;

  const personalTasks = categoryProgress(tasks, "personal");
  const studyTasks = categoryProgress(tasks, "estudio");
  const wishTasks = categoryProgress(tasks, "deseos");

  const days = sevenDayLabels();
  const waterMap = new Map(water.map((item) => [item.log_date, item.cups]));
  const waterAverage = Math.round(
    (days.reduce((sum, day) => sum + (waterMap.get(day.iso) ?? 0), 0) / (days.length * 8)) * 100,
  );
  const weekStart = days[0]?.iso ?? "";
  const weekWorkoutMinutes = workouts
    .filter((workout) => workout.workout_date >= weekStart)
    .reduce((sum, workout) => sum + workout.minutes, 0);

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const recentTransactions = transactions.filter(
    (transaction) => new Date(transaction.created_at) >= cutoff,
  );
  const recentIncome = recentTransactions
    .filter((transaction) => transaction.type === "ingreso")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const recentExpenses = recentTransactions
    .filter((transaction) => transaction.type === "gasto")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const recentSavings = recentTransactions
    .filter((transaction) => transaction.type === "ingreso")
    .reduce((sum, transaction) => sum + transaction.savings_amount, 0);
  const financeScale = Math.max(recentIncome, recentExpenses, recentSavings, 1);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-3xl border border-purple-100 bg-gradient-to-br from-white to-purple-50 p-5">
          <GraduationCap className="h-5 w-5 text-purple-600" />
          <p className="mt-4 text-3xl font-black text-slate-950">{gradeAverage?.toFixed(1) ?? "—"}</p>
          <p className="text-xs font-semibold text-purple-700">Promedio /10</p>
        </div>
        <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50 p-5">
          <PiggyBank className="h-5 w-5 text-emerald-600" />
          <p className="mt-4 text-3xl font-black text-slate-950">{formatCurrency(finance.totalSavings)}</p>
          <p className="text-xs font-semibold text-emerald-700">Bóveda de ahorro</p>
        </div>
        <div className="rounded-3xl border border-rose-100 bg-gradient-to-br from-white to-rose-50 p-5">
          <CheckCircle2 className="h-5 w-5 text-rose-600" />
          <p className="mt-4 text-3xl font-black text-slate-950">{completion}%</p>
          <p className="text-xs font-semibold text-rose-700">Tareas completas</p>
        </div>
        <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-white to-indigo-50 p-5">
          <WalletCards className="h-5 w-5 text-indigo-600" />
          <p className="mt-4 text-3xl font-black text-slate-950">{formatCurrency(finance.totalBalance)}</p>
          <p className="text-xs font-semibold text-indigo-700">Saldo disponible</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="border-sky-100">
          <CardBody>
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                <Droplets className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-sm font-black text-slate-900">Personal</h2>
                <p className="text-xs text-slate-400">Hábitos y cosas para ti.</p>
              </div>
            </div>

            <div className="space-y-4">
              <ProgressRow
                label="Tareas personales"
                value={personalTasks.pct}
                helper={personalTasks.total ? `${personalTasks.done} de ${personalTasks.total} completadas` : "Aún sin tareas personales"}
                tone="sky"
              />
              <ProgressRow
                label="Hidratación · 7 días"
                value={waterAverage}
                helper="Meta: 8 vasos diarios"
                tone="emerald"
              />
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Agua esta semana</p>
                <span className="text-[10px] font-bold text-sky-600">{waterAverage}% de la meta</span>
              </div>
              <div className="flex h-28 items-end gap-2 rounded-2xl bg-sky-50/50 p-3">
                {days.map((day) => {
                  const cups = waterMap.get(day.iso) ?? 0;
                  return (
                    <div key={day.iso} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1">
                      <div className="flex h-20 w-full items-end rounded-lg bg-white/80">
                        <div
                          className="w-full rounded-lg bg-sky-400"
                          style={{ height: `${Math.max(4, (cups / 8) * 100)}%` }}
                          title={`${cups}/8 vasos`}
                        />
                      </div>
                      <span className="text-[9px] font-bold uppercase text-slate-400">{day.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-purple-50 px-3 py-2.5">
              <Dumbbell className="h-4 w-4 text-purple-600" />
              <p className="text-xs text-slate-600">
                <strong className="text-slate-900">{weekWorkoutMinutes} min</strong> de movimiento registrados esta semana.
              </p>
            </div>
          </CardBody>
        </Card>

        <Card className="border-purple-100">
          <CardBody>
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                <BookOpenCheck className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-sm font-black text-slate-900">Académico</h2>
                <p className="text-xs text-slate-400">Tareas, asistencia y notas.</p>
              </div>
            </div>

            <div className="space-y-4">
              <ProgressRow
                label="Tareas de estudio"
                value={studyTasks.pct}
                helper={studyTasks.total ? `${studyTasks.done} de ${studyTasks.total} completadas` : "Aún sin tareas de estudio"}
                tone="purple"
              />
              <ProgressRow
                label="Asistencia promedio"
                value={attendanceAverage}
                helper={attendanceRows.length ? `${attendanceRows.length} materias con registros` : "Aún sin asistencia registrada"}
                tone={attendanceAverage >= 75 ? "emerald" : "rose"}
              />
              <ProgressRow
                label="Promedio de calificaciones"
                value={gradeAverage === null ? 0 : Math.round(gradeAverage * 10)}
                helper={gradeAverage === null ? "Aún sin calificaciones" : `${gradeAverage.toFixed(1)} sobre 10`}
                tone="amber"
              />
            </div>

            <div className="mt-5 rounded-2xl border border-purple-100 bg-purple-50/40 p-4">
              <p className="text-[10px] font-black uppercase tracking-wider text-purple-600">Lectura rápida</p>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                El umbral de asistencia está marcado en 75%. “No hubo clase” no baja el porcentaje.
              </p>
            </div>
          </CardBody>
        </Card>

        <Card className="border-emerald-100">
          <CardBody>
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <BarChart3 className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-sm font-black text-slate-900">Financiero</h2>
                <p className="text-xs text-slate-400">Flujo de los últimos 30 días.</p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { label: "Ingresos", amount: recentIncome, className: "bg-emerald-500" },
                { label: "Gastos", amount: recentExpenses, className: "bg-rose-500" },
                { label: "Ahorro separado", amount: recentSavings, className: "bg-amber-500" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <span className="text-xs font-black text-slate-800">{item.label}</span>
                    <span className="text-xs font-black text-slate-700">{formatCurrency(item.amount)}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${item.className}`}
                      style={{ width: `${(item.amount / financeScale) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <div className="rounded-2xl bg-emerald-50 p-3">
                <p className="text-[10px] font-bold uppercase text-emerald-600">Disponible</p>
                <p className="mt-1 text-sm font-black text-slate-900">{formatCurrency(finance.totalBalance)}</p>
              </div>
              <div className="rounded-2xl bg-amber-50 p-3">
                <p className="text-[10px] font-bold uppercase text-amber-600">Ahorros</p>
                <p className="mt-1 text-sm font-black text-slate-900">{formatCurrency(finance.totalSavings)}</p>
              </div>
              <div className="rounded-2xl bg-rose-50 p-3">
                <p className="text-[10px] font-bold uppercase text-rose-600">Debo</p>
                <p className="mt-1 text-sm font-black text-slate-900">{formatCurrency(finance.debtsOwed)}</p>
              </div>
              <div className="rounded-2xl bg-sky-50 p-3">
                <p className="text-[10px] font-bold uppercase text-sky-600">Me deben</p>
                <p className="mt-1 text-sm font-black text-slate-900">{formatCurrency(finance.debtsOwedToMe)}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody>
          <div className="mb-5">
            <h2 className="text-sm font-black text-slate-900">Tareas por área</h2>
            <p className="text-xs text-slate-400">Una comparación simple para ver dónde se te están acumulando pendientes.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <ProgressRow label="Estudio" value={studyTasks.pct} helper={`${studyTasks.done}/${studyTasks.total || 0} hechas`} tone="purple" />
            <ProgressRow label="Personal" value={personalTasks.pct} helper={`${personalTasks.done}/${personalTasks.total || 0} hechas`} tone="sky" />
            <ProgressRow label="Deseos" value={wishTasks.pct} helper={`${wishTasks.done}/${wishTasks.total || 0} hechas`} tone="amber" />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <div className="mb-5">
            <h2 className="text-sm font-black text-slate-900">Asistencia por materia</h2>
            <p className="text-xs text-slate-400">El 75% se calcula con registros reales; “no hubo” no penaliza.</p>
          </div>
          {attendance.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">Aún no hay asistencias registradas.</p>
          ) : (
            <div className="space-y-4">
              {attendance.map((item) => {
                const pct = item.attendance_pct ?? 0;
                const safe = pct >= 75;
                return (
                  <div key={item.subject_id}>
                    <div className="mb-1.5 flex items-end justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-slate-800">{item.subject_name}</p>
                        <p className="text-[10px] text-slate-400">{item.attended} asistidas · {item.missed} faltas · {item.cancelled} no hubo</p>
                      </div>
                      <span className={safe ? "text-xs font-black text-emerald-600" : "text-xs font-black text-rose-600"}>
                        {item.attendance_pct === null ? "—" : `${item.attendance_pct}%`}
                      </span>
                    </div>
                    <div className="relative h-3 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={safe ? "h-full rounded-full bg-purple-600" : "h-full rounded-full bg-rose-500"}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                      <div className="absolute inset-y-0 left-[75%] w-0.5 bg-rose-300" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <h2 className="mb-4 text-sm font-black text-slate-900">Últimas calificaciones</h2>
          {grades.length === 0 ? (
            <p className="py-4 text-sm text-slate-400">Aún no hay calificaciones registradas.</p>
          ) : (
            <div className="space-y-2">
              {grades.slice(0, 8).map((grade) => (
                <div key={grade.id} className="flex items-center justify-between gap-3 rounded-2xl border border-purple-100 bg-purple-50/40 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-purple-950">{grade.subject_name}</p>
                    <p className="truncate text-[10px] text-slate-400">{grade.exam_name} · {grade.exam_date}</p>
                  </div>
                  <span className="shrink-0 rounded-xl bg-white px-2.5 py-1 font-mono text-xs font-black text-purple-700 shadow-sm">
                    {grade.grade.toFixed(1)} / {grade.max_grade}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
