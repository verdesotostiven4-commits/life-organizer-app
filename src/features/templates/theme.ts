import type { PlannerAccent } from "./types";

export const PLANNER_THEMES: Record<
  PlannerAccent,
  {
    label: string;
    page: string;
    panel: string;
    header: string;
    border: string;
    text: string;
    button: string;
    soft: string;
    dot: string;
  }
> = {
  sky: {
    label: "Azul académico",
    page: "bg-sky-50/40",
    panel: "bg-white",
    header: "bg-sky-100/90",
    border: "border-sky-200",
    text: "text-sky-950",
    button: "bg-sky-700 hover:bg-sky-800",
    soft: "bg-sky-50",
    dot: "bg-sky-300",
  },
  lavender: {
    label: "Lavanda",
    page: "bg-violet-50/40",
    panel: "bg-white",
    header: "bg-violet-100/90",
    border: "border-violet-200",
    text: "text-violet-950",
    button: "bg-violet-700 hover:bg-violet-800",
    soft: "bg-violet-50",
    dot: "bg-violet-300",
  },
  rose: {
    label: "Rosa",
    page: "bg-rose-50/40",
    panel: "bg-white",
    header: "bg-rose-100/90",
    border: "border-rose-200",
    text: "text-rose-950",
    button: "bg-rose-700 hover:bg-rose-800",
    soft: "bg-rose-50",
    dot: "bg-rose-300",
  },
  sage: {
    label: "Salvia",
    page: "bg-emerald-50/40",
    panel: "bg-white",
    header: "bg-emerald-100/90",
    border: "border-emerald-200",
    text: "text-emerald-950",
    button: "bg-emerald-700 hover:bg-emerald-800",
    soft: "bg-emerald-50",
    dot: "bg-emerald-300",
  },
  sand: {
    label: "Arena",
    page: "bg-amber-50/40",
    panel: "bg-white",
    header: "bg-amber-100/90",
    border: "border-amber-200",
    text: "text-amber-950",
    button: "bg-amber-700 hover:bg-amber-800",
    soft: "bg-amber-50",
    dot: "bg-amber-300",
  },
  mono: {
    label: "Minimal",
    page: "bg-slate-50",
    panel: "bg-white",
    header: "bg-slate-100",
    border: "border-slate-300",
    text: "text-slate-950",
    button: "bg-slate-900 hover:bg-slate-800",
    soft: "bg-slate-50",
    dot: "bg-slate-400",
  },
};
