import { CheckCircle2, Clock3, CreditCard, Layers3 } from "lucide-react";
import { DOW_SHORT, ESPOCH_SCHEDULE } from "@/config/espoch";

const DAYS = [1, 2, 3, 4, 5] as const;
const TIMES = Array.from(new Set(ESPOCH_SCHEDULE.map((item) => `${item.start_time}–${item.end_time}`))).sort();

export function TemplatesView() {
  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-purple-100 bg-white/90 p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-100 text-purple-700">
            <Layers3 className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-sm font-black text-slate-900">Horario universitario</h2>
            <p className="text-xs text-slate-400">Plantilla basada en el horario oficial ESPOCH.</p>
          </div>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full min-w-[760px] border-collapse text-xs">
            <thead>
              <tr className="bg-purple-50 text-purple-900">
                <th className="border-b border-r border-purple-100 p-3 text-left">Hora</th>
                {DAYS.map((day) => <th key={day} className="border-b border-r border-purple-100 p-3 text-left last:border-r-0">{DOW_SHORT[day]}</th>)}
              </tr>
            </thead>
            <tbody>
              {TIMES.map((time) => (
                <tr key={time} className="hover:bg-slate-50">
                  <td className="border-b border-r border-slate-100 bg-slate-50 p-3 font-mono font-bold text-slate-700">{time}</td>
                  {DAYS.map((day) => {
                    const item = ESPOCH_SCHEDULE.find((session) => session.day_of_week === day && `${session.start_time}–${session.end_time}` === time);
                    return (
                      <td key={day} className="border-b border-r border-slate-100 p-3 align-top last:border-r-0">
                        {item ? (
                          <>
                            <p className="font-bold text-slate-800">{item.subject_name}</p>
                            <p className="mt-1 text-[10px] text-slate-400">{item.room}</p>
                          </>
                        ) : <span className="text-slate-300">—</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
