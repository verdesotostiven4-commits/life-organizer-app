"use client";

import { Bell, BookOpen, CheckCircle2, Clock3, NotebookPen, Star, Target, Timer } from "lucide-react";
import type { DailyStudyContent, PlannerAccent } from "../types";
import { CheckListFields, ListFields, PlannerSection, inputClass } from "./Primitives";
import { PLANNER_THEMES } from "../theme";
import { cn } from "@/lib/utils";

const HOURS = Array.from({ length: 17 }, (_, i) => `${String(i + 6).padStart(2,"0")}:00`);

export function DailyStudyPlanner({
  value,
  onChange,
  accent,
}: {
  value: DailyStudyContent;
  onChange: (value: DailyStudyContent) => void;
  accent: PlannerAccent;
}) {
  const theme = PLANNER_THEMES[accent];

  return (
    <div className={cn("space-y-4 rounded-3xl p-3 sm:p-5", theme.page)}>
      <div className="grid gap-3 md:grid-cols-3">
        <label>
          <span className="mb-1 block text-[11px] font-black uppercase tracking-wider text-slate-500">Fecha</span>
          <input type="date" value={value.date} onChange={(e)=>onChange({...value,date:e.target.value})} className={inputClass} />
        </label>
        <label>
          <span className="mb-1 block text-[11px] font-black uppercase tracking-wider text-slate-500">Materia principal</span>
          <input value={value.subject} onChange={(e)=>onChange({...value,subject:e.target.value})} className={inputClass} placeholder="Materia" />
        </label>
        <label>
          <span className="mb-1 block text-[11px] font-black uppercase tracking-wider text-slate-500">Estado de ánimo</span>
          <select value={value.mood} onChange={(e)=>onChange({...value,mood:e.target.value})} className={inputClass}>
            {["😕","😐","🙂","😊","🤩"].map((mood)=><option key={mood}>{mood}</option>)}
          </select>
        </label>
      </div>

      <div className="grid gap-4 xl:grid-cols-[.9fr_1.1fr]">
        <PlannerSection title="Horario de estudio" icon={<Clock3 className="h-4 w-4" />} accent={accent}>
          <div className="space-y-1">
            {HOURS.map((hour)=>(
              <div key={hour} className="grid grid-cols-[58px_1fr] items-stretch">
                <div className="flex items-center border-b border-slate-100 font-mono text-[10px] font-bold text-slate-500">{hour}</div>
                <input
                  value={value.schedule[hour] ?? ""}
                  onChange={(e)=>onChange({...value,schedule:{...value.schedule,[hour]:e.target.value}})}
                  className="min-h-10 border-b border-l border-slate-100 bg-white px-2 text-xs outline-none focus:bg-purple-50/40"
                  placeholder="Bloque / actividad"
                />
              </div>
            ))}
          </div>
        </PlannerSection>

        <div className="space-y-4">
          <PlannerSection title="Objetivo del día" icon={<Target className="h-4 w-4" />} accent={accent}>
            <textarea value={value.objective} onChange={(e)=>onChange({...value,objective:e.target.value})} className="min-h-24 w-full resize-y rounded-xl border border-dashed border-slate-200 p-3 text-sm outline-none focus:border-purple-300" placeholder="¿Qué quieres lograr hoy?" />
          </PlannerSection>

          <PlannerSection title="Tareas del día" icon={<CheckCircle2 className="h-4 w-4" />} accent={accent}>
            <CheckListFields values={value.tasks} onChange={(tasks)=>onChange({...value,tasks})} />
          </PlannerSection>

          <PlannerSection title="Sesiones de estudio (Pomodoro)" icon={<Timer className="h-4 w-4" />} accent={accent}>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Duración</span>
              {["25","50"].map((duration)=>(
                <button key={duration} type="button" onClick={()=>onChange({...value,duration})} className={cn("rounded-full px-3 py-1.5 text-xs font-black", value.duration===duration ? theme.button+" text-white" : "bg-slate-100 text-slate-600")}>{duration} min</button>
              ))}
              <input value={value.duration} onChange={(e)=>onChange({...value,duration:e.target.value})} className="h-8 w-20 rounded-full border border-slate-200 px-3 text-xs outline-none" aria-label="Duración personalizada" />
            </div>
            <div className="grid grid-cols-5 gap-3 sm:grid-cols-10">
              {value.pomodoros.map((done,index)=>(
                <button key={index} type="button" onClick={()=>{
                  const pomodoros=[...value.pomodoros]; pomodoros[index]=!pomodoros[index]; onChange({...value,pomodoros});
                }} className={cn("flex aspect-square items-center justify-center rounded-full border text-[10px] font-black", done ? theme.button+" border-transparent text-white" : "border-slate-300 bg-white text-slate-400")} aria-label={`Sesión ${index+1}`}>{index+1}</button>
              ))}
            </div>
          </PlannerSection>

          <div className="grid gap-4 sm:grid-cols-2">
            <PlannerSection title="Prioridades" icon={<Star className="h-4 w-4" />} accent={accent}>
              <ListFields values={value.priorities} onChange={(priorities)=>onChange({...value,priorities})} placeholder="Prioridad…" />
            </PlannerSection>
            <PlannerSection title="Recordatorios" icon={<Bell className="h-4 w-4" />} accent={accent}>
              <ListFields values={value.reminders} onChange={(reminders)=>onChange({...value,reminders})} placeholder="Recordatorio…" />
            </PlannerSection>
          </div>
        </div>
      </div>

      <PlannerSection title="Reflexión / logros del día" icon={<NotebookPen className="h-4 w-4" />} accent={accent}>
        <textarea value={value.reflection} onChange={(e)=>onChange({...value,reflection:e.target.value})} className="min-h-32 w-full resize-y rounded-xl border border-dashed border-slate-200 p-3 text-sm outline-none focus:border-purple-300" placeholder="¿Qué salió bien? ¿Qué aprendiste?" />
      </PlannerSection>
    </div>
  );
}
