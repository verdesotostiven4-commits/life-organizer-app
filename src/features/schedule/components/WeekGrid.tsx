"use client";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  MessageSquareText,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { SessionWithSubject } from "@/features/schedule/queries";
import { addDays, DOW_LABELS, formatShort } from "@/lib/dates";
import type { AttendanceStatus } from "@/types/domain";

interface WeekGridProps {
  currentMonday: string;
  today: string;
  onChangeWeek: (delta: number) => void;
  sessions: SessionWithSubject[];
  attendance: Map<string, AttendanceStatus>;
  notes: Map<string, string>;
  onSessionClick: (session: SessionWithSubject, date: string) => void;
}

const DAYS: (1 | 2 | 3 | 4 | 5)[] = [1, 2, 3, 4, 5];

const SUBJECT_TONES = [
  {
    border: "border-violet-100",
    bg: "bg-violet-50/55",
    time: "bg-violet-100 text-violet-700",
    dot: "bg-violet-500",
  },
  {
    border: "border-sky-100",
    bg: "bg-sky-50/60",
    time: "bg-sky-100 text-sky-700",
    dot: "bg-sky-500",
  },
  {
    border: "border-emerald-100",
    bg: "bg-emerald-50/55",
    time: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
  },
  {
    border: "border-amber-100",
    bg: "bg-amber-50/60",
    time: "bg-amber-100 text-amber-700",
    dot: "bg-amber-500",
  },
  {
    border: "border-rose-100",
    bg: "bg-rose-50/55",
    time: "bg-rose-100 text-rose-700",
    dot: "bg-rose-500",
  },
  {
    border: "border-indigo-100",
    bg: "bg-indigo-50/55",
    time: "bg-indigo-100 text-indigo-700",
    dot: "bg-indigo-500",
  },
] as const;

const STATUS_BADGES: Record<AttendanceStatus, string> = {
  asisti: "border-emerald-200 bg-emerald-50 text-emerald-700",
  falta: "border-rose-200 bg-rose-50 text-rose-700",
  no_hubo: "border-amber-200 bg-amber-50 text-amber-700",
};

function subjectTone(subject: string) {
  let hash = 0;
  for (let index = 0; index < subject.length; index += 1) {
    hash = (hash * 31 + subject.charCodeAt(index)) >>> 0;
  }
  return SUBJECT_TONES[hash % SUBJECT_TONES.length];
}

function statusLabel(status: AttendanceStatus) {
  if (status === "asisti") return "Asistí";
  if (status === "falta") return "Falta";
  return "No hubo";
}

export function WeekGrid({
  currentMonday,
  today,
  onChangeWeek,
  sessions,
  attendance,
  notes,
  onSessionClick,
}: WeekGridProps) {
  const days = DAYS.map((dow) => ({
    dow,
    iso: addDays(currentMonday, dow - 1),
    label: DOW_LABELS[dow - 1],
  }));

  const totalClasses = sessions.length;

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-purple-100 bg-white p-3 shadow-sm sm:p-4">
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onChangeWeek(-1)}
            aria-label="Semana anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <div className="min-w-0 text-center">
            <div className="flex items-center justify-center gap-2">
              <CalendarDays className="h-4 w-4 text-purple-500" />
              <p className="truncate text-sm font-black text-slate-950">
                Semana del {formatShort(currentMonday)}
              </p>
            </div>
            <p className="mt-0.5 text-[11px] font-medium text-slate-400">
              {formatShort(currentMonday)} – {formatShort(addDays(currentMonday, 6))}
              <span className="mx-1.5 text-slate-200">•</span>
              {totalClasses} clases programadas
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onChangeWeek(1)}
            aria-label="Semana siguiente"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </section>

      <div className="space-y-3">
        {days.map(({ dow, iso, label }) => {
          const daySessions = sessions.filter(
            (session) => session.day_of_week === dow,
          );
          const isToday = iso === today;

          return (
            <section
              key={dow}
              className={cn(
                "grid gap-3 rounded-3xl border p-3 shadow-[0_5px_18px_rgba(15,23,42,0.025)] sm:grid-cols-[122px_1fr] sm:p-4",
                isToday
                  ? "border-purple-200 bg-gradient-to-r from-purple-50/80 to-white"
                  : "border-slate-100 bg-white",
              )}
            >
              <div className="flex items-center justify-between sm:block">
                <div>
                  <div className="flex items-center gap-2">
                    <p
                      className={cn(
                        "text-[10px] font-black uppercase tracking-[0.12em]",
                        isToday ? "text-purple-700" : "text-slate-400",
                      )}
                    >
                      {label}
                    </p>
                    {isToday ? (
                      <span className="rounded-full bg-purple-600 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-white">
                        Hoy
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm font-black text-slate-900">
                    {formatShort(iso)}
                  </p>
                </div>

                <p className="rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-400 sm:mt-3 sm:inline-block">
                  {daySessions.length === 0
                    ? "Libre"
                    : `${daySessions.length} clase${daySessions.length === 1 ? "" : "s"}`}
                </p>
              </div>

              {daySessions.length === 0 ? (
                <div className="flex min-h-20 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-4 text-xs font-semibold text-slate-300">
                  Sin clases programadas
                </div>
              ) : (
                <div className="grid gap-2.5 md:grid-cols-2">
                  {daySessions.map((session) => {
                    const key = `${session.id}:${iso}`;
                    const status = attendance.get(key) ?? null;
                    const note = notes.get(key)?.trim() ?? "";
                    const tone = subjectTone(session.subject_name);

                    return (
                      <button
                        key={session.id}
                        type="button"
                        onClick={() => onSessionClick(session, iso)}
                        className={cn(
                          "group min-w-0 rounded-2xl border p-3 text-left transition-colors duration-100 hover:bg-white active:scale-[0.995]",
                          tone.border,
                          tone.bg,
                        )}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black",
                              tone.time,
                            )}
                          >
                            <Clock3 className="h-3 w-3" />
                            {session.start_time.slice(0, 5)}–{session.end_time.slice(0, 5)}
                          </span>

                          {status ? (
                            <span
                              className={cn(
                                "rounded-full border px-2 py-0.5 text-[9px] font-black",
                                STATUS_BADGES[status],
                              )}
                            >
                              {statusLabel(status)}
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-slate-300">
                              Toca para registrar
                            </span>
                          )}
                        </div>

                        <div className="mt-3 flex items-start gap-2">
                          <span
                            className={cn(
                              "mt-1 h-2.5 w-2.5 shrink-0 rounded-full",
                              tone.dot,
                            )}
                          />
                          <div className="min-w-0">
                            <p className="text-[13px] font-black leading-snug text-slate-900">
                              {session.subject_name}
                            </p>
                            {session.room ? (
                              <p className="mt-1 flex items-center gap-1 text-[10px] font-medium text-slate-400">
                                <MapPin className="h-3 w-3" />
                                {session.room}
                              </p>
                            ) : null}
                          </div>
                        </div>

                        {note ? (
                          <div className="mt-3 flex items-center gap-1.5 border-t border-white/70 pt-2 text-[9px] font-bold text-indigo-500">
                            <MessageSquareText className="h-3 w-3" />
                            Tiene una nota guardada
                          </div>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
