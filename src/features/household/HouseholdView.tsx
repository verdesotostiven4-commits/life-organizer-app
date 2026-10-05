"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  BellRing,
  Check,
  CheckCircle2,
  ClipboardCopy,
  Clock3,
  Home,
  Pencil,
  Plus,
  Trash2,
  X,
  UserPlus,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import {
  createInviteCode,
  joinHousehold,
  saveNotificationPreferences,
  updateHouseholdName,
  type HouseholdOverview,
  type NotificationPreferences,
} from "./queries";
import {
  createHouseholdReminder,
  deleteHouseholdReminder,
  setHouseholdReminderCompleted,
  updateHouseholdReminder,
  type HouseholdReminder,
} from "./reminder-queries";
import { cn } from "@/lib/utils";

const DEFAULT_PREFERENCES: NotificationPreferences = {
  enabled: true,
  browser_enabled: false,
  tasks: true,
  purchases: true,
  schedule: true,
  academics: true,
  advance_minutes: 30,
  quiet_start: "21:30:00",
  quiet_end: "07:00:00",
};

const DESTINATIONS = [
  { value: "/dashboard", label: "Inicio" },
  { value: "/tasks", label: "Tareas" },
  { value: "/schedule", label: "Horario" },
  { value: "/pantry", label: "Despensa" },
  { value: "/finance", label: "Finanzas" },
  { value: "/academic", label: "Académico" },
];

const ADVANCE_OPTIONS = [15, 30, 45, 60, 90].map((value) => ({
  value: String(value),
  label: `${value} minutos antes`,
}));

const dateTimeFormatter = new Intl.DateTimeFormat("es-EC", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

function toLocalDateTimeInput(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function defaultReminderDate() {
  const date = new Date();
  date.setHours(date.getHours() + 1, 0, 0, 0);
  return toLocalDateTimeInput(date);
}

export function HouseholdView({
  initialOverview,
  initialPreferences,
  initialReminders,
}: {
  initialOverview: HouseholdOverview | null;
  initialPreferences: NotificationPreferences | null;
  initialReminders: HouseholdReminder[];
}) {
  const router = useRouter();
  const [overview, setOverview] = useState(initialOverview);
  const [preferences, setPreferences] = useState(
    initialPreferences ?? DEFAULT_PREFERENCES,
  );
  const [reminders, setReminders] = useState(initialReminders);
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [invite, setInvite] = useState<{
    code: string;
    expires_at: string;
  } | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [householdName, setHouseholdName] = useState(
    initialOverview?.name ?? "Nuestro hogar",
  );
  const [savingName, setSavingName] = useState(false);
  const [prefMessage, setPrefMessage] = useState("");
  const [reminderTitle, setReminderTitle] = useState("");
  const [reminderNote, setReminderNote] = useState("");
  const [reminderAt, setReminderAt] = useState(defaultReminderDate);
  const [reminderHref, setReminderHref] = useState("/dashboard");
  const [editingReminderId, setEditingReminderId] = useState<string | null>(null);
  const [reminderLoading, setReminderLoading] = useState(false);

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    setJoining(true);
    setJoinError("");

    try {
      await joinHousehold(joinCode);
      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      setJoinError(
        error instanceof Error ? error.message : "No se pudo unir al hogar.",
      );
    } finally {
      setJoining(false);
    }
  };

  const handleCreateInvite = async () => {
    setInviteLoading(true);
    try {
      const result = await createInviteCode();
      setInvite(result);
      setCopied(false);
    } finally {
      setInviteLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!invite) return;
    await navigator.clipboard.writeText(invite.code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const handleNameSave = async () => {
    if (!overview || !householdName.trim()) return;
    setSavingName(true);
    try {
      await updateHouseholdName(householdName);
      setOverview({ ...overview, name: householdName.trim() });
    } finally {
      setSavingName(false);
    }
  };

  const persistPreferences = async (next: NotificationPreferences) => {
    setPreferences(next);
    setPrefMessage("");
    try {
      await saveNotificationPreferences(next);
      setPrefMessage("Preferencias guardadas.");
      window.setTimeout(() => setPrefMessage(""), 1800);
    } catch {
      setPrefMessage("No se pudieron guardar los avisos.");
    }
  };

  const togglePreference = (
    key: "enabled" | "tasks" | "purchases" | "schedule" | "academics",
  ) => {
    void persistPreferences({ ...preferences, [key]: !preferences[key] });
  };

  const requestBrowserNotifications = async () => {
    if (!("Notification" in window)) {
      setPrefMessage("Este navegador no soporta notificaciones.");
      return;
    }

    const permission = await Notification.requestPermission();
    const next = {
      ...preferences,
      browser_enabled: permission === "granted",
    };
    await persistPreferences(next);

    if (permission === "granted") {
      setPrefMessage("Notificaciones del dispositivo activadas.");
    } else {
      setPrefMessage("El navegador no dio permiso para mostrar avisos.");
    }
  };

  const resetReminderForm = () => {
    setEditingReminderId(null);
    setReminderTitle("");
    setReminderNote("");
    setReminderAt(defaultReminderDate());
    setReminderHref("/dashboard");
  };

  const editReminder = (reminder: HouseholdReminder) => {
    setEditingReminderId(reminder.id);
    setReminderTitle(reminder.title);
    setReminderNote(reminder.note);
    setReminderAt(toLocalDateTimeInput(reminder.remind_at));
    setReminderHref(reminder.href || "/dashboard");
  };

  const addReminder = async () => {
    if (!reminderTitle.trim() || !reminderAt) return;
    setReminderLoading(true);

    try {
      const input = {
        title: reminderTitle,
        note: reminderNote,
        remind_at: new Date(reminderAt).toISOString(),
        href: reminderHref,
      };

      const saved = editingReminderId
        ? await updateHouseholdReminder(editingReminderId, input)
        : await createHouseholdReminder(input);

      setReminders((current) => {
        const next = editingReminderId
          ? current.map((reminder) =>
              reminder.id === editingReminderId ? saved : reminder,
            )
          : [...current, saved];

        return next.sort(
          (a, b) =>
            Number(a.completed) - Number(b.completed) ||
            new Date(a.remind_at).getTime() - new Date(b.remind_at).getTime(),
        );
      });
      resetReminderForm();
    } finally {
      setReminderLoading(false);
    }
  };

  const toggleReminder = async (id: string, completed: boolean) => {
    const previous = reminders;
    setReminders((current) =>
      current.map((reminder) =>
        reminder.id === id ? { ...reminder, completed } : reminder,
      ),
    );

    try {
      await setHouseholdReminderCompleted(id, completed);
    } catch {
      setReminders(previous);
    }
  };

  const removeReminder = async (id: string) => {
    const previous = reminders;
    setReminders((current) => current.filter((reminder) => reminder.id !== id));

    try {
      await deleteHouseholdReminder(id);
    } catch {
      setReminders(previous);
    }
  };

  if (!overview) {
    return (
      <Card className="mx-auto max-w-xl border-purple-100">
        <CardBody className="space-y-5 p-6 sm:p-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-purple-100 text-purple-700">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-purple-600">
              Vincular este usuario
            </p>
            <h2 className="mt-1 text-xl font-black text-slate-950">
              Únete al hogar compartido
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Desde la cuenta que ya tiene Harmony, genera un código de invitación.
              Escríbelo aquí y esta cuenta verá el mismo horario, tareas, despensa,
              plantillas y finanzas.
            </p>
          </div>

          <input
            value={joinCode}
            onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
            onKeyDown={(event) => event.key === "Enter" && handleJoin()}
            placeholder="HMY-XXXX-XXXX"
            className="h-12 w-full rounded-2xl border border-purple-200 bg-white px-4 text-center font-mono text-base font-black uppercase tracking-wider text-purple-900 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
          />

          {joinError ? (
            <p className="rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
              {joinError}
            </p>
          ) : null}

          <Button
            className="w-full"
            size="lg"
            onClick={handleJoin}
            disabled={!joinCode.trim() || joining}
          >
            <UserPlus className="h-4 w-4" />
            {joining ? "Vinculando…" : "Unirme al hogar"}
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <section className="grid gap-4 lg:grid-cols-[1.05fr_.95fr]">
        <Card>
          <CardBody className="space-y-5">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-purple-700">
                <Home className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-purple-600">
                  Nombre del espacio
                </p>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <input
                    value={householdName}
                    onChange={(event) => setHouseholdName(event.target.value)}
                    maxLength={80}
                    className="h-11 min-w-0 flex-1 rounded-xl border border-purple-100 px-3 text-sm font-bold text-slate-900 outline-none focus:border-purple-300"
                  />
                  <Button
                    variant="secondary"
                    onClick={handleNameSave}
                    disabled={savingName || !householdName.trim()}
                  >
                    {savingName ? "Guardando…" : "Guardar nombre"}
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-black text-slate-900">
                Miembros
              </p>
              <div className="space-y-2">
                {overview.members.map((member) => (
                  <div
                    key={member.user_id}
                    className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 px-3 py-2.5"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-xs font-black text-purple-700 shadow-sm">
                      {member.display_name.slice(0, 1).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-800">
                        {member.display_name}
                      </p>
                      <p className="text-[10px] font-semibold text-slate-400">
                        {member.role === "owner" ? "Creador del hogar" : "Miembro"}
                      </p>
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  </div>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-indigo-100">
          <CardBody className="space-y-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-700">
                <UserPlus className="h-4 w-4" />
                <h3 className="text-sm font-black text-slate-900">
                  Vincular el celular de tu pareja
                </h3>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                En el segundo celular crea su propia cuenta de Harmony. Luego abre
                Hogar y escribe este código. Dura 7 días y se usa una sola vez.
              </p>
            </div>

            {invite ? (
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
                <p className="text-center font-mono text-xl font-black tracking-widest text-indigo-900">
                  {invite.code}
                </p>
                <p className="mt-1 text-center text-[10px] font-semibold text-indigo-500">
                  Vence {dateTimeFormatter.format(new Date(invite.expires_at))}
                </p>
                <Button
                  variant="secondary"
                  className="mt-3 w-full"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <ClipboardCopy className="h-4 w-4" />
                  )}
                  {copied ? "Copiado" : "Copiar código"}
                </Button>
              </div>
            ) : (
              <Button
                className="w-full"
                onClick={handleCreateInvite}
                disabled={inviteLoading}
              >
                <UserPlus className="h-4 w-4" />
                {inviteLoading ? "Generando…" : "Generar código de invitación"}
              </Button>
            )}
          </CardBody>
        </Card>
      </section>

      <Card className="border-sky-100">
        <CardBody className="space-y-5">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
              <BellRing className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-sm font-black text-slate-900">
                Avisos y recordatorios
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                Cada miembro elige qué avisos quiere recibir en su propio celular.
                Las tareas y clases se generan automáticamente; las compras avisan
                cuando el otro cambia su estado.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["tasks", "Tareas", "Hoy y mañana"],
              ["purchases", "Compras", "Cambios en listas"],
              ["schedule", "Clases", "Antes de empezar"],
              ["academics", "Académico", "Base para exámenes"],
            ].map(([key, label, helper]) => {
              const typedKey = key as "tasks" | "purchases" | "schedule" | "academics";
              const active = preferences[typedKey];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => togglePreference(typedKey)}
                  className={cn(
                    "rounded-2xl border p-3 text-left transition-colors",
                    active
                      ? "border-sky-200 bg-sky-50"
                      : "border-slate-100 bg-slate-50",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-black text-slate-800">{label}</p>
                    <span
                      className={cn(
                        "h-5 w-9 rounded-full p-0.5 transition-colors",
                        active ? "bg-sky-500" : "bg-slate-200",
                      )}
                    >
                      <span
                        className={cn(
                          "block h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
                          active && "translate-x-4",
                        )}
                      />
                    </span>
                  </div>
                  <p className="mt-1 text-[10px] text-slate-400">{helper}</p>
                </button>
              );
            })}
          </div>

          <div className="grid gap-3 md:grid-cols-[220px_1fr_auto] md:items-end">
            <div>
              <p className="mb-1.5 text-[11px] font-bold text-slate-500">
                Aviso de clases
              </p>
              <Select
                value={String(preferences.advance_minutes)}
                options={ADVANCE_OPTIONS}
                onChange={(value) =>
                  void persistPreferences({
                    ...preferences,
                    advance_minutes: Number(value),
                  })
                }
              />
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-xs text-slate-500">
              <Bell className="mr-1 inline h-3.5 w-3.5 text-purple-500" />
              Los avisos siempre quedan guardados dentro de Harmony. El permiso del
              dispositivo permite mostrarlos también como notificación del navegador
              cuando la PWA está activa.
            </div>
            <Button
              onClick={requestBrowserNotifications}
              variant={preferences.browser_enabled ? "secondary" : "primary"}
            >
              <BellRing className="h-4 w-4" />
              {preferences.browser_enabled ? "Dispositivo activado" : "Activar en este dispositivo"}
            </Button>
          </div>

          {prefMessage ? (
            <p className="text-xs font-semibold text-sky-700">{prefMessage}</p>
          ) : null}
        </CardBody>
      </Card>

      <Card className="border-amber-100">
        <CardBody className="space-y-5">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
              <Clock3 className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-sm font-black text-slate-900">
                Recordatorios del hogar
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Para exámenes, pagos, compras o cualquier cosa que no encaje en otro módulo.
              </p>
            </div>
          </div>

          {editingReminderId ? (
            <div className="flex items-center justify-between rounded-2xl border border-amber-100 bg-amber-50/60 px-3 py-2">
              <p className="text-xs font-bold text-amber-700">
                Editando recordatorio
              </p>
              <button
                type="button"
                onClick={resetReminderForm}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-amber-400 hover:bg-white hover:text-amber-700"
                aria-label="Cancelar edición del recordatorio"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : null}

          <div className="grid gap-2 lg:grid-cols-[1.2fr_1.2fr_190px_170px_auto]">
            <input
              value={reminderTitle}
              onChange={(event) => setReminderTitle(event.target.value)}
              placeholder="Ej. Examen de Estadística"
              className="h-11 rounded-xl border border-amber-100 px-3 text-sm font-semibold text-slate-800 outline-none focus:border-amber-300"
            />
            <input
              value={reminderNote}
              onChange={(event) => setReminderNote(event.target.value)}
              placeholder="Nota opcional"
              className="h-11 rounded-xl border border-amber-100 px-3 text-sm text-slate-700 outline-none focus:border-amber-300"
            />
            <input
              type="datetime-local"
              value={reminderAt}
              onChange={(event) => setReminderAt(event.target.value)}
              className="h-11 rounded-xl border border-amber-100 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-amber-300"
            />
            <Select
              value={reminderHref}
              options={DESTINATIONS}
              onChange={setReminderHref}
            />
            <Button
              onClick={addReminder}
              disabled={!reminderTitle.trim() || !reminderAt || reminderLoading}
            >
              {editingReminderId ? (
                <Pencil className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {reminderLoading
                ? "Guardando…"
                : editingReminderId
                  ? "Guardar"
                  : "Agregar"}
            </Button>
          </div>

          {reminders.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-amber-100 py-6 text-center text-xs text-slate-400">
              Aún no hay recordatorios manuales.
            </p>
          ) : (
            <div className="space-y-2">
              {reminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border px-3 py-2.5",
                    reminder.completed
                      ? "border-slate-100 bg-slate-50 opacity-65"
                      : "border-amber-100 bg-amber-50/40",
                  )}
                >
                  <button
                    type="button"
                    onClick={() =>
                      toggleReminder(reminder.id, !reminder.completed)
                    }
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border",
                      reminder.completed
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-amber-200 bg-white text-transparent",
                    )}
                    aria-label="Cambiar estado del recordatorio"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "truncate text-xs font-black text-slate-800",
                        reminder.completed && "line-through",
                      )}
                    >
                      {reminder.title}
                    </p>
                    <p className="mt-0.5 truncate text-[10px] text-slate-400">
                      {dateTimeFormatter.format(new Date(reminder.remind_at))}
                      {reminder.note ? ` · ${reminder.note}` : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => editReminder(reminder)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-300 hover:bg-amber-50 hover:text-amber-600"
                    aria-label="Editar recordatorio"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeReminder(reminder.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-300 hover:bg-rose-50 hover:text-rose-500"
                    aria-label="Eliminar recordatorio"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
