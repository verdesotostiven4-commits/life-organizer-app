"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/supabase/auth";
import type { Priority, TaskCategory } from "@/types/domain";

export type Task = {
  id: string;
  title: string;
  category: TaskCategory;
  subject_id: string | null;
  subject_name: string | null;
  priority: Priority;
  due_date: string | null;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
};

export type SubjectOption = { id: string; name: string };

/** Trae todas las materias del usuario (para el select de tareas de estudio). */
export async function getSubjects(): Promise<SubjectOption[]> {
  const supabase = await createClient();
  const userId = await getCurrentUserId(supabase);
  if (!userId) return [];

  const { data, error } = await supabase
    .from("subjects")
    .select("id, name")
    .eq("user_id", userId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []) as SubjectOption[];
}

/** Trae todas las tareas del usuario, ordenadas por prioridad y fecha. */
export async function getTasks(): Promise<Task[]> {
  const supabase = await createClient();
  const userId = await getCurrentUserId(supabase);
  if (!userId) return [];

  // Materias para el join en memoria.
  const { data: subjects } = await supabase
    .from("subjects")
    .select("id, name")
    .eq("user_id", userId);

  const subjectMap = new Map<string, string>();
  ((subjects ?? []) as { id: string; name: string }[]).forEach((s) =>
    subjectMap.set(s.id, s.name),
  );

  const { data, error } = await supabase
    .from("tasks")
    .select(
      "id, title, category, subject_id, priority, due_date, completed, completed_at, created_at",
    )
    .eq("user_id", userId)
    .order("completed", { ascending: true })
    .order("priority", { ascending: false })
    .order("due_date", { ascending: true, nullsFirst: false });

  if (error) throw error;

  const rows = (data ?? []) as Omit<Task, "subject_name">[];
  return rows.map((r) => ({
    ...r,
    subject_name: r.subject_id ? (subjectMap.get(r.subject_id) ?? null) : null,
  }));
}

/** Crea una nueva tarea. */
export async function createTask(input: {
  title: string;
  category: TaskCategory;
  subject_id?: string | null;
  priority: Priority;
  due_date?: string | null;
}): Promise<void> {
  const supabase = await createClient();
  const userId = await getCurrentUserId(supabase);
  if (!userId) throw new Error("No autenticado");

  const { error } = await supabase.from("tasks").insert(
    {
      user_id: userId,
      title: input.title,
      category: input.category,
      subject_id: input.subject_id ?? null,
      priority: input.priority,
      due_date: input.due_date ?? null,
      completed: false,
    } as never,
  );

  if (error) throw error;
}

/** Actualiza una tarea existente. */
export async function updateTask(
  id: string,
  input: {
    title?: string;
    category?: TaskCategory;
    subject_id?: string | null;
    priority?: Priority;
    due_date?: string | null;
  },
): Promise<void> {
  const supabase = await createClient();
  const userId = await getCurrentUserId(supabase);
  if (!userId) throw new Error("No autenticado");

  const update: Record<string, unknown> = {};
  if (input.title !== undefined) update.title = input.title;
  if (input.category !== undefined) update.category = input.category;
  if (input.subject_id !== undefined) update.subject_id = input.subject_id;
  if (input.priority !== undefined) update.priority = input.priority;
  if (input.due_date !== undefined) update.due_date = input.due_date;

  const { error } = await supabase
    .from("tasks")
    .update(update as never)
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
}

/** Marca/desmarca una tarea como completada. */
export async function toggleTask(
  id: string,
  completed: boolean,
): Promise<void> {
  const supabase = await createClient();
  const userId = await getCurrentUserId(supabase);
  if (!userId) throw new Error("No autenticado");

  const { error } = await supabase
    .from("tasks")
    .update({
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    } as never)
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
}

/** Elimina una tarea. */
export async function deleteTask(id: string): Promise<void> {
  const supabase = await createClient();
  const userId = await getCurrentUserId(supabase);
  if (!userId) throw new Error("No autenticado");

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
}


/**
 * Crea un grupo de tareas para una fecha sin duplicar títulos ya existentes.
 * Se usa en Atajos para que pulsar dos veces el mismo atajo sea seguro.
 */
export async function createTasksIfMissing(input: {
  due_date: string;
  tasks: {
    title: string;
    category: TaskCategory;
    priority: Priority;
  }[];
}): Promise<{ created: number; skipped: number }> {
  const supabase = await createClient();
  const userId = await getCurrentUserId(supabase);
  if (!userId) throw new Error("No autenticado");

  if (input.tasks.length === 0) {
    return { created: 0, skipped: 0 };
  }

  const titles = input.tasks.map((task) => task.title);

  const { data: existing, error: existingError } = await supabase
    .from("tasks")
    .select("title")
    .eq("user_id", userId)
    .eq("due_date", input.due_date)
    .in("title", titles);

  if (existingError) throw existingError;

  const existingTitles = new Set(
    ((existing ?? []) as { title: string }[]).map((task) => task.title),
  );

  const missing = input.tasks.filter((task) => !existingTitles.has(task.title));

  if (missing.length > 0) {
    const { error } = await supabase.from("tasks").insert(
      missing.map((task) => ({
        user_id: userId,
        title: task.title,
        category: task.category,
        subject_id: null,
        priority: task.priority,
        due_date: input.due_date,
        completed: false,
      })) as never,
    );

    if (error) throw error;
  }

  return {
    created: missing.length,
    skipped: input.tasks.length - missing.length,
  };
}
