"use client";

import { CalendarDays, ClipboardList, GraduationCap, NotebookPen, Target } from "lucide-react";
import { monthGrid, parseISO } from "@/lib/dates";
import type { MonthlyContent, PlannerAccent } from "../types";
import { PLANNER_THEMES } from "../theme";
import { ListFields, PlannerSection, inputClass } from "./Primitives";
import { cn } from "@/lib/utils";

export function MonthlyPlanner({
  value,
  onChange,
  accent,
}: {
  value: MonthlyContent;
  onChange: (value: MonthlyContent) => void;
  accent: PlannerAccent;
}) {
  const theme = PLANNER_THEMES[accent];
  const [year, month] = value.month.split("-").map(Number);
  const cells = Number.isFinite(year) && Number.isFinite(month)
    ? monthGrid(year, month - 1)
    : [];

  return (
    <div className={cn("space-y-4 rounded-3xl p-3 sm:p-5", theme.page)}>
      <div className="grid gap-3 sm:grid-cols-2">
        <label>
          <span className="mb-1 block text-[11px] font-black uppercase tracking-wider text-slate-500">Mes</span>
          <input
            type="month"
            value={value.month}
            onChange={(e) => onChange({ ...value, month: e.target.value })}
            className={inputClass}
          />
        </label>
        <label>
          <span className="mb-1 flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-slate-500">
            <Target className="h-3.5 w-3.5" /> Objetivo del mes
          </span>
          <input
            value={value.goal}
            onChange={(e) => onChange({ ...value, goal: e.target.value })}
            placeholder="Ej. entregar todo a tiempo"
            className={inputClass}
          />
        </label>
      </div>

      <PlannerSection title="Vista mensual" icon={<CalendarDays className="h-4 w-4" />} accent={accent}>
        <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[9px] font-black uppercase text-slate-500 sm:text-[10px]">
          {["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"].map((day) => <div key={day}>{day}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {cells.map((iso, index) => {
            if (!iso) return <div key={`empty-${index}`} className="min-h-20 rounded-xl bg-slate-50 sm:min-h-24" />;
            const day = parseISO(iso).getDate();
            return (
              <label key={iso} className={cn("min-h-20 rounded-xl border bg-white p-1.5 sm:min-h-24", theme.border)}>
                <span className="block text-[10px] font-black text-slate-500">{day}</span>
                <textarea
                  value={value.dayNotes[iso] ?? ""}
                  onChange={(e) => onChange({
                    ...value,
                    dayNotes: { ...value.dayNotes, [iso]: e.target.value },
                  })}
                  placeholder="…"
                  className="mt-1 h-12 w-full resize-none bg-transparent text-[9px] leading-tight text-slate-600 outline-none sm:h-16 sm:text-[10px]"
                />
              </label>
            );
          })}
        </div>
      </PlannerSection>

      <div className="grid gap-4 lg:grid-cols-3">
        <PlannerSection title="Materias" icon={<GraduationCap className="h-4 w-4" />} accent={accent}>
          <ListFields values={value.subjects} onChange={(subjects) => onChange({ ...value, subjects })} placeholder="Materia…" />
        </PlannerSection>
        <div className="space-y-4">
          <PlannerSection title="Fechas importantes" icon={<CalendarDays className="h-4 w-4" />} accent={accent}>
            <ListFields values={value.importantDates} onChange={(importantDates) => onChange({ ...value, importantDates })} placeholder="Fecha / evento…" />
          </PlannerSection>
          <PlannerSection title="Trabajos" icon={<ClipboardList className="h-4 w-4" />} accent={accent}>
            <ListFields values={value.assignments} onChange={(assignments) => onChange({ ...value, assignments })} placeholder="Trabajo…" />
          </PlannerSection>
        </div>
        <div className="space-y-4">
          <PlannerSection title="Exámenes" icon={<GraduationCap className="h-4 w-4" />} accent={accent}>
            <ListFields values={value.exams} onChange={(exams) => onChange({ ...value, exams })} placeholder="Examen…" />
          </PlannerSection>
          <PlannerSection title="Notas" icon={<NotebookPen className="h-4 w-4" />} accent={accent}>
            <textarea
              value={value.notes}
              onChange={(e) => onChange({ ...value, notes: e.target.value })}
              className="min-h-28 w-full resize-y rounded-xl border border-dashed border-slate-200 bg-white p-3 text-sm outline-none focus:border-purple-300"
              placeholder="Notas del mes…"
            />
          </PlannerSection>
        </div>
      </div>

      <PlannerSection title="Seguimiento" icon={<ClipboardList className="h-4 w-4" />} accent={accent}>
        <div className="overflow-x-auto">
          <div className="min-w-[780px] space-y-2">
            <div className="grid grid-cols-[150px_repeat(31,18px)] gap-1 text-center text-[8px] text-slate-400">
              <span />
              {Array.from({ length: 31 }, (_, i) => <span key={i}>{i + 1}</span>)}
            </div>
            {value.habits.map((habit, habitIndex) => (
              <div key={habitIndex} className="grid grid-cols-[150px_repeat(31,18px)] items-center gap-1">
                <input
                  value={habit.name}
                  onChange={(e) => {
                    const habits = value.habits.map((item, i) => i === habitIndex ? { ...item, name: e.target.value } : item);
                    onChange({ ...value, habits });
                  }}
                  className="h-7 rounded-lg border border-slate-200 px-2 text-[10px] outline-none"
                />
                {habit.days.map((checked, dayIndex) => (
                  <button
                    key={dayIndex}
                    type="button"
                    onClick={() => {
                      const days = [...habit.days];
                      days[dayIndex] = !days[dayIndex];
                      const habits = value.habits.map((item, i) => i === habitIndex ? { ...item, days } : item);
                      onChange({ ...value, habits });
                    }}
                    className={cn(
                      "h-4 w-4 rounded-full border",
                      checked ? theme.button.split(" ")[0] + " border-transparent" : "border-slate-300 bg-white",
                    )}
                    aria-label={`${habit.name || "Hábito"} día ${dayIndex + 1}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </PlannerSection>
    </div>
  );
}
