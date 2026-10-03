"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { PlannerAccent } from "../types";
import { PLANNER_THEMES } from "../theme";

export const inputClass =
  "min-h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition-colors focus:border-purple-300 focus:ring-2 focus:ring-purple-100";

export const compactInputClass =
  "min-h-8 w-full rounded-lg border border-transparent bg-white/80 px-2 text-xs text-slate-700 outline-none focus:border-purple-200 focus:ring-1 focus:ring-purple-100";

export function PlannerSection({
  title,
  icon,
  accent,
  children,
  className,
}: {
  title: string;
  icon?: ReactNode;
  accent: PlannerAccent;
  children: ReactNode;
  className?: string;
}) {
  const theme = PLANNER_THEMES[accent];
  return (
    <section className={cn("overflow-hidden rounded-2xl border bg-white", theme.border, className)}>
      <div className={cn("flex items-center gap-2 px-4 py-2.5", theme.header, theme.text)}>
        {icon}
        <h3 className="text-sm font-black">{title}</h3>
      </div>
      <div className="p-3 sm:p-4">{children}</div>
    </section>
  );
}

export function ListFields({
  values,
  onChange,
  placeholder = "Escribe aquí…",
}: {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      {values.map((value, index) => (
        <div key={index} className="flex items-center gap-2">
          <span className="h-2 w-2 shrink-0 rounded-full bg-slate-300" />
          <input
            value={value}
            onChange={(event) => {
              const next = [...values];
              next[index] = event.target.value;
              onChange(next);
            }}
            placeholder={placeholder}
            className={compactInputClass}
          />
        </div>
      ))}
    </div>
  );
}

export function CheckListFields({
  values,
  onChange,
}: {
  values: string[];
  onChange: (values: string[]) => void;
}) {
  return (
    <div className="space-y-2">
      {values.map((value, index) => (
        <div key={index} className="flex items-center gap-2">
          <span className="h-4 w-4 shrink-0 rounded border border-slate-300 bg-white" />
          <input
            value={value}
            onChange={(event) => {
              const next = [...values];
              next[index] = event.target.value;
              onChange(next);
            }}
            placeholder="Pendiente…"
            className={compactInputClass}
          />
        </div>
      ))}
    </div>
  );
}
