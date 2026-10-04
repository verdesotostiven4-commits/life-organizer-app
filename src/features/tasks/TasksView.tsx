"use client";

import { useMemo, useState } from "react";
import { ListChecks, Plus } from "lucide-react";
import type { Task, SubjectOption } from "@/features/tasks/queries";
import { createTask, updateTask, toggleTask, deleteTask } from "@/features/tasks/queries";
import { TaskItem } from "./components/TaskItem";
import { TaskForm } from "./components/TaskForm";
import { Button } from "@/components/ui/Button";
import type { TaskCategory, Priority } from "@/types/domain";
import { cn } from "@/lib/utils";

interface TasksViewProps {
  initialTasks: Task[];
  subjects: SubjectOption[];
}

type Filter = "todas" | TaskCategory | "pendientes" | "completadas";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "todas", label: "Todas" },
  { key: "pendientes", label: "Pendientes" },
  { key: "completadas", label: "Hechas" },
  { key: "estudio", label: "Estudio & ESPOCH" },
  { key: "personal", label: "Personal" },
  { key: "deseos", label: "Deseos" },
];

export function TasksView({ initialTasks, subjects }: TasksViewProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks ?? []);
  const [filter, setFilter] = useState<Filter>("todas");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    if (filter === "pendientes") return tasks.filter((t) => !t.completed);
    if (filter === "completadas") return tasks.filter((t) => t.completed);
    if (filter === "estudio" || filter === "personal" || filter === "deseos") return tasks.filter((t) => t.category === filter);
    return tasks;
  }, [tasks, filter]);

  const pendingCount = tasks.filter((t) => !t.completed).length;
  const highPriority = tasks.filter((t) => !t.completed && t.priority >= 4).length;

  const handleSave = async (input: {
    title: string;
    category: TaskCategory;
    subject_id?: string | null;
    priority: Priority;
    due_date?: string | null;
  }) => {
    setLoading(true);
    try {
      if (editing) {
        const backup = tasks;
        setTasks((prev) => prev.map((t) => t.id === editing.id ? {
          ...t,
          ...input,
          subject_name: input.subject_id ? subjects.find((s) => s.id === input.subject_id)?.name ?? null : null,
        } : t));
        try { await updateTask(editing.id, input); } catch (error) { setTasks(backup); throw error; }
      } else {
        const tempId = `temp-${Date.now()}`;
        const optimistic: Task = {
          id: tempId,
          title: input.title,
          category: input.category,
          subject_id: input.subject_id ?? null,
          subject_name: input.subject_id ? subjects.find((s) => s.id === input.subject_id)?.name ?? null : null,
          priority: input.priority,
          due_date: input.due_date ?? null,
          completed: false,
          completed_at: null,
          created_at: new Date().toISOString(),
        };
        setTasks((prev) => [optimistic, ...prev]);
        try {
          const realId = await createTask(input);
          setTasks((prev) =>
            prev.map((task) =>
              task.id === tempId ? { ...task, id: realId } : task,
            ),
          );
        } catch (error) {
          setTasks((prev) => prev.filter((t) => t.id !== tempId));
          throw error;
        }
      }
      setFormOpen(false);
      setEditing(null);
    } catch (error) {
      console.error("Error al guardar tarea:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: string, completed: boolean) => {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, completed, completed_at: completed ? new Date().toISOString() : null } : t));
    try { await toggleTask(id, completed); } catch {
      setTasks((prev) => prev.map((t) => t.id === id ? { ...t, completed: !completed } : t));
    }
  };

  const handleDelete = async (id: string) => {
    const backup = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try { await deleteTask(id); } catch { setTasks(backup); }
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-3xl border border-rose-100 bg-gradient-to-br from-white to-rose-50 p-5">
          <p className="text-[10px] font-black uppercase tracking-wider text-rose-500">Pendientes</p>
          <p className="mt-1 text-3xl font-black text-slate-950">{pendingCount}</p>
          <p className="text-xs text-slate-400">por completar</p>
        </div>
        <div className="rounded-3xl border border-orange-100 bg-gradient-to-br from-white to-orange-50 p-5">
          <p className="text-[10px] font-black uppercase tracking-wider text-orange-500">Prioridad alta</p>
          <p className="mt-1 text-3xl font-black text-slate-950">{highPriority}</p>
          <p className="text-xs text-slate-400">nivel 4 o 5</p>
        </div>
      </div>

      <div className="rounded-3xl border border-purple-100 bg-white/90 p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {FILTERS.map((f) => (
              <button key={f.key} type="button" onClick={() => setFilter(f.key)} className={cn(
                "whitespace-nowrap rounded-xl px-3 py-2 text-xs font-bold transition",
                filter === f.key ? "bg-slate-900 text-white shadow-sm" : "bg-slate-50 text-slate-500 hover:bg-purple-50 hover:text-purple-700",
              )}>{f.label}</button>
            ))}
          </div>
          <Button size="sm" onClick={() => { setEditing(null); setFormOpen(true); }}>
            <Plus className="h-4 w-4" /> Nueva tarea
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-purple-200 bg-white/70 py-14 text-center">
          <ListChecks className="mx-auto h-8 w-8 text-purple-200" />
          <p className="mt-2 text-sm font-semibold text-slate-500">No hay tareas en este filtro.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={handleToggle}
              onEdit={(item) => { setEditing(item); setFormOpen(true); }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <TaskForm
        key={editing?.id ?? (formOpen ? "new-open" : "new-closed")}
        open={formOpen}
        initialTask={editing}
        subjects={subjects}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        onSave={handleSave}
        loading={loading}
      />
    </div>
  );
}
