"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ListChecks,
  Sparkles,
} from "lucide-react";
import { createTasksIfMissing } from "@/features/tasks/queries";
import type { Priority, TaskCategory } from "@/types/domain";

type ShortcutTask = {
  title: string;
  category: TaskCategory;
  priority: Priority;
};

type Shortcut = {
  id: string;
  title: string;
  description: string;
  result: string;
  tone: string;
  tasks: ShortcutTask[];
};

const SHORTCUTS: Shortcut[] = [
  {
    id: "university-day",
    title: "Día universitario",
    description: "Para empezar un día de clases con lo básico bajo control.",
    result: "Añade 3 tareas de estudio para hoy.",
    tone: "border-purple-100 bg-purple-50/60",
    tasks: [
      { title: "Revisar tareas y entregas del día", category: "estudio", priority: 4 },
      { title: "Preparar materiales y mochila", category: "estudio", priority: 3 },
      { title: "Repasar 30 minutos", category: "estudio", priority: 3 },
    ],
  },
  {
    id: "personal-routine",
    title: "Rutina personal",
    description: "Para no olvidar tus básicos personales cuando estás ocupada.",
    result: "Añade 3 tareas personales para hoy.",
    tone: "border-sky-100 bg-sky-50/60",
    tasks: [
      { title: "Hacer la cama", category: "personal", priority: 2 },
      { title: "Cuidado de la piel", category: "personal", priority: 2 },
      { title: "Preparar agua para el día", category: "personal", priority: 2 },
    ],
  },
  {
    id: "weekly-close",
    title: "Cierre semanal",
    description: "Para cerrar la semana y dejar ordenado lo importante.",
    result: "Añade 3 tareas de revisión para hoy.",
    tone: "border-emerald-100 bg-emerald-50/60",
    tasks: [
      { title: "Revisar gastos e ingresos de la semana", category: "personal", priority: 3 },
      { title: "Actualizar notas y asistencia", category: "estudio", priority: 3 },
      { title: "Planificar pendientes de la próxima semana", category: "personal", priority: 3 },
    ],
  },
];

type ShortcutResult = {
  id: string;
  created: number;
} | null;

export function TemplatesView({ today }: { today: string }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [result, setResult] = useState<ShortcutResult>(null);
  const [errorId, setErrorId] = useState<string | null>(null);

  const applyShortcut = async (shortcut: Shortcut) => {
    setLoadingId(shortcut.id);
    setResult(null);
    setErrorId(null);

    try {
      const response = await createTasksIfMissing({
        due_date: today,
        tasks: shortcut.tasks,
      });

      setResult({
        id: shortcut.id,
        created: response.created,
      });
    } catch (error) {
      console.error("Error al aplicar atajo:", error);
      setErrorId(shortcut.id);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-purple-100 bg-gradient-to-r from-purple-50 via-white to-indigo-50 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-purple-600 shadow-sm">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-purple-600">
              Funciona así
            </p>
            <h2 className="mt-1 text-base font-black text-slate-950">
              Un atajo crea varias tareas de una sola vez
            </h2>
            <p className="mt-1 max-w-3xl text-xs leading-relaxed text-slate-500">
              Elige uno de abajo y Harmony OS añadirá esas tareas a <strong>Tareas</strong> con fecha de hoy. No modifica tu horario, tus finanzas ni otros datos.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          {[
            ["1", "Elige un atajo"],
            ["2", "Se crean las tareas"],
            ["3", "Las completas en Tareas"],
          ].map(([step, label]) => (
            <div key={step} className="flex items-center gap-2 rounded-2xl border border-white bg-white/75 px-3 py-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-600 text-[11px] font-black text-white">
                {step}
              </span>
              <span className="text-xs font-bold text-slate-700">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3">
          <h2 className="text-sm font-black text-slate-900">Atajos disponibles</h2>
          <p className="text-xs text-slate-400">Úsalos solo cuando te sirvan. Si pulsas dos veces, no duplica las mismas tareas del día.</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {SHORTCUTS.map((shortcut) => {
            const isLoading = loadingId === shortcut.id;
            const shortcutResult = result?.id === shortcut.id ? result : null;
            const hasError = errorId === shortcut.id;

            return (
              <article key={shortcut.id} className={`rounded-3xl border p-5 ${shortcut.tone}`}>
                <div className="flex items-center gap-2">
                  <ListChecks className="h-4 w-4 text-purple-600" />
                  <h3 className="text-sm font-black text-slate-900">{shortcut.title}</h3>
                </div>

                <p className="mt-2 text-xs leading-relaxed text-slate-500">{shortcut.description}</p>

                <div className="mt-4 rounded-2xl bg-white/80 p-3">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Al usarlo
                  </p>
                  <p className="mt-1 text-xs font-bold text-slate-700">{shortcut.result}</p>
                </div>

                <div className="mt-3 space-y-2">
                  {shortcut.tasks.map((task) => (
                    <div key={task.title} className="flex items-center gap-2 rounded-xl bg-white/75 px-3 py-2">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-purple-500" />
                      <span className="text-[11px] font-semibold text-slate-600">{task.title}</span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => applyShortcut(shortcut)}
                  disabled={loadingId !== null}
                  className="mt-4 min-h-11 w-full rounded-xl bg-slate-950 px-3 py-2.5 text-xs font-black text-white transition-colors duration-100 hover:bg-purple-700 disabled:opacity-50"
                >
                  {isLoading
                    ? "Añadiendo…"
                    : shortcutResult
                      ? shortcutResult.created > 0
                        ? `✓ ${shortcutResult.created} tareas añadidas`
                        : "✓ Ya estaban añadidas hoy"
                      : "Añadir 3 tareas a hoy"}
                </button>

                {hasError ? (
                  <p className="mt-2 text-center text-[10px] font-semibold text-rose-600">
                    No se pudieron crear. Intenta otra vez.
                  </p>
                ) : null}

                {shortcutResult ? (
                  <Link
                    href="/tasks"
                    prefetch={true}
                    className="mt-3 flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white/75 text-xs font-bold text-slate-700 hover:border-purple-200 hover:text-purple-700"
                  >
                    Ver mis tareas <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
            ¿Buscabas otra cosa?
          </p>
          <h2 className="mt-1 text-sm font-black text-slate-900">
            El horario ya no está mezclado con los atajos
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Para ver tus clases usa Horario. Para revisar clases, tareas y hábitos por fecha usa Calendario.
          </p>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Link
            href="/schedule"
            prefetch={true}
            className="flex min-h-14 items-center gap-3 rounded-2xl border border-purple-100 bg-purple-50/60 px-4 text-sm font-bold text-purple-800 transition-colors hover:bg-purple-100"
          >
            <Clock3 className="h-5 w-5" />
            <span className="flex-1">Abrir Horario</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/calendar"
            prefetch={true}
            className="flex min-h-14 items-center gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/60 px-4 text-sm font-bold text-indigo-800 transition-colors hover:bg-indigo-100"
          >
            <CalendarDays className="h-5 w-5" />
            <span className="flex-1">Abrir Calendario</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
