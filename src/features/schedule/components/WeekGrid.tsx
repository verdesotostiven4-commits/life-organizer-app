"use client";

import { ChevronLeft, ChevronRight, Clock3, MapPin, MessageSquareText } from "lucide-react";
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

const STATUS_STYLES: Record<AttendanceStatus, string> = {
  asisti: "border-emerald-200 bg-emerald-50",
  falta: "border-rose-200 bg-rose-50",
  no_hubo: "border-amber-200 bg-amber-50",
};

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-3xl border border-purple-100 bg-white/90 p-3 shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => onChangeWeek(-1)}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="text-center">
          <p className="text-sm font-black text-slate-900">Semana del {formatShort(currentMonday)}</p>
          <p className="text-[11px] text-slate-400">{formatShort(currentMonday)} – {formatShort(addDays(currentMonday, 6))}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => onChangeWeek(1)}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {days.map(({ dow, iso, label }) => {
          const daySessions = sessions.filter((session) => session.day_of_week === dow);
          const isToday = iso === today;

          return (
            <section
              key={dow}
              className={cn(
                "rounded-3xl border p-3 shadow-sm",
                isToday ? "border-purple-200 bg-purple-50/70" : "border-slate-100 bg-white/90",
              )}
            >
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className={cn("text-[10px] font-black uppercase tracking-wider", isToday ? "text-purple-700" : "text-slate-400")}>{label}</p>
                  <p className="text-xs font-bold text-slate-700">{formatShort(iso)}</p>
                </div>
                {isToday ? <span className="rounded-full bg-purple-600 px-2 py-0.5 text-[9px] font-black text-white">HOY</span> : null}
              </div>

              <div className="space-y-2">
                {daySessions.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 py-8 text-center text-xs text-slate-300">
                    Sin clases
                  </div>
                ) : null}

                {daySessions.map((session) => {
                  const key = `${session.id}:${iso}`;
                  const status = attendance.get(key) ?? null;
                  const note = notes.get(key)?.trim() ?? "";

                  return (
                    <button
                      key={session.id}
                      type="button"
                      onClick={() => onSessionClick(session, iso)}
                      className={cn(
                        "w-full rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-sm",
                        status ? STATUS_STYLES[status] : "border-purple-100 bg-white",
                      )}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-purple-700">
                        <Clock3 className="h-3 w-3" /> {session.start_time.slice(0, 5)}–{session.end_time.slice(0, 5)}
                      </div>
                      <p className="mt-1.5 text-xs font-black leading-snug text-slate-900">{session.subject_name}</p>
                      {session.room ? (
                        <p className="mt-1 flex items-center gap-1 text-[9px] text-slate-400">
                          <MapPin className="h-2.5 w-2.5" /> {session.room}
                        </p>
                      ) : null}
                      {status ? (
                        <p className="mt-2 text-[9px] font-black uppercase tracking-wider text-slate-500">
                          {status === "asisti" ? "Asistí" : status === "falta" ? "Falta" : "No hubo clase"}
                        </p>
                      ) : null}
                      {note ? (
                        <p className="mt-1.5 flex items-center gap-1 text-[9px] font-semibold text-indigo-500">
                          <MessageSquareText className="h-3 w-3" /> Nota guardada
                        </p>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
