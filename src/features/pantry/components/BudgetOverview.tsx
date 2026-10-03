"use client";

import { ShoppingBasket } from "lucide-react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatCurrency, PANTRY_CATEGORIES } from "@/config/finance";
import type { PantryBudget, CategoryExpense } from "@/features/pantry/queries";
import type { PantryCategory } from "@/types/domain";

export function BudgetOverview({
  budget,
  expenses,
  extraTotal,
}: {
  budget: PantryBudget | null;
  expenses: CategoryExpense[];
  extraTotal: number;
}) {
  if (!budget) {
    return <div className="rounded-3xl border border-dashed border-emerald-200 bg-white/70 p-8 text-center text-sm text-slate-400">Sin presupuesto activo.</div>;
  }

  const total = budget.budget;
  const spent = expenses.reduce((sum, item) => sum + item.amount, 0) + extraTotal;
  const remaining = total - spent;
  const pct = total > 0 ? (spent / total) * 100 : 0;
  const expenseMap = new Map<PantryCategory, number>();
  expenses.forEach((item) => expenseMap.set(item.category, item.amount));

  return (
    <section className="rounded-3xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-teal-50 p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-emerald-700">
            <ShoppingBasket className="h-4 w-4" />
            <span className="text-[11px] font-black uppercase tracking-[0.14em]">Control de despensa</span>
          </div>
          <p className="mt-2 text-3xl font-black text-slate-950">{formatCurrency(total)}</p>
          <p className="text-xs text-slate-500">Presupuesto para {budget.weeks} semana{budget.weeks === 1 ? "" : "s"}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:min-w-64">
          <div className="rounded-2xl bg-white/80 p-3">
            <p className="text-[10px] font-bold uppercase text-slate-400">Gastado</p>
            <p className="mt-1 text-lg font-black text-rose-600">{formatCurrency(spent)}</p>
          </div>
          <div className="rounded-2xl bg-white/80 p-3">
            <p className="text-[10px] font-bold uppercase text-slate-400">Restante</p>
            <p className={remaining >= 0 ? "mt-1 text-lg font-black text-emerald-600" : "mt-1 text-lg font-black text-rose-600"}>{formatCurrency(remaining)}</p>
          </div>
        </div>
      </div>

      <ProgressBar value={pct} tone={pct > 90 ? "rose" : pct > 70 ? "amber" : "emerald"} className="mt-5 h-2" />

      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {PANTRY_CATEGORIES.map((category) => (
          <div key={category} className="rounded-2xl border border-emerald-100 bg-white/80 p-3">
            <p className="truncate text-[10px] font-bold text-slate-400">{category}</p>
            <p className="mt-1 font-mono text-sm font-black text-slate-800">{formatCurrency(expenseMap.get(category) ?? 0)}</p>
          </div>
        ))}
      </div>

      {extraTotal > 0 && <p className="mt-3 text-xs text-amber-700">Extras fuera de la lista: <strong>{formatCurrency(extraTotal)}</strong></p>}
    </section>
  );
}
