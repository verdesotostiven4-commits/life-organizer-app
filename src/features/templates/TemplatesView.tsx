"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  Clock3,
  Columns3,
  FolderKanban,
  GraduationCap,
  Palette,
  Plus,
  Trash2,
} from "lucide-react";
import { ACCENTS, TEMPLATE_CATALOG } from "./catalog";
import {
  createPlannerDocument,
  deletePlannerDocument,
} from "./queries";
import { PLANNER_THEMES } from "./theme";
import type {
  PlannerAccent,
  PlannerDocument,
  PlannerTemplateKey,
} from "./types";
import { cn } from "@/lib/utils";

const ICONS = {
  monthly: CalendarDays,
  deliveries_exams: ClipboardCheck,
  class_schedule: Clock3,
  daily_study: BookOpen,
  weekly: Columns3,
  project: FolderKanban,
} satisfies Record<PlannerTemplateKey, typeof CalendarDays>;

function Preview({ type, accent }: { type: PlannerTemplateKey; accent: PlannerAccent }) {
  const theme = PLANNER_THEMES[accent];

  if (type === "monthly") {
    return (
      <div className={cn("rounded-2xl border p-3", theme.border, theme.page)}>
        <div className={cn("mb-2 h-3 w-28 rounded-full", theme.header)} />
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 21 }, (_, i) => (
            <div key={i} className={cn("h-8 rounded-md border bg-white", theme.border)} />
          ))}
        </div>
        <div className="mt-2 grid grid-cols-3 gap-1">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className={cn("h-8 rounded-md", theme.header)} />
          ))}
        </div>
      </div>
    );
  }

  if (type === "deliveries_exams") {
    return (
      <div className={cn("rounded-2xl border p-3", theme.border, theme.page)}>
        <div className={cn("mb-2 h-3 w-32 rounded-full", theme.header)} />
        <div className="space-y-1">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="grid grid-cols-[1fr_1.5fr_.8fr_.7fr] gap-1">
              {Array.from({ length: 4 }, (_, j) => (
                <div key={j} className={cn("h-6 rounded border bg-white", theme.border)} />
              ))}
            </div>
          ))}
        </div>
        <div className={cn("mt-2 h-10 rounded-lg", theme.header)} />
      </div>
    );
  }

  if (type === "class_schedule") {
    return (
      <div className={cn("rounded-2xl border p-3", theme.border, theme.page)}>
        <div className="grid grid-cols-6 gap-1">
          {Array.from({ length: 30 }, (_, i) => (
            <div
              key={i}
              className={cn(
                "h-7 rounded border",
                theme.border,
                i < 6 ? theme.header : "bg-white",
              )}
            />
          ))}
        </div>
      </div>
    );
  }

  if (type === "daily_study") {
    return (
      <div className={cn("grid grid-cols-[.85fr_1.15fr] gap-2 rounded-2xl border p-3", theme.border, theme.page)}>
        <div className="space-y-1">
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} className={cn("h-6 rounded border bg-white", theme.border)} />
          ))}
        </div>
        <div className="space-y-2">
          <div className={cn("h-10 rounded-lg", theme.header)} />
          <div className={cn("h-16 rounded-lg border bg-white", theme.border)} />
          <div className="grid grid-cols-5 gap-1">
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} className={cn("aspect-square rounded-full border bg-white", theme.border)} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (type === "weekly") {
    return (
      <div className={cn("rounded-2xl border p-3", theme.border, theme.page)}>
        <div className="grid grid-cols-4 gap-1">
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} className={cn("h-16 rounded-lg border bg-white p-1", theme.border)}>
              <div className={cn("mb-1 h-2 w-8 rounded", theme.header)} />
              <div className="space-y-1">
                <div className="h-1 rounded bg-slate-200" />
                <div className="h-1 rounded bg-slate-200" />
                <div className="h-1 rounded bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-2xl border p-3", theme.border, theme.page)}>
      <div className={cn("mb-2 h-3 w-28 rounded-full", theme.header)} />
      <div className="grid grid-cols-3 gap-2">
        {["Pendiente", "En curso", "Hecho"].map((label) => (
          <div key={label} className={cn("rounded-lg border bg-white p-2", theme.border)}>
            <div className="mb-2 h-2 w-12 rounded bg-slate-200" />
            <div className="space-y-1">
              <div className={cn("h-6 rounded", theme.header)} />
              <div className={cn("h-6 rounded", theme.header)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TemplatesView({ documents }: { documents: PlannerDocument[] }) {
  const router = useRouter();
  const defaults = useMemo(
    () =>
      Object.fromEntries(
        TEMPLATE_CATALOG.map((item) => [item.key, item.accent]),
      ) as Record<PlannerTemplateKey, PlannerAccent>,
    [],
  );
  const [accents, setAccents] = useState(defaults);
  const [creating, setCreating] = useState<PlannerTemplateKey | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const createDocument = async (key: PlannerTemplateKey) => {
    setCreating(key);
    try {
      const id = await createPlannerDocument(key, accents[key]);
      router.push(`/templates/${id}`);
    } finally {
      setCreating(null);
    }
  };

  const removeDocument = async (id: string) => {
    if (!window.confirm("¿Eliminar esta plantilla guardada?")) return;
    setDeleting(id);
    try {
      await deletePlannerDocument(id);
      router.refresh();
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-purple-100 bg-gradient-to-r from-purple-50 via-white to-sky-50 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-purple-600 shadow-sm">
            <Palette className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-purple-600">
              Qué es una plantilla
            </p>
            <h2 className="mt-1 text-base font-black text-slate-950">
              Un formato visual reutilizable que tú llenas a tu manera
            </h2>
            <p className="mt-1 max-w-3xl text-xs leading-relaxed text-slate-500">
              Escoge el diseño que necesites, elige un color y crea tu propia copia. Puedes usar una plantilla para un mes, una semana, un día de estudio, entregas, horario o un proyecto específico.
            </p>
          </div>
        </div>
      </section>

      {documents.length > 0 ? (
        <section>
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-sm font-black text-slate-900">Mis plantillas</h2>
              <p className="text-xs text-slate-400">Se guardan en tu cuenta y puedes abrirlas desde PC o celular.</p>
            </div>
            <span className="rounded-full bg-purple-50 px-2.5 py-1 text-[10px] font-black text-purple-700">
              {documents.length} guardada{documents.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {documents.map((document) => {
              const meta = TEMPLATE_CATALOG.find((item) => item.key === document.template_key)!;
              const Icon = ICONS[document.template_key];
              const theme = PLANNER_THEMES[document.accent];

              return (
                <article
                  key={document.id}
                  className={cn("rounded-3xl border bg-white p-4 shadow-sm", theme.border)}
                >
                  <button
                    type="button"
                    onClick={() => router.push(`/templates/${document.id}`)}
                    className="w-full text-left"
                  >
                    <div className="flex items-start gap-3">
                      <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl", theme.header, theme.text)}>
                        <Icon className="h-4.5 w-4.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-black text-slate-900">{document.title}</p>
                        <p className="mt-0.5 text-[10px] font-semibold text-slate-400">{meta.short} · {theme.label}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Preview type={document.template_key} accent={document.accent} />
                    </div>
                  </button>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => router.push(`/templates/${document.id}`)}
                      className="min-h-10 flex-1 rounded-xl bg-slate-950 px-3 text-xs font-black text-white hover:bg-purple-700"
                    >
                      Abrir
                    </button>
                    <button
                      type="button"
                      onClick={() => removeDocument(document.id)}
                      disabled={deleting === document.id}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                      aria-label="Eliminar plantilla"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      <section>
        <div className="mb-3">
          <h2 className="text-sm font-black text-slate-900">Biblioteca de formatos</h2>
          <p className="text-xs text-slate-400">Elige el formato; después puedes cambiar el color dentro del editor.</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {TEMPLATE_CATALOG.map((template) => {
            const Icon = ICONS[template.key];
            const accent = accents[template.key];
            const theme = PLANNER_THEMES[accent];

            return (
              <article
                key={template.key}
                className={cn("rounded-3xl border bg-white p-5", theme.border)}
              >
                <div className="flex items-start gap-3">
                  <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl", theme.header, theme.text)}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{template.format}</p>
                    <h3 className="mt-0.5 text-sm font-black text-slate-950">{template.title}</h3>
                  </div>
                </div>

                <p className="mt-3 min-h-12 text-xs leading-relaxed text-slate-500">{template.description}</p>

                <div className="mt-4">
                  <Preview type={template.key} accent={accent} />
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <span className="mr-1 text-[10px] font-bold text-slate-400">Color</span>
                  {ACCENTS.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      title={item.label}
                      onClick={() =>
                        setAccents((current) => ({ ...current, [template.key]: item.key }))
                      }
                      className={cn(
                        "h-6 w-6 rounded-full border-2 transition-transform hover:scale-110",
                        item.dot,
                        accent === item.key ? "border-slate-800 ring-2 ring-slate-200" : "border-white",
                      )}
                      aria-label={`Usar color ${item.label}`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => createDocument(template.key)}
                  disabled={creating !== null}
                  className={cn(
                    "mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-xs font-black text-white transition-colors disabled:opacity-50",
                    theme.button,
                  )}
                >
                  <Plus className="h-4 w-4" />
                  {creating === template.key ? "Creando…" : "Crear esta plantilla"}
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5">
        <div className="flex items-start gap-3">
          <GraduationCap className="mt-0.5 h-5 w-5 text-indigo-600" />
          <div>
            <h2 className="text-sm font-black text-slate-900">Inspiradas en planners universitarios, adaptadas a digital</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Mantienen la idea de las hojas que compartiste —cuadrículas, listas, seguimiento, objetivos y notas— pero aquí cada campo es editable, se guarda en tu cuenta y se adapta a pantalla pequeña.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
