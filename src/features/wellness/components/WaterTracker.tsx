"use client";

import { useState } from "react";
import confetti from "canvas-confetti";
import { Droplets, RotateCcw } from "lucide-react";
import { WATER_GOAL_CUPS, WATER_CUP_ML } from "@/config/finance";
import { updateWaterCups } from "@/features/wellness/queries";
import { cn } from "@/lib/utils";

export function WaterTracker({ initialCups }: { initialCups: number }) {
  const [cups, setCups] = useState(initialCups);
  const [loading, setLoading] = useState(false);

  const setTarget = async (target: number) => {
    if (loading) return;
    const next = Math.max(0, Math.min(WATER_GOAL_CUPS, target));
    const previous = cups;
    if (next === previous) return;

    setCups(next);
    setLoading(true);
    if (next === WATER_GOAL_CUPS && previous < WATER_GOAL_CUPS) {
      confetti({ particleCount: 55, spread: 60, origin: { y: 0.72 } });
    }

    try {
      const saved = await updateWaterCups(next - previous);
      setCups(saved);
    } catch {
      setCups(previous);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-blue-50 p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-sky-700">
            <Droplets className="h-4 w-4" />
            <span className="text-[11px] font-black uppercase tracking-[0.14em]">Control de agua</span>
          </div>
          <p className="mt-2 text-3xl font-black text-slate-950">
            {cups * WATER_CUP_ML} ml
            <span className="ml-2 text-sm font-bold text-slate-400">/ {WATER_GOAL_CUPS * WATER_CUP_ML} ml</span>
          </p>
        </div>
        <button type="button" onClick={() => setTarget(0)} disabled={loading || cups === 0} className="flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-bold text-sky-600 hover:bg-white disabled:opacity-40">
          <RotateCcw className="h-3.5 w-3.5" /> Reiniciar
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
        {Array.from({ length: WATER_GOAL_CUPS }, (_, index) => {
          const value = index + 1;
          const active = value <= cups;
          return (
            <button
              key={value}
              type="button"
              disabled={loading}
              onClick={() => setTarget(value === cups ? value - 1 : value)}
              className={cn(
                "flex h-20 flex-col items-center justify-end rounded-2xl border p-2 transition-all",
                active
                  ? "border-sky-500 bg-sky-500 text-white shadow-md shadow-sky-500/20"
                  : "border-sky-100 bg-white/80 text-slate-400 hover:border-sky-300",
              )}
            >
              <Droplets className={cn("mb-2 h-5 w-5", active ? "text-white" : "text-sky-200")} />
              <span className="font-mono text-[10px] font-black">{value * WATER_CUP_ML}ml</span>
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-slate-500">
        {cups >= WATER_GOAL_CUPS ? "Meta del día cumplida ✨" : `Te faltan ${WATER_GOAL_CUPS - cups} vasos para tu meta.`}
      </p>
    </section>
  );
}
