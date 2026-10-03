"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Clock3,
  CreditCard,
  Layers3,
  ListChecks,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { DOW_SHORT, ESPOCH_SCHEDULE } from "@/config/espoch";
import { addDays, formatShort, mondayOf } from "@/lib/dates";
import { createTask } from "@/features/tasks/queries";
import type { Priority, TaskCategory } from "@/types/domain";

const DAYS = [1, 2, 3, 4, 5] as const;
const TIMES = Array.from(new Set(ESPOCH_SCHEDULE.map((item) => `${item.start_time}–${item.end_time}`))).sort();

type TemplateTask = {
  title: string;
  category: TaskCategory;
  priority: Priority;
};

const QUICK_TEMPLATES: {
  id: string;
  title: string;
  description: string;
  tone: string;
  tasks: TemplateTask[];
}[] = [
  {
    id: "university-day",
    title: "Día universitario",
    description: "Tres recordatorios básicos para llegar a clases con todo listo.",
    tone: "border-purple-100 bg-purple-50/50",
    tasks: [
      { title: "Revisar tareas y entregas del día", category: "estudio", priority: 4 },
      { title: "Preparar materiales y mochila", category: "estudio", priority: 3 },
      { title: "Repasar 30 minutos", category: "estudio", priority: 3 },
    ],
  },
  {
    id: "personal-routine",
    title: "Rutina personal",
    description: "Un inicio simple para no olvidar tus básicos personales.",
    tone: "border-sky-100 bg-sky-50/50",
    tasks: [
      { title: "Hacer la cama", category: "personal", priority: 2 },
      { title: "Cuidado de la piel", category: "personal", priority: 2 },
      { title: "Preparar agua para el día", category: "personal", priority: 2 },
    ],
  },
  {
    id: "weekly-close",
    title: "Cierre semanal",
    description: "Ordena estudios, dinero y la siguiente semana en pocos minutos.",
    tone: "border-emerald-100 bg-emerald-50/50",
    tasks: [
      { title: "Revisar gastos e ingresos de la semana", category: "personal", priority: 3 },
      { title: "Actualizar notas y asistencia", category: "estudio", priority: 3 },
      { title: "Planificar pendientes de la próxima semana", category: "personal", priority: 3 },
    ],
  },
];

export function TemplatesView({ today }: { today: string }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const monday = mondayOf(today);

  const applyTemplate = async (template: (typeof QUICK_TEMPLATES)[number]) => {
    setLoadingId(template.id);
    setCreatedId(null);
    try {
      await Promise.all(
        template.tasks.map((task) =>
          createTask({
            ...task,
            due_date: today,
          }),
        ),
      );
      setCreatedId(template.id);
      router.refresh();
    } catch (error) {
      console.error("Error al aplicar plantilla:", error);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-purple-50 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-sm font-black text-slate-900">¿Para qué sirven las plantillas?</h2>
            <p className="mt-1 max-w-3xl text-xs leading-relaxed text-slate-500">
              Son atajos reutilizables. En vez de escribir las mismas tareas cada semana, eliges una plantilla y Harmony OS crea el grupo por ti. Después puedes editar fecha, prioridad o borrar lo que no necesites.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        {QUICK_TEMPLATES.map((template) => (
          <section key={template.id} className={`rounded-3xl border p-5 ${template.tone}`}>
            <div className="flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-purple-600" />
              <h3 className="text-sm font-black text-slate-900">{template.title}</h3>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">{template.description}</p>
            <div className="mt-4 space-y-2">
              {template.tasks.map((task) => (
                <div key={task.title} className="rounded-xl bg-white/80 px-3 py-2 text-[11px] font-semibold text-slate-600">
                  {task.title}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => applyTemplate(template)}
              disabled={loadingId !== null}
              className="mt-4 w-full rounded-xl bg-slate-950 px-3 py-2.5 text-xs font-black text-white transition hover:bg-purple-700 disabled:opacity-50"
            >
              {loadingId === template.id
                ? "Creando…"
                : createdId === template.id
                  ? "✓ Añadida a Tareas"
                  : "Usar plantilla hoy"}
            </button>
          </section>
        ))}
      </div>

      <section className="rounded-3xl border border-purple-100 bg-white/90 p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-100 text-purple-700">
            <Layers3 className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-sm font-black text-slate-900">Horario oficial ESPOCH · esta semana</h2>
            <p className="text-xs text-slate-400">
              La plantilla del horario se repite; las fechas cambian según la semana que estás viviendo.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full min-w-[820px] border-collapse text-xs">
            <thead>
              <tr className="bg-purple-50 text-purple-900">
                <th className="border-b border-r border-purple-100 p-3 text-left">Hora</th>
                {DAYS.map((day) => (
                  <th key={day} className="border-b border-r border-purple-100 p-3 text-left last:border-r-0">
                    <span className="block font-black">{DOW_SHORT[day]}</span>
                    <span className="mt-0.5 block text-[10px] font-medium text-purple-500">
                      {formatShort(addDays(monday, day - 1))}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIMES.map((time) => (
                <tr key={time} className="hover:bg-slate-50">
                  <td className="border-b border-r border-slate-100 bg-slate-50 p-3 font-mono font-bold text-slate-700">{time}</td>
                  {DAYS.map((day) => {
                    const item = ESPOCH_SCHEDULE.find(
                      (session) =>
                        session.day_of_week === day &&
                        `${session.start_time}–${session.end_time}` === time,
                    );
                    return (
                      <td key={day} className="border-b border-r border-slate-100 p-3 align-top last:border-r-0">
                        {item ? (
                          <>
                            <p className="font-bold text-slate-800">{item.subject_name}</p>
                            <p className="mt-1 text-[10px] text-slate-400">{item.room}</p>
                          </>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-[11px] text-slate-400">
          Para marcar “Asistí / Falta / No hubo” y escribir notas de cada clase, usa <strong className="text-purple-700">Horario</strong>.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <section className="rounded-3xl border border-rose-100 bg-gradient-to-br from-white to-rose-50 p-5">
          <CheckCircle2 className="h-5 w-5 text-rose-600" />
          <h3 className="mt-4 text-sm font-black text-slate-900">Prioridades del día</h3>
          <div className="mt-3 space-y-2">
            {["Máxima / Hoy", "Alta", "Media", "Normal", "Sin prisa"].map((label, index) => (
              <div key={label} className="flex items-center gap-2 text-xs text-slate-600">
                <span className={["bg-rose-500", "bg-orange-500", "bg-amber-500", "bg-emerald-500", "bg-teal-500"][index] + " h-2.5 w-2.5 rounded-full"} />
                {label}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-sky-100 bg-gradient-to-br from-white to-sky-50 p-5">
          <Clock3 className="h-5 w-5 text-sky-600" />
          <h3 className="mt-4 text-sm font-black text-slate-900">Bloques de enfoque</h3>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {["07–09", "09–11", "11–13", "15–17"].map((time) => (
              <div key={time} className="rounded-xl bg-white/80 p-3 text-center font-mono text-xs font-bold text-slate-600">{time}</div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50 p-5">
          <CreditCard className="h-5 w-5 text-emerald-600" />
          <h3 className="mt-4 text-sm font-black text-slate-900">Regla de ingresos</h3>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            Separa ahorro al registrar cada ingreso y deja que Harmony OS actualice la cuenta y la bóveda de forma atómica.
          </p>
        </section>
      </div>
    </div>
  );
}
