"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { DatePicker } from "@/components/ui/DatePicker";
import type { Task, SubjectOption } from "@/features/tasks/queries";
import { PRIORITY_META, type Priority, type TaskCategory } from "@/types/domain";
import { cn } from "@/lib/utils";

interface TaskFormProps {
  open: boolean;
  initialTask: Task | null;
  subjects: SubjectOption[];
  onClose: () => void;
  onSave: (input: {
    title: string;
    category: TaskCategory;
    subject_id?: string | null;
    priority: Priority;
    due_date?: string | null;
  }) => void;
  loading?: boolean;
}

const CATEGORY_OPTIONS = [
  { value: "estudio", label: "Estudio" },
  { value: "personal", label: "Personal" },
  { value: "deseos", label: "Deseos" },
];

const ROUTINES = [
  "Dormir temprano (8 horas)",
  "Rutina de cuidado personal",
  "Hacer la cama al despertar",
  "Comer frutas frescas",
  "Tomar un descanso y meditar",
  "Limpiar y ordenar la habitación",
  "Caminar 20 minutos",
];

export function TaskForm({ open, initialTask, subjects, onClose, onSave, loading }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<TaskCategory>("estudio");
  const [subjectId, setSubjectId] = useState("");
  const [priority, setPriority] = useState<Priority>(3);
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setCategory(initialTask.category);
      setSubjectId(initialTask.subject_id ?? "");
      setPriority(initialTask.priority);
      setDueDate(initialTask.due_date ?? "");
    } else {
      setTitle("");
      setCategory("estudio");
      setSubjectId("");
      setPriority(3);
      setDueDate("");
    }
  }, [initialTask, open]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      category,
      subject_id: category === "estudio" && subjectId ? subjectId : null,
      priority,
      due_date: dueDate || null,
    });
  };

  return (
    <Modal open={open} onClose={onClose} title={initialTask ? "Editar tarea" : "Nueva tarea"}>
      <div className="space-y-5">
        <div>
          <label className="mb-1.5 block text-xs font-bold text-slate-600">Categoría</label>
          <Select value={category} options={CATEGORY_OPTIONS} onChange={(value) => setCategory(value as TaskCategory)} />
        </div>

        {category === "estudio" && subjects.length > 0 && (
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-600">Materia</label>
            <Select
              value={subjectId}
              onChange={setSubjectId}
              placeholder="Sin materia específica"
              options={[
                { value: "", label: "Sin materia específica" },
                ...subjects.map((subject) => ({ value: subject.id, label: subject.name })),
              ]}
            />
          </div>
        )}

        {category === "personal" && !initialTask && (
          <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-3">
            <div className="mb-2 flex items-center gap-1.5 text-rose-700">
              <Sparkles className="h-3.5 w-3.5" />
              <span className="text-[10px] font-black uppercase tracking-wider">Ideas rápidas</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ROUTINES.map((routine) => (
                <button
                  key={routine}
                  type="button"
                  onClick={() => setTitle(routine)}
                  className="rounded-xl border border-rose-100 bg-white px-2.5 py-1.5 text-[10px] font-semibold text-rose-700 transition hover:bg-rose-100"
                >
                  + {routine}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-xs font-bold text-slate-600">Tarea</label>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="¿Qué hay que hacer?"
            autoFocus
            className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 placeholder:text-slate-300 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200"
            onKeyDown={(event) => event.key === "Enter" && handleSave()}
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-bold text-slate-600">Prioridad</label>
          <div className="flex flex-wrap items-center gap-2">
            {([5, 4, 3, 2, 1] as Priority[]).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setPriority(level)}
                className={cn(
                  "flex h-9 min-w-9 items-center justify-center rounded-xl border px-3 text-xs font-black transition",
                  priority === level
                    ? PRIORITY_META[level].solid + " scale-105 border-transparent shadow-sm"
                    : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50",
                )}
              >
                {level}
              </button>
            ))}
            <span className="text-xs font-bold text-slate-500">{PRIORITY_META[priority].label}</span>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-bold text-slate-600">
            Fecha límite <span className="font-normal text-slate-400">(opcional)</span>
          </label>
          <DatePicker value={dueDate || "2026-10-01"} onChange={setDueDate} />
          {dueDate && (
            <button type="button" onClick={() => setDueDate("")} className="mt-1.5 text-xs font-semibold text-slate-400 hover:text-rose-500">
              Quitar fecha
            </button>
          )}
        </div>

        <div className="flex gap-2 pt-1">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button className="flex-1" onClick={handleSave} disabled={!title.trim() || loading}>
            {loading ? "Guardando…" : initialTask ? "Actualizar" : "Crear tarea"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
