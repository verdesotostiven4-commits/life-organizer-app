"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import type { ExtraExpense } from "@/features/pantry/queries";
import {
  addExtraExpense,
  deleteExtraExpense,
} from "@/features/pantry/queries";
import { formatCurrency } from "@/config/finance";
import { formatShort, toISODate } from "@/lib/dates";

interface ExtraExpensesProps {
  initialExpenses: ExtraExpense[];
  onChange?: (expenses: ExtraExpense[]) => void;
}

export function ExtraExpenses({ initialExpenses, onChange }: ExtraExpensesProps) {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [name, setName] = useState("");
  const [cost, setCost] = useState("");

  const updateExpenses = (updater: (current: ExtraExpense[]) => ExtraExpense[]) => {
    setExpenses((current) => {
      const next = updater(current);
      onChange?.(next);
      return next;
    });
  };

  const handleAdd = async () => {
    const num = parseFloat(cost);
    if (!name.trim() || num <= 0) return;

    const tempId = `temp-${Date.now()}`;
    const optimistic: ExtraExpense = {
      id: tempId,
      name: name.trim(),
      cost: num,
      expense_date: toISODate(),
      created_at: new Date().toISOString(),
    };

    updateExpenses((current) => [optimistic, ...current]);
    setName("");
    setCost("");

    try {
      await addExtraExpense({ name: optimistic.name, cost: num });
    } catch (err) {
      console.error("Error al registrar gasto extra:", err);
      updateExpenses((current) => current.filter((expense) => expense.id !== tempId));
    }
  };

  const handleDelete = async (id: string) => {
    const backup = expenses.find((expense) => expense.id === id);
    updateExpenses((current) => current.filter((expense) => expense.id !== id));
    try {
      await deleteExtraExpense(id);
    } catch (err) {
      console.error("Error al borrar gasto extra:", err);
      if (backup) {
        updateExpenses((current) =>
          [...current, backup].sort((a, b) => b.expense_date.localeCompare(a.expense_date)),
        );
      }
    }
  };

  const total = expenses.reduce((sum, expense) => sum + expense.cost, 0);

  return (
    <Card>
      <CardBody>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-lila-900">Gastos extra</h3>
            <p className="mt-0.5 text-[10px] text-lila-400">Compras fuera de tu lista principal.</p>
          </div>
          {total > 0 ? (
            <span className="text-xs font-bold text-rose-500">{formatCurrency(total)}</span>
          ) : null}
        </div>

        <div className="mb-3 flex items-center gap-2">
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ej. queso donde el vecino"
            onKeyDown={(event) => event.key === "Enter" && handleAdd()}
            className="h-10 flex-1 rounded-xl border border-lila-200 px-3 text-sm text-lila-900 placeholder:text-lila-300 focus:border-lavanda-400 focus:outline-none focus:ring-2 focus:ring-lavanda-400"
          />
          <input
            type="number"
            step="0.01"
            min="0"
            value={cost}
            onChange={(event) => setCost(event.target.value)}
            placeholder="0.00"
            className="h-10 w-24 rounded-xl border border-lila-200 px-2 text-sm text-lila-900 placeholder:text-lila-300 focus:border-lavanda-400 focus:outline-none focus:ring-2 focus:ring-lavanda-400"
          />
          <Button size="icon" onClick={handleAdd} disabled={!name.trim() || !parseFloat(cost)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {expenses.length === 0 ? (
          <p className="py-4 text-center text-sm text-lila-400">Sin gastos extra registrados.</p>
        ) : (
          <div className="space-y-1">
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center gap-2 rounded-lg px-1 py-1.5 transition-colors hover:bg-lila-50/50"
              >
                <span className="flex-1 truncate text-sm text-lila-900">{expense.name}</span>
                <span className="text-[10px] text-lila-400">{formatShort(expense.expense_date)}</span>
                <span className="text-sm font-medium text-rose-500">{formatCurrency(expense.cost)}</span>
                <button
                  type="button"
                  onClick={() => handleDelete(expense.id)}
                  className="rounded p-1 text-lila-300 transition-colors hover:bg-rose-50 hover:text-rose-500"
                  aria-label={`Eliminar ${expense.name}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
