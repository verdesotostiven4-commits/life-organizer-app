"use client";

import { CalendarDays, Flag, FolderKanban, NotebookPen, Target, UserRound } from "lucide-react";
import type { PlannerAccent, ProjectContent } from "../types";
import { ListFields, PlannerSection, inputClass } from "./Primitives";
import { PLANNER_THEMES } from "../theme";
import { cn } from "@/lib/utils";

export function ProjectPlanner({
  value,
  onChange,
  accent,
}: {
  value: ProjectContent;
  onChange: (value: ProjectContent) => void;
  accent: PlannerAccent;
}) {
  const theme = PLANNER_THEMES[accent];

  return (
    <div className={cn("space-y-4 rounded-3xl p-3 sm:p-5", theme.page)}>
      <div className="grid gap-3 lg:grid-cols-2">
        <label>
          <span className="mb-1 block text-[11px] font-black uppercase tracking-wider text-slate-500">Nombre del proyecto</span>
          <input value={value.projectName} onChange={(e)=>onChange({...value,projectName:e.target.value})} className={inputClass} placeholder="Ej. Proyecto final de Estadística" />
        </label>
        <label>
          <span className="mb-1 flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-slate-500"><Target className="h-3.5 w-3.5" /> Objetivo</span>
          <input value={value.objective} onChange={(e)=>onChange({...value,objective:e.target.value})} className={inputClass} placeholder="Resultado que quieres conseguir" />
        </label>
        <label>
          <span className="mb-1 flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-slate-500"><CalendarDays className="h-3.5 w-3.5" /> Fecha límite</span>
          <input type="date" value={value.deadline} onChange={(e)=>onChange({...value,deadline:e.target.value})} className={inputClass} />
        </label>
        <label>
          <span className="mb-1 flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-slate-500"><UserRound className="h-3.5 w-3.5" /> Responsable / equipo</span>
          <input value={value.owner} onChange={(e)=>onChange({...value,owner:e.target.value})} className={inputClass} placeholder="Nombre o equipo" />
        </label>
      </div>

      <PlannerSection title="Hitos principales" icon={<Flag className="h-4 w-4" />} accent={accent}>
        <ListFields values={value.milestones} onChange={(milestones)=>onChange({...value,milestones})} placeholder="Hito…" />
      </PlannerSection>

      <PlannerSection title="Tablero del proyecto" icon={<FolderKanban className="h-4 w-4" />} accent={accent}>
        <div className="grid gap-3 lg:grid-cols-3">
          {[
            ["Por hacer","backlog"],
            ["En curso","inProgress"],
            ["Hecho","done"],
          ].map(([label,key])=>{
            const field=key as "backlog"|"inProgress"|"done";
            return (
              <div key={field} className={cn("rounded-2xl border p-3", theme.border, theme.soft)}>
                <p className="mb-3 text-xs font-black text-slate-800">{label}</p>
                <ListFields
                  values={value[field]}
                  onChange={(items)=>onChange({...value,[field]:items})}
                  placeholder={label+"…"}
                />
              </div>
            );
          })}
        </div>
      </PlannerSection>

      <div className="grid gap-4 lg:grid-cols-2">
        <PlannerSection title="Recursos / enlaces" icon={<FolderKanban className="h-4 w-4" />} accent={accent}>
          <ListFields values={value.resources} onChange={(resources)=>onChange({...value,resources})} placeholder="Recurso, enlace o archivo…" />
        </PlannerSection>
        <PlannerSection title="Notas del proyecto" icon={<NotebookPen className="h-4 w-4" />} accent={accent}>
          <textarea value={value.notes} onChange={(e)=>onChange({...value,notes:e.target.value})} className="min-h-44 w-full resize-y rounded-xl border border-dashed border-slate-200 bg-white p-3 text-sm outline-none focus:border-purple-300" placeholder="Decisiones, ideas, observaciones…" />
        </PlannerSection>
      </div>
    </div>
  );
}
