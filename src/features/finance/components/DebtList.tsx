"use client";

import {
  CheckCircle2,
  Circle,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import type { Debt } from "@/features/finance/queries";
import {
  createDebt,
  deleteDebt,
  toggleDebtStatus,
  updateDebt,
} from "@/features/finance/queries";
import { formatCurrency } from "@/config/finance";
import { cn } from "@/lib/utils";
import type { DebtDirection } from "@/types/domain";

interface DebtListProps {
  initialDebts: Debt[];
  onChange?: (debts: Debt[]) => void;
}

const DIRECTION_OPTIONS = [
  { value: "debo", label: "Yo debo" },
  { value: "me_deben", label: "Me deben" },
];

export function DebtList({ initialDebts, onChange }: DebtListProps) {
  const [debts, setDebts] = useState(initialDebts);
  const [open, setOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [person, setPerson] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [direction, setDirection] = useState<DebtDirection>("debo");
  const [loading, setLoading] = useState(false);

  const updateDebts = (updater: (current: Debt[]) => Debt[]) => {
    setDebts((current) => {
      const next = updater(current);
      onChange?.(next);
      return next;
    });
  };

  const pendientes = debts.filter((debt) => debt.status === "pendiente");
  const settled = debts.filter((debt) => debt.status === "pagado");

  const resetForm = () => {
    setEditingDebt(null);
    setPerson("");
    setAmount("");
    setReason("");
    setDirection("debo");
  };

  const openNew = () => {
    resetForm();
    setOpen(true);
  };

  const openEdit = (debt: Debt) => {
    setEditingDebt(debt);
    setPerson(debt.person);
    setAmount(String(debt.amount));
    setReason(debt.reason);
    setDirection(debt.direction);
    setOpen(true);
  };

  const closeModal = () => {
    if (loading) return;
    setOpen(false);
    resetForm();
  };

  const handleSave = async () => {
    const num = Number.parseFloat(amount);
    if (!person.trim() || !Number.isFinite(num) || num <= 0) return;

    if (editingDebt) {
      const previous = editingDebt;
      const nextDebt: Debt = {
        ...editingDebt,
        person: person.trim(),
        amount: num,
        reason: reason.trim(),
        direction,
      };

      updateDebts((current) =>
        current.map((debt) => (debt.id === editingDebt.id ? nextDebt : debt)),
      );
      setOpen(false);
      resetForm();
      setLoading(true);

      try {
        await updateDebt(previous.id, {
          person: nextDebt.person,
          amount: nextDebt.amount,
          reason: nextDebt.reason,
          direction: nextDebt.direction,
        });
      } catch (error) {
        console.error("Error al editar deuda:", error);
        updateDebts((current) =>
          current.map((debt) => (debt.id === previous.id ? previous : debt)),
        );
      } finally {
        setLoading(false);
      }
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const optimisticDebt: Debt = {
      id: tempId,
      person: person.trim(),
      amount: num,
      reason: reason.trim(),
      direction,
      status: "pendiente",
      settled_at: null,
      created_at: new Date().toISOString(),
    };

    updateDebts((current) => [optimisticDebt, ...current]);
    setOpen(false);
    resetForm();
    setLoading(true);

    try {
      const realId = await createDebt({
        person: optimisticDebt.person,
        amount: optimisticDebt.amount,
        reason: optimisticDebt.reason,
        direction: optimisticDebt.direction,
      });
      updateDebts((current) =>
        current.map((debt) =>
          debt.id === tempId ? { ...debt, id: realId } : debt,
        ),
      );
    } catch (error) {
      console.error("Error al crear deuda:", error);
      updateDebts((current) => current.filter((debt) => debt.id !== tempId));
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: string, current: "pendiente" | "pagado") => {
    const newStatus = current === "pendiente" ? "pagado" : "pendiente";
    const previous = debts.find((debt) => debt.id === id);

    updateDebts((items) =>
      items.map((debt) =>
        debt.id === id
          ? {
              ...debt,
              status: newStatus,
              settled_at:
                newStatus === "pagado" ? new Date().toISOString() : null,
            }
          : debt,
      ),
    );

    try {
      await toggleDebtStatus(id, newStatus);
    } catch {
      if (previous) {
        updateDebts((items) =>
          items.map((debt) => (debt.id === id ? previous : debt)),
        );
      }
    }
  };

  const handleDelete = async (id: string) => {
    const backup = debts.find((debt) => debt.id === id);
    updateDebts((current) => current.filter((debt) => debt.id !== id));

    try {
      await deleteDebt(id);
    } catch {
      if (backup) updateDebts((current) => [backup, ...current]);
    }
  };

  const renderDebt = (debt: Debt) => (
    <div
      key={debt.id}
      className={cn(
        "flex items-center gap-3 rounded-lg px-1 py-2 transition-colors",
        debt.status === "pagado" && "opacity-50",
      )}
    >
      <button
        type="button"
        onClick={() => handleToggle(debt.id, debt.status)}
        className="shrink-0"
        title={debt.status === "pagado" ? "Marcar pendiente" : "Marcar pagado"}
      >
        {debt.status === "pagado" ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        ) : (
          <Circle className="h-5 w-5 text-lila-300 hover:text-lavanda-400" />
        )}
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate text-sm font-medium",
            debt.status === "pagado"
              ? "text-lila-400 line-through"
              : "text-lila-900",
          )}
        >
          {debt.person}
        </p>
        {debt.reason ? (
          <p className="truncate text-[10px] text-lila-400">{debt.reason}</p>
        ) : null}
        <span
          className={cn(
            "text-[10px] font-medium",
            debt.direction === "debo" ? "text-rose-500" : "text-emerald-600",
          )}
        >
          {debt.direction === "debo" ? "Yo debo" : "Me deben"}
        </span>
      </div>

      <p
        className={cn(
          "shrink-0 text-sm font-bold",
          debt.direction === "debo" ? "text-rose-500" : "text-emerald-600",
        )}
      >
        {formatCurrency(debt.amount)}
      </p>

      <button
        type="button"
        onClick={() => openEdit(debt)}
        className="shrink-0 rounded-lg p-1.5 text-lila-300 transition-colors hover:bg-lila-50 hover:text-lila-600"
        aria-label={`Editar deuda con ${debt.person}`}
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={() => handleDelete(debt.id)}
        className="shrink-0 rounded-lg p-1.5 text-lila-300 transition-colors hover:bg-rose-50 hover:text-rose-500"
        aria-label={`Eliminar deuda con ${debt.person}`}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-lila-900">Deudas</h3>
        <Button size="sm" variant="secondary" onClick={openNew}>
          <Plus className="h-4 w-4" />
          Nueva
        </Button>
      </div>

      {debts.length === 0 ? (
        <p className="py-4 text-center text-xs text-lila-400">
          Sin deudas registradas.
        </p>
      ) : (
        <>
          {pendientes.length > 0 ? (
            <div className="space-y-0.5">
              <p className="mb-1 text-[10px] uppercase tracking-wide text-lila-400">
                Pendientes
              </p>
              {pendientes.map(renderDebt)}
            </div>
          ) : null}

          {settled.length > 0 ? (
            <div className="space-y-0.5">
              <p className="mb-1 text-[10px] uppercase tracking-wide text-lila-400">
                Saldadas
              </p>
              {settled.map(renderDebt)}
            </div>
          ) : null}
        </>
      )}

      <Modal
        open={open}
        onClose={closeModal}
        title={editingDebt ? "Editar deuda" : "Nueva deuda"}
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-lila-600">
              Persona
            </label>
            <input
              type="text"
              value={person}
              onChange={(event) => setPerson(event.target.value)}
              placeholder="¿Con quién?"
              autoFocus
              maxLength={120}
              className="h-10 w-full rounded-xl border border-lila-200 px-3 text-sm text-lila-900 placeholder:text-lila-300 focus:border-lavanda-400 focus:outline-none focus:ring-2 focus:ring-lavanda-400"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-lila-600">
              Dirección
            </label>
            <Select
              value={direction}
              options={DIRECTION_OPTIONS}
              onChange={(value) => setDirection(value as DebtDirection)}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-lila-600">
              Monto (USD)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0.00"
              className="h-10 w-full rounded-xl border border-lila-200 px-3 text-sm text-lila-900 placeholder:text-lila-300 focus:border-lavanda-400 focus:outline-none focus:ring-2 focus:ring-lavanda-400"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-lila-600">
              Motivo (opcional)
            </label>
            <input
              type="text"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="¿Por qué?"
              maxLength={240}
              className="h-10 w-full rounded-xl border border-lila-200 px-3 text-sm text-lila-900 placeholder:text-lila-300 focus:border-lavanda-400 focus:outline-none focus:ring-2 focus:ring-lavanda-400"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={closeModal}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1"
              onClick={handleSave}
              disabled={
                !person.trim() ||
                !Number.isFinite(Number.parseFloat(amount)) ||
                Number.parseFloat(amount) <= 0 ||
                loading
              }
            >
              {loading
                ? "Guardando…"
                : editingDebt
                  ? "Guardar cambios"
                  : "Crear"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
