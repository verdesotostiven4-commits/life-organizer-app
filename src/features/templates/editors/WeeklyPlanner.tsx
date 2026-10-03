"use client";

import { CalendarDays, ClipboardList, GraduationCap, NotebookPen, Star, Target } from "lucide-react";
import type { PlannerAccent, WeeklyContent } from "../types";
import { ListFields, PlannerSection, compactInputClass, inputClass } from "./Primitives";
import { PLANNER_THEMES } from "../theme";
import { cn } from "@/lib/utils";

const DAYS = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];

export function WeeklyPlanner({
  value,
  onChange,
  accent,
}: {
  value: WeeklyContent;
  onChange: (value: WeeklyContent) => void;
  accent: PlannerAccent;
}) {
  const theme = PLANNER_THEMES[accent];

  return (
    <div className={cn("space-y-4 rounded-3xl p-3 sm:p-5", theme.page)}>
      <div className="grid gap-3 sm:grid-cols-2">
        <label>
          <span className="mb-1 block text-[11px] font-black uppercase tracking-wider text-slate-500">Semana de</span>
          <input type="date" value={value.weekOf} onChange={(e)=>onChange({...value,weekOf:e.target.value})} className={inputClass} />
        </label>
        <label>
          <span className="mb-1 flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-slate-500"><Target className="h-3.5 w-3.5" /> Meta principal</span>
          <input value={value.goal} onChange={(e)=>onChange({...value,goal:e.target.value})} placeholder="Meta de la semana" className={inputClass} />
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {DAYS.map((day) => {
          const current = value.days[day];
          return (
            <PlannerSection key={day} title={day} icon={<CalendarDays className="h-4 w-4" />} accent={accent}>
              <div>
                <p className="mb-2 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-400"><Star className="h-3 w-3" /> Prioridades</p>
                <ListFields
                  values={current.priorities}
                  onChange={(priorities)=>onChange({...value,days:{...value.days,[day]:{...current,priorities}}})}
                  placeholder="Prioridad…"
                />
              </div>
              <div className="mt-4">
                <p className="mb-2 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-400"><ClipboardList className="h-3 w-3" /> Tareas</p>
                <ListFields
                  values={current.tasks}
                  onChange={(tasks)=>onChange({...value,days:{...value.days,[day]:{...current,tasks}}})}
                  placeholder="Tarea…"
                />
              </div>
              <div className="mt-4">
                <p className="mb-1 text-[10px] font-black uppercase tracking-wider text-slate-400">Notas</p>
                <textarea
                  value={current.note}
                  onChange={(e)=>onChange({...value,days:{...value.days,[day]:{...current,note:e.target.value}}})}
                  className="min-h-20 w-full resize-y rounded-xl border border-dashed border-slate-200 bg-white p-2 text-xs outline-none focus:border-purple-300"
                  placeholder="Notas del día…"
                />
              </div>
            </PlannerSection>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <PlannerSection title="Top 3 prioridades" icon={<Star className="h-4 w-4" />} accent={accent}>
          <ListFields values={value.topPriorities} onChange={(topPriorities)=>onChange({...value,topPriorities})} placeholder="Prioridad…" />
        </PlannerSection>
        <PlannerSection title="Tareas pendientes" icon={<ClipboardList className="h-4 w-4" />} accent={accent}>
          <ListFields values={value.pending} onChange={(pending)=>onChange({...value,pending})} placeholder="Pendiente…" />
        </PlannerSection>
        <PlannerSection title="Exámenes / entregas" icon={<GraduationCap className="h-4 w-4" />} accent={accent}>
          <ListFields values={value.exams} onChange={(exams)=>onChange({...value,exams})} placeholder="Examen o entrega…" />
        </PlannerSection>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_.9fr]">
        <PlannerSection title="Hábitos de estudio" icon={<ClipboardList className="h-4 w-4" />} accent={accent}>
          <div className="overflow-x-auto">
            <div className="min-w-[520px]">
              <div className="grid grid-cols-[160px_repeat(7,1fr)] gap-2 text-center text-[9px] font-black uppercase text-slate-400">
                <span />
                {["L","M","M","J","V","S","D"].map((label,index)=><span key={index}>{label}</span>)}
              </div>
              <div className="mt-2 space-y-2">
                {value.habits.map((habit, habitIndex)=>(
                  <div key={habitIndex} className="grid grid-cols-[160px_repeat(7,1fr)] items-center gap-2">
                    <input
                      value={habit.name}
                      onChange={(e)=>{
                        const habits=value.habits.map((item,i)=>i===habitIndex?{...item,name:e.target.value}:item);
                        onChange({...value,habits});
                      }}
                      className={compactInputClass}
                    />
                    {habit.days.map((done,dayIndex)=>(
                      <button
                        key={dayIndex}
                        type="button"
                        onClick={()=>{
                          const days=[...habit.days]; days[dayIndex]=!days[dayIndex];
                          const habits=value.habits.map((item,i)=>i===habitIndex?{...item,days}:item);
                          onChange({...value,habits});
                        }}
                        className={cn(
                          "mx-auto h-5 w-5 rounded-full border",
                          done ? theme.button.split(" ")[0]+" border-transparent" : "border-slate-300 bg-white",
                        )}
                        aria-label={`${habit.name || "Hábito"} ${dayIndex+1}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </PlannerSection>

        <PlannerSection title="Notas rápidas" icon={<NotebookPen className="h-4 w-4" />} accent={accent}>
          <textarea value={value.notes} onChange={(e)=>onChange({...value,notes:e.target.value})} className="min-h-48 w-full resize-y rounded-xl border border-dashed border-slate-200 bg-white p-3 text-sm outline-none focus:border-purple-300" placeholder="Ideas, recordatorios o notas de la semana…" />
        </PlannerSection>
      </div>
    </div>
  );
}
