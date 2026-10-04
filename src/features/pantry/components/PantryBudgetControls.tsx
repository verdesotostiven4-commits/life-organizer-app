"use client";

import { useMemo, useState } from "react";
import { Check, PencilLine, Plus, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { PANTRY_CATEGORIES, formatCurrency } from "@/config/finance";
import {
  savePantryBudget,
  setCategoryExpense,
  type CategoryExpense,
  type PantryBudget,
} from "@/features/pantry/queries";

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
  const [savingCategory, setSavingCategory] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [customAmount, setCustomAmount] = useState("");

  const initialCategoryValues = Object.fromEntries([
    ...PANTRY_CATEGORIES.map((category) => [
      category,
      String(expenses.find((expense) => expense.category === category)?.amount ?? 0),
    ]),
    ...expenses
      .filter((expense) => !PANTRY_CATEGORIES.includes(expense.category as (typeof PANTRY_CATEGORIES)[number]))
      .map((expense) => [expense.category, String(expense.amount)]),
  ]) as Record<string, string>;

  const [categoryValues, setCategoryValues] = useState<Record<string, string>>(
    initialCategoryValues,
  );

  const customExpenses = useMemo(
    () =>
      expenses.filter(
        (expense) =>
          !PANTRY_CATEGORIES.includes(
            expense.category as (typeof PANTRY_CATEGORIES)[number],
          ),
      ),
    [expenses],
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

  const saveCategory = async (category: string, rawValue: string) => {
    const cleanCategory = category.trim().slice(0, 40);
    const value = Number.parseFloat(rawValue);

    if (!cleanCategory || !Number.isFinite(value) || value < 0) return false;

    setSavingCategory(cleanCategory);
    setMessage("");

    try {
      const saved = await setCategoryExpense(cleanCategory, value);
      const next = expenses.some((expense) => expense.category === cleanCategory)
        ? expenses.map((expense) =>
            expense.category === cleanCategory ? saved : expense,
          )
        : [...expenses, saved];

      onExpensesChange(next);
      setCategoryValues((current) => ({
        ...current,
        [cleanCategory]: String(value),
      }));
      setMessage(`${cleanCategory}: ${formatCurrency(value)} guardado.`);
      return true;
    } catch (error) {
      console.error("Error al guardar gasto por categoría:", error);
      setMessage("No se pudo guardar ese gasto.");
      return false;
    } finally {
      setSavingCategory(null);
    }
  };

  const handleSaveCategory = async (category: string) => {
    await saveCategory(category, categoryValues[category] ?? "0");
  };

  const handleSaveCustomCategory = async () => {
    const cleanCategory = customCategory.trim();
    const saved = await saveCategory(cleanCategory, customAmount);
    if (saved) {
      setCustomCategory("");
      setCustomAmount("");
    }
  };

  const renderCategoryCard = (category: string) => (
    <div
      key={category}
      className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-3"
    >
      <label className="block truncate text-[10px] font-black uppercase tracking-wide text-emerald-700">
        {category}
      </label>
      <div className="mt-2 flex items-center gap-2">
        <input
          type="number"
          min="0"
          step="0.01"
          value={categoryValues[category] ?? "0"}
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
  );

  return (
    <Card>
      <CardBody className="space-y-5">
        <div>
          <div className="flex items-center gap-2 text-emerald-700">
            <WalletCards className="h-4 w-4" />
            <h3 className="text-sm font-black text-slate-900">
              Tu presupuesto, a tu manera
            </h3>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">
            Tú decides el total y cuántas semanas debe rendir. Harmony OS no reparte ese dinero por categorías.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_180px_auto] sm:items-end">
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-bold text-slate-500">
              Presupuesto total (USD)
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={budgetValue}
              onChange={(event) => setBudgetValue(event.target.value)}
              className="h-11 w-full rounded-xl border border-emerald-100 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
            />
          </label>

          <div>
            <span className="mb-1.5 block text-[11px] font-bold text-slate-500">
              Debe rendir
            </span>
            <Select
              value={String(weeks)}
              options={[1, 2, 3, 4].map((value) => ({
                value: String(value),
                label: `${value} semana${value === 1 ? "" : "s"}`,
              }))}
              onChange={(value) => setWeeks(Number(value))}
            />
          </div>

          <Button onClick={handleSaveBudget} disabled={savingBudget}>
            <PencilLine className="h-4 w-4" />
            {savingBudget ? "Guardando…" : "Guardar"}
          </Button>
        </div>

        <div className="border-t border-slate-100 pt-5">
          <div className="mb-3">
            <h4 className="text-sm font-black text-slate-900">
              Gasto real por categoría
            </h4>
            <p className="mt-1 text-xs text-slate-400">
              Escribe el total que realmente gastaste en cada grupo. También puedes crear una categoría propia.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {PANTRY_CATEGORIES.map(renderCategoryCard)}
          </div>

          {customExpenses.length > 0 ? (
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {customExpenses.map((expense) => renderCategoryCard(expense.category))}
            </div>
          ) : null}

          <div className="mt-4 rounded-2xl border border-dashed border-purple-200 bg-purple-50/40 p-3">
            <div className="mb-2">
              <p className="text-xs font-black text-purple-800">Otra categoría</p>
              <p className="text-[10px] text-purple-500">
                Ej. Mascotas, papelería, hogar o cualquier grupo que necesites.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_140px_auto]">
              <input
                type="text"
                value={customCategory}
                onChange={(event) => setCustomCategory(event.target.value.slice(0, 40))}
                placeholder="Nombre de categoría"
                maxLength={40}
                className="h-10 rounded-xl border border-purple-100 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100"
              />
              <input
                type="number"
                min="0"
                step="0.01"
                value={customAmount}
                onChange={(event) => setCustomAmount(event.target.value)}
                placeholder="0.00"
                className="h-10 rounded-xl border border-purple-100 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100"
              />
              <Button
                onClick={handleSaveCustomCategory}
                disabled={
                  !customCategory.trim() ||
                  !Number.isFinite(Number.parseFloat(customAmount)) ||
                  Number.parseFloat(customAmount) < 0 ||
                  savingCategory !== null
                }
              >
                <Plus className="h-4 w-4" />
                Agregar
              </Button>
            </div>
          </div>
        </div>

        {message ? (
          <p className="text-xs font-semibold text-emerald-700">{message}</p>
        ) : null}
      </CardBody>
    </Card>
  );
}
