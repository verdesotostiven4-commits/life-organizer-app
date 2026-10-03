"use client";

import { useState } from "react";
import { Check, PencilLine, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { PANTRY_CATEGORIES, formatCurrency } from "@/config/finance";
import {
  savePantryBudget,
  setCategoryExpense,
  type CategoryExpense,
  type PantryBudget,
} from "@/features/pantry/queries";
import type { PantryCategory } from "@/types/domain";

export function PantryBudgetControls({
  budget,
  expenses,
  onBudgetChange,
  onExpensesChange,
}: {
  budget: PantryBudget | null;
  expenses: CategoryExpense[];
  onBudgetChange: (budget: PantryBudget) => void;
  onExpensesChange: (expenses: CategoryExpense[]) => void;
}) {
  const [budgetValue, setBudgetValue] = useState(() => String(budget?.budget ?? 50));
  const [weeks, setWeeks] = useState(() => budget?.weeks ?? 3);
  const [savingBudget, setSavingBudget] = useState(false);
  const [savingCategory, setSavingCategory] = useState<PantryCategory | null>(null);
  const [message, setMessage] = useState("");

  const initialCategoryValues = Object.fromEntries(
    PANTRY_CATEGORIES.map((category) => [
      category,
      String(expenses.find((expense) => expense.category === category)?.amount ?? 0),
    ]),
  ) as Record<PantryCategory, string>;

  const [categoryValues, setCategoryValues] = useState<Record<PantryCategory, string>>(
    initialCategoryValues,
  );

  const handleSaveBudget = async () => {
    const value = Number.parseFloat(budgetValue);
    if (!Number.isFinite(value) || value < 0) return;
    setSavingBudget(true);
    setMessage("");
    try {
      const saved = await savePantryBudget({ budget: value, weeks });
      onBudgetChange(saved);
      setMessage("Presupuesto actualizado.");
    } catch (error) {
      console.error("Error al guardar presupuesto:", error);
      setMessage("No se pudo guardar el presupuesto.");
    } finally {
      setSavingBudget(false);
    }
  };

  const handleSaveCategory = async (category: PantryCategory) => {
    const value = Number.parseFloat(categoryValues[category]);
    if (!Number.isFinite(value) || value < 0) return;
    setSavingCategory(category);
    setMessage("");
    try {
      const saved = await setCategoryExpense(category, value);
      const next = expenses.some((expense) => expense.category === category)
        ? expenses.map((expense) => (expense.category === category ? saved : expense))
        : [...expenses, saved];
      onExpensesChange(next);
      setMessage(`${category}: ${formatCurrency(value)} guardado.`);
    } catch (error) {
      console.error("Error al guardar gasto por categoría:", error);
      setMessage("No se pudo guardar ese gasto.");
    } finally {
      setSavingCategory(null);
    }
  };

  return (
    <Card>
      <CardBody className="space-y-5">
        <div>
          <div className="flex items-center gap-2 text-emerald-700">
            <WalletCards className="h-4 w-4" />
            <h3 className="text-sm font-black text-slate-900">Tu presupuesto, a tu manera</h3>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">
            Tú decides el total y cuántas semanas debe rendir. Harmony OS no reparte ese dinero por categorías.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_180px_auto] sm:items-end">
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-bold text-slate-500">Presupuesto total (USD)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={budgetValue}
              onChange={(event) => setBudgetValue(event.target.value)}
              className="h-11 w-full rounded-xl border border-emerald-100 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[11px] font-bold text-slate-500">Debe rendir</span>
            <select
              value={weeks}
              onChange={(event) => setWeeks(Number(event.target.value))}
              className="h-11 w-full rounded-xl border border-emerald-100 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
            >
              {[1, 2, 3, 4].map((value) => (
                <option key={value} value={value}>{value} semana{value === 1 ? "" : "s"}</option>
              ))}
            </select>
          </label>

          <Button onClick={handleSaveBudget} disabled={savingBudget}>
            <PencilLine className="h-4 w-4" />
            {savingBudget ? "Guardando…" : "Guardar"}
          </Button>
        </div>

        <div className="border-t border-slate-100 pt-5">
          <div className="mb-3">
            <h4 className="text-sm font-black text-slate-900">Gasto real por categoría</h4>
            <p className="mt-1 text-xs text-slate-400">
              Escribe el total que realmente gastaste en cada grupo. Puedes corregirlo cuando quieras.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {PANTRY_CATEGORIES.map((category) => (
              <div key={category} className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-3">
                <label className="text-[10px] font-black uppercase tracking-wide text-emerald-700">
                  {category}
                </label>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={categoryValues[category]}
                    onChange={(event) =>
                      setCategoryValues((current) => ({
                        ...current,
                        [category]: event.target.value,
                      }))
                    }
                    className="h-9 min-w-0 flex-1 rounded-xl border border-emerald-100 bg-white px-2 text-sm font-bold text-slate-800 outline-none focus:border-emerald-300"
                    aria-label={`Gasto en ${category}`}
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveCategory(category)}
                    disabled={savingCategory === category}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white transition hover:bg-emerald-700 disabled:opacity-50"
                    aria-label={`Guardar gasto de ${category}`}
                  >
                    <Check className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {message ? <p className="text-xs font-semibold text-emerald-700">{message}</p> : null}
      </CardBody>
    </Card>
  );
}
