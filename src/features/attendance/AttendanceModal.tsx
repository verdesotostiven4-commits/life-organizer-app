"use client";

import { useState } from "react";
import { MessageSquareText } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { DatePicker } from "@/components/ui/DatePicker";
import type { SessionWithSubject } from "@/features/schedule/queries";
import { ATTENDANCE_META, type AttendanceStatus } from "@/types/domain";
import { formatLong } from "@/lib/dates";

interface AttendanceModalProps {
  open: boolean;
  session: SessionWithSubject | null;
  initialDate: string;
  initialStatus: AttendanceStatus | null;
  initialNote: string;
  onClose: () => void;
  onSave: (sessionId: string, date: string, status: AttendanceStatus, note: string) => void;
  onDelete?: (sessionId: string, date: string) => void;
  loading?: boolean;
}

export function AttendanceModal({
  open,
  session,
  initialDate,
  initialStatus,
  initialNote,
  onClose,
  onSave,
  onDelete,
  loading,
}: AttendanceModalProps) {
  const [date, setDate] = useState(initialDate);
  const [status, setStatus] = useState<AttendanceStatus | null>(initialStatus);
  const [note, setNote] = useState(initialNote);

  if (!session) return null;

  const canDelete = Boolean(initialStatus && onDelete);

  return (
    <Modal open={open} onClose={onClose} title={`Asistencia · ${session.subject_name}`}>
      <div className="space-y-5">
        <div className="rounded-xl bg-lila-50 p-3 text-sm">
          <p className="font-medium text-lila-900">
            {session.start_time.slice(0, 5)}–{session.end_time.slice(0, 5)}
          </p>
          <p className="text-lila-500">{session.room || "Sin aula"}</p>
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium text-lila-600">
            Fecha: {formatLong(date)}
          </label>
          <DatePicker value={date} onChange={setDate} />
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium text-lila-600">Estado</label>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                ["asisti", "Asistí"],
                ["falta", "Falta"],
                ["no_hubo", "No hubo"],
              ] as [AttendanceStatus, string][]
            ).map(([key, label]) => {
              const meta = ATTENDANCE_META[key];
              const active = status === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setStatus(key)}
                  className={`rounded-xl border px-1 py-2 text-sm font-medium transition-colors ${
                    active
                      ? meta.active
                      : "bg-white border-lila-200 text-lila-600 hover:bg-lila-50"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="mb-2 flex items-center gap-2 text-xs font-medium text-lila-600">
            <MessageSquareText className="h-3.5 w-3.5" />
            Nota de la clase
          </label>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            placeholder="Ej. El ingeniero terminó 5 min antes, revisamos capítulo 3…"
            className="w-full resize-none rounded-xl border border-lila-200 bg-white px-3 py-2 text-sm text-lila-900 placeholder:text-lila-300 focus:border-lavanda-400 focus:outline-none focus:ring-2 focus:ring-lavanda-400"
          />
          <p className="mt-1 text-[10px] text-lila-400">
            La nota queda guardada junto a esta materia y esta fecha.
          </p>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          {canDelete ? (
            <Button
              variant="danger"
              className="flex-1"
              onClick={() => onDelete?.(session.id, date)}
              disabled={loading}
            >
              Borrar
            </Button>
          ) : null}
          <Button
            className="flex-1"
            onClick={() => {
              if (status) onSave(session.id, date, status, note);
            }}
            disabled={!status || loading}
          >
            {loading ? "Guardando…" : "Guardar"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
