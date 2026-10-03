"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  Check,
  Palette,
  Save,
} from "lucide-react";
import { ACCENTS, templateMeta } from "./catalog";
import { savePlannerDocument } from "./queries";
import { PLANNER_THEMES } from "./theme";
import type {
  ClassScheduleContent,
  DailyStudyContent,
  DeliveriesContent,
  MonthlyContent,
  PlannerAccent,
  PlannerContent,
  PlannerDocument,
  ProjectContent,
  WeeklyContent,
} from "./types";
import { MonthlyPlanner } from "./editors/MonthlyPlanner";
import { DeliveriesPlanner } from "./editors/DeliveriesPlanner";
import { ClassSchedulePlanner } from "./editors/ClassSchedulePlanner";
import { DailyStudyPlanner } from "./editors/DailyStudyPlanner";
import { WeeklyPlanner } from "./editors/WeeklyPlanner";
import { ProjectPlanner } from "./editors/ProjectPlanner";
import { cn } from "@/lib/utils";

export function PlannerEditor({ document }: { document: PlannerDocument }) {
  const [title, setTitle] = useState(document.title);
  const [accent, setAccent] = useState<PlannerAccent>(document.accent);
  const [content, setContent] = useState<PlannerContent>(document.content);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const meta = templateMeta(document.template_key);
  const theme = PLANNER_THEMES[accent];

  const markContent = (next: PlannerContent) => {
    setContent(next);
    setDirty(true);
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      await savePlannerDocument({
        id: document.id,
        title,
        accent,
        content,
      });
      setDirty(false);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2200);
    } finally {
      setSaving(false);
    }
  };

  let editor: React.ReactNode = null;

  if (document.template_key === "monthly") {
    editor = (
      <MonthlyPlanner
        value={content as MonthlyContent}
        onChange={markContent}
        accent={accent}
      />
    );
  } else if (document.template_key === "deliveries_exams") {
    editor = (
      <DeliveriesPlanner
        value={content as DeliveriesContent}
        onChange={markContent}
        accent={accent}
      />
    );
  } else if (document.template_key === "class_schedule") {
    editor = (
      <ClassSchedulePlanner
        value={content as ClassScheduleContent}
        onChange={markContent}
        accent={accent}
      />
    );
  } else if (document.template_key === "daily_study") {
    editor = (
      <DailyStudyPlanner
        value={content as DailyStudyContent}
        onChange={markContent}
        accent={accent}
      />
    );
  } else if (document.template_key === "weekly") {
    editor = (
      <WeeklyPlanner
        value={content as WeeklyContent}
        onChange={markContent}
        accent={accent}
      />
    );
  } else {
    editor = (
      <ProjectPlanner
        value={content as ProjectContent}
        onChange={markContent}
        accent={accent}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0 flex-1">
            <Link
              href="/templates"
              prefetch={true}
              className="mb-3 inline-flex min-h-9 items-center gap-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-purple-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a Plantillas
            </Link>
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
              {meta.format}
            </p>
            <input
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                setDirty(true);
                setSaved(false);
              }}
              className="mt-1 w-full bg-transparent text-xl font-black tracking-tight text-slate-950 outline-none sm:text-2xl"
              aria-label="Nombre de la plantilla"
            />
            <p className="mt-1 text-xs text-slate-400">
              {meta.description}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div>
              <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                <Palette className="h-3.5 w-3.5" />
                Estilo
              </div>
              <div className="flex flex-wrap gap-2">
                {ACCENTS.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      setAccent(item.key);
                      setDirty(true);
                      setSaved(false);
                    }}
                    title={item.label}
                    className={cn(
                      "h-8 w-8 rounded-full border-2 transition-transform hover:scale-105",
                      item.dot,
                      accent === item.key
                        ? "border-slate-900 ring-2 ring-slate-200"
                        : "border-white",
                    )}
                    aria-label={`Cambiar a ${item.label}`}
                  />
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={save}
              disabled={saving || (!dirty && !saved)}
              className={cn(
                "flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-xs font-black text-white transition-colors disabled:cursor-default disabled:opacity-60",
                saved ? "bg-emerald-600" : theme.button,
              )}
            >
              {saved ? (
                <>
                  <Check className="h-4 w-4" /> Guardado
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {saving ? "Guardando…" : dirty ? "Guardar cambios" : "Sin cambios"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {dirty ? (
        <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-2.5 text-xs font-semibold text-amber-800">
          Tienes cambios sin guardar.
        </div>
      ) : null}

      {editor}
    </div>
  );
}
