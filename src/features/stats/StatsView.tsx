import { BarChart3, CheckCircle2, GraduationCap, PiggyBank } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";

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

export function StatsView({
  tasks,
  finance,
  grades,
  attendance,
}: {
  tasks: { completed: boolean }[];
  finance: { totalSavings: number; totalBalance: number; debtsOwed: number; debtsOwedToMe: number };
  grades: GradeItem[];
  attendance: AttendanceItem[];
}) {
  const completed = tasks.filter((task) => task.completed).length;
  const completion = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  const gradeAverage = grades.length
    ? grades.reduce((sum, item) => sum + (item.grade / item.max_grade) * 10, 0) / grades.length
    : null;

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
          <p className="mt-4 text-3xl font-black text-slate-950">${finance.totalSavings.toFixed(2)}</p>
          <p className="text-xs font-semibold text-emerald-700">Bóveda de ahorro</p>
        </div>
        <div className="rounded-3xl border border-rose-100 bg-gradient-to-br from-white to-rose-50 p-5">
          <CheckCircle2 className="h-5 w-5 text-rose-600" />
          <p className="mt-4 text-3xl font-black text-slate-950">{completion}%</p>
          <p className="text-xs font-semibold text-rose-700">Tareas completas</p>
        </div>
        <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-white to-indigo-50 p-5">
          <BarChart3 className="h-5 w-5 text-indigo-600" />
          <p className="mt-4 text-3xl font-black text-slate-950">${finance.totalBalance.toFixed(2)}</p>
          <p className="text-xs font-semibold text-indigo-700">Saldo disponible</p>
        </div>
      </div>

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
                      <span className={safe ? "text-xs font-black text-emerald-600" : "text-xs font-black text-rose-600"}>{item.attendance_pct === null ? "—" : `${item.attendance_pct}%`}</span>
                    </div>
                    <div className="relative h-3 overflow-hidden rounded-full bg-slate-100">
                      <div className={safe ? "h-full rounded-full bg-purple-600" : "h-full rounded-full bg-rose-500"} style={{ width: `${Math.min(100, pct)}%` }} />
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
                  <span className="shrink-0 rounded-xl bg-white px-2.5 py-1 font-mono text-xs font-black text-purple-700 shadow-sm">{grade.grade.toFixed(1)} / {grade.max_grade}</span>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
