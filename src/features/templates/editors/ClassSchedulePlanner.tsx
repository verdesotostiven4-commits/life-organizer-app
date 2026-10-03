"use client";

import { Bell, BookOpen, Clock3, Target, UserRound } from "lucide-react";
import type { ClassScheduleContent, PlannerAccent } from "../types";
import { ListFields, PlannerSection, compactInputClass, inputClass } from "./Primitives";
import { PLANNER_THEMES } from "../theme";
import { cn } from "@/lib/utils";

const DAYS = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
const HOURS = Array.from({ length: 15 }, (_, i) => `${String(i + 7).padStart(2,"0")}:00`);

export function ClassSchedulePlanner({
  value,
  onChange,
  accent,
}: {
  value: ClassScheduleContent;
  onChange: (value: ClassScheduleContent) => void;
  accent: PlannerAccent;
}) {
  const theme = PLANNER_THEMES[accent];

  return (
    <div className={cn("space-y-4 rounded-3xl p-3 sm:p-5", theme.page)}>
      <div className="grid gap-3 md:grid-cols-3">
        <label>
          <span className="mb-1 block text-[11px] font-black uppercase tracking-wider text-slate-500">Nombre</span>
          <input value={value.name} onChange={(e)=>onChange({...value,name:e.target.value})} className={inputClass} placeholder="Tu nombre" />
        </label>
        <label>
          <span className="mb-1 block text-[11px] font-black uppercase tracking-wider text-slate-500">Carrera</span>
          <input value={value.career} onChange={(e)=>onChange({...value,career:e.target.value})} className={inputClass} placeholder="Carrera" />
        </label>
        <label>
          <span className="mb-1 block text-[11px] font-black uppercase tracking-wider text-slate-500">Semestre</span>
          <input value={value.semester} onChange={(e)=>onChange({...value,semester:e.target.value})} className={inputClass} placeholder="Ej. Cuarto" />
        </label>
      </div>

      <PlannerSection title="Horario de clases" icon={<Clock3 className="h-4 w-4" />} accent={accent}>
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            <div className="grid grid-cols-[76px_repeat(6,1fr)]">
              <div className={cn("border-b border-r p-2 text-xs font-black", theme.header, theme.border)}>Hora</div>
              {DAYS.map((day) => <div key={day} className={cn("border-b border-r p-2 text-xs font-black last:border-r-0", theme.header, theme.border, theme.text)}>{day}</div>)}
              {HOURS.map((hour) => (
                <>
                  <div key={`${hour}-label`} className={cn("border-b border-r bg-slate-50 p-2 font-mono text-[11px] font-bold text-slate-600", theme.border)}>{hour}</div>
                  {DAYS.map((day) => {
                    const key=`${day}-${hour}`;
                    return (
                      <div key={key} className={cn("min-h-14 border-b border-r p-1 last:border-r-0", theme.border)}>
                        <textarea
                          value={value.schedule[key] ?? ""}
                          onChange={(e)=>onChange({...value,schedule:{...value.schedule,[key]:e.target.value}})}
                          placeholder="Materia / aula"
                          className="h-12 w-full resize-none rounded-lg bg-white px-2 py-1 text-[10px] leading-tight text-slate-700 outline-none focus:ring-1 focus:ring-purple-100"
                        />
                      </div>
                    );
                  })}
                </>
              ))}
            </div>
          </div>
        </div>
      </PlannerSection>

      <div className="grid gap-4 md:grid-cols-2">
        <PlannerSection title="Materias" icon={<BookOpen className="h-4 w-4" />} accent={accent}>
          <ListFields values={value.subjects} onChange={(subjects)=>onChange({...value,subjects})} placeholder="Materia…" />
        </PlannerSection>
        <PlannerSection title="Profesores" icon={<UserRound className="h-4 w-4" />} accent={accent}>
          <ListFields values={value.professors} onChange={(professors)=>onChange({...value,professors})} placeholder="Profesor/a…" />
        </PlannerSection>
        <PlannerSection title="Recordatorios" icon={<Bell className="h-4 w-4" />} accent={accent}>
          <ListFields values={value.reminders} onChange={(reminders)=>onChange({...value,reminders})} placeholder="Recordatorio…" />
        </PlannerSection>
        <PlannerSection title="Objetivos de la semana" icon={<Target className="h-4 w-4" />} accent={accent}>
          <ListFields values={value.goals} onChange={(goals)=>onChange({...value,goals})} placeholder="Objetivo…" />
        </PlannerSection>
      </div>
    </div>
  );
}
