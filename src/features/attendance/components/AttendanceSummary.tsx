"use client";

import { CheckCircle2, MinusCircle, ShieldCheck, XCircle } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ATTENDANCE_THRESHOLD, formatPercent } from "@/config/finance";
import { cn } from "@/lib/utils";

interface SubjectAttendance {
  subject_id: string;
  subject_name: string;
  attended: number;
  missed: number;
  cancelled: number;
  attendance_pct: number | null;
}

interface AttendanceSummaryProps {
  data: SubjectAttendance[];
}

export function AttendanceSummary({ data }: AttendanceSummaryProps) {
  const totals = data.reduce(
    (current, subject) => ({
      attended: current.attended + subject.attended,
      missed: current.missed + subject.missed,
      cancelled: current.cancelled + subject.cancelled,
    }),
    { attended: 0, missed: 0, cancelled: 0 },
  );

  if (data.length === 0) {
    return (
      <Card>
        <CardBody>
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-black text-slate-900">Asistencia</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                Marca tus primeras clases para ver el porcentaje por materia.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="lg:sticky lg:top-6">
      <CardBody className="space-y-5">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-purple-600" />
            <h3 className="text-sm font-black text-slate-900">
              Tu asistencia
            </h3>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
            El objetivo es mantener al menos {ATTENDANCE_THRESHOLD}% por materia. “No hubo” no penaliza.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-emerald-50 px-2 py-3 text-center">
            <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-600" />
            <p className="mt-1 text-base font-black text-emerald-700">{totals.attended}</p>
            <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-500">Asistí</p>
          </div>
          <div className="rounded-2xl bg-rose-50 px-2 py-3 text-center">
            <XCircle className="mx-auto h-4 w-4 text-rose-500" />
            <p className="mt-1 text-base font-black text-rose-700">{totals.missed}</p>
            <p className="text-[9px] font-bold uppercase tracking-wider text-rose-400">Faltas</p>
          </div>
          <div className="rounded-2xl bg-amber-50 px-2 py-3 text-center">
            <MinusCircle className="mx-auto h-4 w-4 text-amber-500" />
            <p className="mt-1 text-base font-black text-amber-700">{totals.cancelled}</p>
            <p className="text-[9px] font-bold uppercase tracking-wider text-amber-500">No hubo</p>
          </div>
        </div>

        <div className="space-y-4">
          {data.map((subject) => {
            const pct = subject.attendance_pct ?? 0;
            const hasRecords = subject.attendance_pct !== null;
            const ok = hasRecords && pct >= ATTENDANCE_THRESHOLD;

            return (
              <div key={subject.subject_id}>
                <div className="mb-1.5 flex items-start justify-between gap-2">
                  <p className="min-w-0 flex-1 text-[11px] font-bold leading-snug text-slate-700">
                    {subject.subject_name}
                  </p>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black",
                      !hasRecords
                        ? "bg-slate-50 text-slate-300"
                        : ok
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-rose-50 text-rose-500",
                    )}
                  >
                    {formatPercent(subject.attendance_pct)}
                  </span>
                </div>

                <ProgressBar
                  value={pct}
                  tone={!hasRecords || ok ? "emerald" : "rose"}
                  className="h-1.5"
                />

                <p className="mt-1 text-[9px] font-medium text-slate-400">
                  {subject.attended} asistidas · {subject.missed} faltas · {subject.cancelled} no hubo
                </p>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
