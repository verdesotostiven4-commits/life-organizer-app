"use client";

import { AlertCircle, ClipboardCheck, FileText, GraduationCap, NotebookPen } from "lucide-react";
import type { DeliveriesContent, PlannerAccent } from "../types";
import { PlannerSection, ListFields, inputClass, compactInputClass } from "./Primitives";
import { PLANNER_THEMES } from "../theme";
import { cn } from "@/lib/utils";

export function DeliveriesPlanner({
  value,
  onChange,
  accent,
}: {
  value: DeliveriesContent;
  onChange: (value: DeliveriesContent) => void;
  accent: PlannerAccent;
}) {
  const theme = PLANNER_THEMES[accent];

  return (
    <div className={cn("space-y-4 rounded-3xl p-3 sm:p-5", theme.page)}>
      <div className="grid gap-3 sm:grid-cols-2">
        <label>
          <span className="mb-1 block text-[11px] font-black uppercase tracking-wider text-slate-500">Periodo</span>
          <input value={value.period} onChange={(e) => onChange({ ...value, period: e.target.value })} placeholder="Ej. Octubre 2026" className={inputClass} />
        </label>
        <label>
          <span className="mb-1 block text-[11px] font-black uppercase tracking-wider text-slate-500">Objetivo académico</span>
          <input value={value.objective} onChange={(e) => onChange({ ...value, objective: e.target.value })} placeholder="Ej. entregar todo sin atrasos" className={inputClass} />
        </label>
      </div>

      <PlannerSection title="Seguimiento de tareas" icon={<ClipboardCheck className="h-4 w-4" />} accent={accent}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] border-separate border-spacing-0 text-xs">
            <thead>
              <tr className={cn(theme.header, theme.text)}>
                {["Materia","Actividad","Fecha","Prioridad","Estado"].map((label) => (
                  <th key={label} className={cn("border-b border-r p-2 text-left last:border-r-0", theme.border)}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {value.tasks.map((task, index) => (
                <tr key={index}>
                  <td className={cn("border-b border-r p-1", theme.border)}>
                    <input value={task.subject} onChange={(e) => {
                      const tasks=[...value.tasks]; tasks[index]={...task,subject:e.target.value}; onChange({...value,tasks});
                    }} className={compactInputClass} placeholder="Materia" />
                  </td>
                  <td className={cn("border-b border-r p-1", theme.border)}>
                    <input value={task.activity} onChange={(e) => {
                      const tasks=[...value.tasks]; tasks[index]={...task,activity:e.target.value}; onChange({...value,tasks});
                    }} className={compactInputClass} placeholder="Actividad" />
                  </td>
                  <td className={cn("border-b border-r p-1", theme.border)}>
                    <input type="date" value={task.date} onChange={(e) => {
                      const tasks=[...value.tasks]; tasks[index]={...task,date:e.target.value}; onChange({...value,tasks});
                    }} className={compactInputClass} />
                  </td>
                  <td className={cn("border-b border-r p-1", theme.border)}>
                    <select value={task.priority} onChange={(e) => {
                      const tasks=[...value.tasks]; tasks[index]={...task,priority:e.target.value as typeof task.priority}; onChange({...value,tasks});
                    }} className={compactInputClass}>
                      <option value="alta">Alta</option>
                      <option value="media">Media</option>
                      <option value="baja">Baja</option>
                    </select>
                  </td>
                  <td className={cn("border-b p-1", theme.border)}>
                    <select value={task.status} onChange={(e) => {
                      const tasks=[...value.tasks]; tasks[index]={...task,status:e.target.value as typeof task.status}; onChange({...value,tasks});
                    }} className={compactInputClass}>
                      <option value="pendiente">Pendiente</option>
                      <option value="en_proceso">En proceso</option>
                      <option value="completada">Completada</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PlannerSection>

      <PlannerSection title="Calendario de exámenes" icon={<GraduationCap className="h-4 w-4" />} accent={accent}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-separate border-spacing-0 text-xs">
            <thead>
              <tr className={cn(theme.header, theme.text)}>
                {["Materia","Tema","Fecha","Hora","Aula"].map((label) => (
                  <th key={label} className={cn("border-b border-r p-2 text-left last:border-r-0", theme.border)}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {value.exams.map((exam, index) => (
                <tr key={index}>
                  {(["subject","topic","date","time","room"] as const).map((field) => (
                    <td key={field} className={cn("border-b border-r p-1 last:border-r-0", theme.border)}>
                      <input
                        type={field === "date" ? "date" : field === "time" ? "time" : "text"}
                        value={exam[field]}
                        onChange={(e) => {
                          const exams=[...value.exams]; exams[index]={...exam,[field]:e.target.value}; onChange({...value,exams});
                        }}
                        className={compactInputClass}
                        placeholder={field === "subject" ? "Materia" : field === "topic" ? "Tema" : field === "room" ? "Aula" : undefined}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PlannerSection>

      <div className="grid gap-4 lg:grid-cols-3">
        <PlannerSection title="Proyectos" icon={<FileText className="h-4 w-4" />} accent={accent}>
          <ListFields values={value.projects} onChange={(projects) => onChange({...value,projects})} placeholder="Proyecto…" />
        </PlannerSection>
        <PlannerSection title="Pendientes importantes" icon={<AlertCircle className="h-4 w-4" />} accent={accent}>
          <ListFields values={value.important} onChange={(important) => onChange({...value,important})} placeholder="Pendiente…" />
        </PlannerSection>
        <PlannerSection title="Notas" icon={<NotebookPen className="h-4 w-4" />} accent={accent}>
          <textarea value={value.notes} onChange={(e) => onChange({...value,notes:e.target.value})} placeholder="Notas…" className="min-h-44 w-full resize-y rounded-xl border border-dashed border-slate-200 p-3 text-sm outline-none focus:border-purple-300" />
        </PlannerSection>
      </div>
    </div>
  );
}
