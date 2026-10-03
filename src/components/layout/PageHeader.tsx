import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "purple" | "sky" | "rose" | "emerald" | "amber" | "indigo";

const TONES: Record<Tone, string> = {
  purple: "bg-purple-50 text-purple-700 border-purple-100",
  sky: "bg-sky-50 text-sky-700 border-sky-100",
  rose: "bg-rose-50 text-rose-700 border-rose-100",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
  amber: "bg-amber-50 text-amber-700 border-amber-100",
  indigo: "bg-indigo-50 text-indigo-700 border-indigo-100",
};

export function PageHeader({
  eyebrow,
  title,
  description,
  icon,
  tone = "purple",
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  tone?: Tone;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <div className={cn("mb-2 inline-flex items-center gap-2 rounded-xl border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em]", TONES[tone])}>
            {icon}
            {eyebrow}
          </div>
        )}
        <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
