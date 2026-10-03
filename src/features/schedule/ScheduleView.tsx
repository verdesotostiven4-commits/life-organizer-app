"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { SessionWithSubject } from "@/features/schedule/queries";
import {
  getAttendanceRange,
  saveAttendance,
  deleteAttendance,
  type AttendanceRecord,
} from "@/features/attendance/queries";
import { AttendanceSummary } from "@/features/attendance/components/AttendanceSummary";
import { AttendanceModal } from "@/features/attendance/AttendanceModal";
import { WeekGrid } from "./components/WeekGrid";
import { addDays, mondayOf, toISODate } from "@/lib/dates";
import type { AttendanceStatus } from "@/types/domain";

interface ScheduleViewProps {
  sessions: SessionWithSubject[];
  initialSummary: {
    subject_id: string;
    subject_name: string;
    attended: number;
    missed: number;
    cancelled: number;
    attendance_pct: number | null;
  }[];
  initialAttendance: AttendanceRecord[];
}

type SummaryItem = {
  subject_id: string;
  subject_name: string;
  attended: number;
  missed: number;
  cancelled: number;
  attendance_pct: number | null;
};

function recordsToStatusMap(records: AttendanceRecord[]): Map<string, AttendanceStatus> {
  return new Map(records.map((record) => [
    `${record.session_id}:${record.session_date}`,
    record.status,
  ]));
}

function recordsToNoteMap(records: AttendanceRecord[]): Map<string, string> {
  return new Map(records.map((record) => [
    `${record.session_id}:${record.session_date}`,
    record.note,
  ]));
}

/** Ajusta el resumen local tras un cambio de estado de asistencia (sin re-fetch). */
function adjustSummary(
  summary: SummaryItem[],
  subjectId: string | undefined,
  oldStatus: AttendanceStatus | null,
  newStatus: AttendanceStatus | null,
): SummaryItem[] {
  if (!subjectId) return summary;
  return summary.map((item) => {
    if (item.subject_id !== subjectId) return item;
    let { attended, missed, cancelled } = item;
    if (oldStatus === "asisti") attended -= 1;
    else if (oldStatus === "falta") missed -= 1;
    else if (oldStatus === "no_hubo") cancelled -= 1;

    if (newStatus === "asisti") attended += 1;
    else if (newStatus === "falta") missed += 1;
    else if (newStatus === "no_hubo") cancelled += 1;

    const total = attended + missed;
    return {
      ...item,
      attended,
      missed,
      cancelled,
      attendance_pct: total > 0 ? Math.round((attended / total) * 100) : null,
    };
  });
}

export function ScheduleView({
  sessions,
  initialSummary,
  initialAttendance,
}: ScheduleViewProps) {
  const today = useMemo(() => toISODate(), []);
  const initialMonday = useMemo(() => mondayOf(today), [today]);
  const [currentMonday, setCurrentMonday] = useState(initialMonday);
  const firstWeekRef = useRef(initialMonday);
  const [attendance, setAttendance] = useState(() => recordsToStatusMap(initialAttendance));
  const [notes, setNotes] = useState(() => recordsToNoteMap(initialAttendance));
  const [summary, setSummary] = useState<SummaryItem[]>(initialSummary);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalSession, setModalSession] = useState<SessionWithSubject | null>(null);
  const [modalDate, setModalDate] = useState(today);

  useEffect(() => {
    // La primera semana ya llegó renderizada desde el servidor.
    if (currentMonday === firstWeekRef.current) return;

    const start = currentMonday;
    const end = addDays(currentMonday, 6);
    getAttendanceRange(start, end).then((records) => {
      setAttendance(recordsToStatusMap(records));
      setNotes(recordsToNoteMap(records));
    });
  }, [currentMonday]);

  const handleSessionClick = (session: SessionWithSubject, date: string) => {
    setModalSession(session);
    setModalDate(date);
    setModalOpen(true);
  };

  const handleSave = async (
    sessionId: string,
    date: string,
    status: AttendanceStatus,
    note: string,
  ) => {
    const key = `${sessionId}:${date}`;
    const prevStatus = attendance.get(key) ?? null;
    const prevNote = notes.get(key) ?? "";
    const subjectId = modalSession?.subject_id;

    const optimisticAttendance = new Map(attendance);
    optimisticAttendance.set(key, status);
    setAttendance(optimisticAttendance);

    const optimisticNotes = new Map(notes);
    optimisticNotes.set(key, note.trim());
    setNotes(optimisticNotes);

    setSummary((current) => adjustSummary(current, subjectId, prevStatus, status));
    setModalOpen(false);

    try {
      await saveAttendance(sessionId, date, status, note);
    } catch (error) {
      console.error("Error al guardar asistencia:", error);

      const rollbackAttendance = new Map(attendance);
      if (prevStatus) rollbackAttendance.set(key, prevStatus);
      else rollbackAttendance.delete(key);
      setAttendance(rollbackAttendance);

      const rollbackNotes = new Map(notes);
      if (prevNote) rollbackNotes.set(key, prevNote);
      else rollbackNotes.delete(key);
      setNotes(rollbackNotes);

      setSummary((current) => adjustSummary(current, subjectId, status, prevStatus));
    }
  };

  const handleDelete = async (sessionId: string, date: string) => {
    const key = `${sessionId}:${date}`;
    const prevStatus = attendance.get(key) ?? null;
    const prevNote = notes.get(key) ?? "";
    const subjectId = modalSession?.subject_id;

    const optimisticAttendance = new Map(attendance);
    optimisticAttendance.delete(key);
    setAttendance(optimisticAttendance);

    const optimisticNotes = new Map(notes);
    optimisticNotes.delete(key);
    setNotes(optimisticNotes);

    setSummary((current) => adjustSummary(current, subjectId, prevStatus, null));
    setModalOpen(false);

    try {
      await deleteAttendance(sessionId, date);
    } catch (error) {
      console.error("Error al borrar asistencia:", error);

      const rollbackAttendance = new Map(attendance);
      if (prevStatus) rollbackAttendance.set(key, prevStatus);
      setAttendance(rollbackAttendance);

      const rollbackNotes = new Map(notes);
      if (prevNote) rollbackNotes.set(key, prevNote);
      setNotes(rollbackNotes);

      setSummary((current) => adjustSummary(current, subjectId, null, prevStatus));
    }
  };

  const handleChangeWeek = (delta: number) => {
    setCurrentMonday((monday) => addDays(monday, delta * 7));
  };

  const modalKey = modalSession ? `${modalSession.id}:${modalDate}` : "";
  const initialStatus = modalKey ? (attendance.get(modalKey) ?? null) : null;
  const initialNote = modalKey ? (notes.get(modalKey) ?? "") : "";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <WeekGrid
            currentMonday={currentMonday}
            onChangeWeek={handleChangeWeek}
            sessions={sessions}
            attendance={attendance}
            notes={notes}
            onSessionClick={handleSessionClick}
            today={today}
          />
        </div>
        <div>
          <AttendanceSummary data={summary} />
        </div>
      </div>

      <AttendanceModal
        key={`${modalKey}:${initialStatus ?? "none"}:${initialNote}`}
        open={modalOpen}
        session={modalSession}
        initialDate={modalDate}
        initialStatus={initialStatus}
        initialNote={initialNote}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        onDelete={initialStatus ? handleDelete : undefined}
        loading={false}
      />
    </div>
  );
}
