"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  Droplets,
  ListChecks,
  MessageSquareText,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MONTHS_ES, monthGrid, parseISO, toISODate } from "@/lib/dates";
import { getCalendarMonth, type CalendarMonthData } from "./queries";
import { cn } from "@/lib/utils";

const STATUS_LABELS = {
  asisti: "Asistí",
  falta: "Falta",
  no_hubo: "No hubo clase",
} as const;

const STATUS_STYLES = {
  asisti: "bg-emerald-50 text-emerald-700",
  falta: "bg-rose-50 text-rose-700",
  no_hubo: "bg-amber-50 text-amber-700",
} as const;

export function CalendarView({
  initialYear,
  initialMonth,
  initialData,
}: {
  initialYear: number;
  initialMonth: number;
  initialData: CalendarMonthData;
}) {
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [data, setData] = useState(initialData);
  const [selectedDate, setSelectedDate] = useState(toISODate());
  const [pending, startTransition] = useTransition();

  const cells = useMemo(() => monthGrid(year, month), [year, month]);
  const waterMap = useMemo(
    () => new Map(data.water.map((item) => [item.log_date, item.cups])),
    [data.water],
  );
  const attendanceMap = useMemo(
    () =>
      new Map(
        data.attendance.map((record) => [
          `${record.session_id}:${record.session_date}`,
          record,
        ]),
      ),
    [data.attendance],
  );

  const changeMonth = (delta: number) => {
    const next = new Date(year, month + delta, 1);
    const nextYear = next.getFullYear();
    const nextMonth = next.getMonth();
    setYear(nextYear);
    setMonth(nextMonth);
    setSelectedDate(`${nextYear}-${String(nextMonth + 1).padStart(2, "0")}-01`);

    startTransition(async () => {
      setData(await getCalendarMonth(nextYear, nextMonth));
    });
  };

  const selectedDayOfWeek = parseISO(selectedDate).getDay();
  const selectedTasks = data.tasks.filter((task) => task.due_date === selectedDate);
  const selectedWater = waterMap.get(selectedDate) ?? 0;
  const selectedClasses = data.classes.filter(
    (session) => session.day_of_week === selectedDayOfWeek,
  );

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
      <section className="rounded-3xl border border-indigo-100 bg-white/90 p-4 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => changeMonth(-1)} aria-label="Mes anterior">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="text-center">
            <h2 className="text-lg font-black capitalize text-slate-950">
              {MONTHS_ES[month]} {year}
            </h2>
            <p className="text-xs text-slate-400">
              {pending ? "Actualizando…" : "Clases, tareas e hidratación en una sola fecha"}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => changeMonth(1)} aria-label="Mes siguiente">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[10px] font-black uppercase tracking-wider text-indigo-500 sm:gap-2">
          {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => <div key={day}>{day}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {cells.map((iso, index) => {
            if (!iso) {
              return <div key={`empty-${index}`} className="min-h-20 rounded-2xl bg-slate-50/60 sm:min-h-24" />;
            }

            const dayTasks = data.tasks.filter((task) => task.due_date === iso);
            const cups = waterMap.get(iso) ?? 0;
            const dayOfWeek = parseISO(iso).getDay();
            const dayClasses = data.classes.filter((session) => session.day_of_week === dayOfWeek);
            const selected = selectedDate === iso;
            const today = toISODate() === iso;

            return (
              <button
                key={iso}
                type="button"
                onClick={() => setSelectedDate(iso)}
                className={cn(
                  "min-h-20 rounded-2xl border p-2 text-left transition-all sm:min-h-24",
                  selected
                    ? "border-purple-600 bg-purple-600 text-white shadow-md shadow-purple-600/20"
                    : "border-slate-100 bg-white text-slate-700 hover:border-purple-200 hover:bg-purple-50/50",
                  today && !selected && "ring-2 ring-indigo-200",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black">{parseISO(iso).getDate()}</span>
                  {today ? (
                    <span className={cn("h-1.5 w-1.5 rounded-full", selected ? "bg-white" : "bg-indigo-500")} />
                  ) : null}
                </div>
                <div className="mt-3 space-y-1">
                  {dayClasses.length > 0 ? (
                    <div className={cn("flex items-center gap-1 truncate text-[9px] font-bold", selected ? "text-white/90" : "text-purple-600")}>
                      <Clock3 className="h-3 w-3" /> {dayClasses.length} clase{dayClasses.length === 1 ? "" : "s"}
                    </div>
                  ) : null}
                  {dayTasks.length > 0 ? (
                    <div className={cn("truncate text-[9px] font-bold", selected ? "text-white/90" : "text-rose-600")}>
                      {dayTasks.length} tarea{dayTasks.length === 1 ? "" : "s"}
                    </div>
                  ) : null}
                  {cups > 0 ? (
                    <div className={cn("flex items-center gap-1 text-[9px] font-bold", selected ? "text-white/90" : "text-sky-600")}>
                      <Droplets className="h-3 w-3" /> {cups}/8
                    </div>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <aside className="rounded-3xl border border-purple-100 bg-gradient-to-br from-white via-purple-50/40 to-rose-50/50 p-5 shadow-sm">
        <span className="text-[10px] font-black uppercase tracking-[0.14em] text-purple-600">Fecha activa</span>
        <h3 className="mt-1 font-mono text-lg font-black text-slate-950">{selectedDate}</h3>

        <div className="mt-5 rounded-2xl border border-purple-100 bg-white/85 p-4">
          <div className="flex items-center gap-2 text-purple-700">
            <Clock3 className="h-4 w-4" />
            <span className="text-xs font-black">Clases y asistencia</span>
          </div>

          {selectedClasses.length === 0 ? (
            <p className="mt-3 text-xs text-slate-400">No hay clases oficiales este día.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {selectedClasses.map((session) => {
                const record = attendanceMap.get(`${session.id}:${selectedDate}`);
                return (
                  <div key={session.id} className="rounded-xl border border-purple-50 bg-purple-50/45 px-3 py-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[10px] font-black text-purple-700">
                          {session.start_time.slice(0, 5)}–{session.end_time.slice(0, 5)}
                        </p>
                        <p className="mt-0.5 text-xs font-bold leading-snug text-slate-800">{session.subject_name}</p>
                      </div>
                      {record ? (
                        <span className={cn("shrink-0 rounded-full px-2 py-1 text-[9px] font-black", STATUS_STYLES[record.status])}>
                          {STATUS_LABELS[record.status]}
                        </span>
                      ) : (
                        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[9px] font-bold text-slate-400">Pendiente</span>
                      )}
                    </div>
                    {record?.note ? (
                      <p className="mt-2 flex items-start gap-1 text-[9px] leading-relaxed text-indigo-500">
                        <MessageSquareText className="mt-0.5 h-3 w-3 shrink-0" /> {record.note}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}

          <Link href="/schedule" className="mt-3 inline-block text-xs font-bold text-purple-700 hover:underline">
            Abrir horario y registrar →
          </Link>
        </div>

        <div className="mt-3 rounded-2xl border border-rose-100 bg-white/80 p-4">
          <div className="flex items-center gap-2 text-rose-700">
            <ListChecks className="h-4 w-4" />
            <span className="text-xs font-black">Tareas del día</span>
          </div>
          {selectedTasks.length === 0 ? (
            <p className="mt-3 text-xs text-slate-400">No tienes tareas con vencimiento esta fecha.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {selectedTasks.map((task) => (
                <div key={task.id} className="rounded-xl bg-rose-50/60 px-3 py-2">
                  <p className={cn("text-xs font-bold text-slate-800", task.completed && "line-through opacity-50")}>{task.title}</p>
                  <p className="mt-0.5 text-[10px] font-semibold text-rose-600">Prioridad {task.priority}</p>
                </div>
              ))}
            </div>
          )}
          <Link href="/tasks" className="mt-3 inline-block text-xs font-bold text-rose-700 hover:underline">Abrir tareas →</Link>
        </div>

        <div className="mt-3 rounded-2xl border border-sky-100 bg-white/80 p-4">
          <div className="flex items-center gap-2 text-sky-700">
            <Droplets className="h-4 w-4" />
            <span className="text-xs font-black">Hidratación</span>
          </div>
          <p className="mt-2 text-xl font-black text-slate-950">{selectedWater * 250} ml</p>
          <p className="text-xs text-slate-400">{selectedWater} de 8 vasos</p>
          <Link href="/wellness" className="mt-2 inline-block text-xs font-bold text-sky-700 hover:underline">Abrir bienestar →</Link>
        </div>
      </aside>
    </div>
  );
}
