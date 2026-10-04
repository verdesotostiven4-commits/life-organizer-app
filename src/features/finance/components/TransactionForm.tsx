"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import type {
  Account,
  Transaction,
  TransactionInput,
} from "@/features/finance/queries";
import {
  INCOME_MAIN_CATEGORIES,
  INCOME_SUB_CATEGORIES,
  SAVINGS_PRESETS,
  formatCurrency,
} from "@/config/finance";
import type { TransactionType, IncomeMainCategory } from "@/types/domain";

interface TransactionFormProps {
  open: boolean;
  accounts: Account[];
  initialTransaction?: Transaction | null;
  onClose: () => void;
  onSave: (input: TransactionInput) => void | Promise<void>;
  loading?: boolean;
}

const TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "ingreso", label: "Ingreso" },
  { value: "gasto", label: "Gasto" },
  { value: "retiro", label: "Retiro / transferencia" },
];

export function TransactionForm({
  open,
  accounts,
  initialTransaction,
  onClose,
  onSave,
  loading,
}: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>(
    initialTransaction?.type ?? "ingreso",
  );
  const [accountId, setAccountId] = useState(
    () => initialTransaction?.account_id ?? accounts[0]?.id ?? "",
  );
  const [toAccountId, setToAccountId] = useState(
    () => initialTransaction?.to_account_id ?? "",
  );
  const [amount, setAmount] = useState(
    () => initialTransaction ? String(initialTransaction.amount) : "",
  );
  const [description, setDescription] = useState(
    () => initialTransaction?.description ?? "",
  );
  const [mainCategory, setMainCategory] = useState(
    () => initialTransaction?.main_category ?? "",
  );
  const [subCategory, setSubCategory] = useState(
    () => initialTransaction?.sub_category ?? "",
  );
  const [savingsPct, setSavingsPct] = useState<number>(
    () => initialTransaction?.savings_pct ?? 0,
  );

  const editing = Boolean(initialTransaction);
  const isIncome = type === "ingreso";
  const isRetiro = type === "retiro";

  const accountOptions = accounts.map((account) => ({
    value: account.id,
    label: account.name,
  }));

  const toAccountOptions = accounts
    .filter((account) => account.id !== accountId)
    .map((account) => ({ value: account.id, label: account.name }));

  const subOptions =
    mainCategory && mainCategory in INCOME_SUB_CATEGORIES
      ? INCOME_SUB_CATEGORIES[
          mainCategory as IncomeMainCategory
        ].map((subcategory) => ({
          value: subcategory,
          label: subcategory,
        }))
      : [];

  const numericAmount = Number.parseFloat(amount) || 0;
  const savingsAmount = (numericAmount * savingsPct) / 100;
  const netAmount = numericAmount - savingsAmount;
  const invalidRetiro = isRetiro && !toAccountId;

  const handleSave = () => {
    if (
      !accountId ||
      numericAmount <= 0 ||
      !description.trim() ||
      invalidRetiro
    ) {
      return;
    }

    void onSave({
      type,
      account_id: accountId,
      amount: numericAmount,
      description: description.trim(),
      to_account_id: isRetiro ? toAccountId : null,
      main_category:
        isIncome && mainCategory
          ? (mainCategory as IncomeMainCategory)
          : null,
      sub_category: isIncome && subCategory ? subCategory : null,
      savings_pct: isIncome ? savingsPct : 0,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Editar movimiento" : "Nuevo movimiento"}
    >
      <div className="space-y-4">
        {editing ? (
          <div className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-[10px] font-semibold leading-relaxed text-amber-800">
            Harmony revertirá el efecto anterior y recalculará los saldos con
            los nuevos datos. No se duplicará el movimiento.
          </div>
        ) : null}

        <div>
          <label className="mb-1.5 block text-xs font-medium text-lila-600">
            Tipo
          </label>
          <Select
            value={type}
            options={TYPE_OPTIONS}
            onChange={(value) => {
              setType(value as TransactionType);
              setToAccountId("");
            }}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-lila-600">
            {isRetiro
              ? "Cuenta origen"
              : isIncome
                ? "¿Dónde entró el dinero?"
                : "¿De dónde salió?"}
          </label>
          <Select
            value={accountId}
            options={accountOptions}
            onChange={(value) => {
              setAccountId(value);
              if (value === toAccountId) setToAccountId("");
            }}
          />
        </div>

        {isRetiro ? (
          <div>
            <label className="mb-1.5 block text-xs font-medium text-lila-600">
              Cuenta destino
            </label>
            <Select
              value={toAccountId}
              options={toAccountOptions}
              onChange={setToAccountId}
              placeholder="Ej. Efectivo en Mano o Bóveda de Ahorros"
            />
            <p className="mt-1.5 text-[10px] text-lila-400">
              Mueve dinero entre cuentas sin cambiar el total del hogar.
            </p>
          </div>
        ) : null}

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
            autoFocus
            className="h-10 w-full rounded-xl border border-lila-200 px-3 text-sm text-lila-900 placeholder:text-lila-300 focus:border-lavanda-400 focus:outline-none focus:ring-2 focus:ring-lavanda-400"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-lila-600">
            {isIncome ? "Concepto del ingreso" : "Descripción"}
          </label>
          <input
            type="text"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder={
              isIncome
                ? "Ej. Video de boda Riobamba · Luis"
                : "¿De qué se trata?"
            }
            className="h-10 w-full rounded-xl border border-lila-200 px-3 text-sm text-lila-900 placeholder:text-lila-300 focus:border-lavanda-400 focus:outline-none focus:ring-2 focus:ring-lavanda-400"
          />
        </div>

        {isIncome ? (
          <>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-lila-600">
                Categoría de ingreso
              </label>
              <Select
                value={mainCategory}
                options={INCOME_MAIN_CATEGORIES.map((category) => ({
                  value: category,
                  label: category,
                }))}
                onChange={(value) => {
                  setMainCategory(value);
                  setSubCategory("");
                }}
                placeholder="Selecciona categoría…"
              />
            </div>

            {subOptions.length > 0 ? (
              <div>
                <label className="mb-1.5 block text-xs font-medium text-lila-600">
                  Detalle
                </label>
                <Select
                  value={subCategory}
                  options={subOptions}
                  onChange={setSubCategory}
                  placeholder="Selecciona…"
                />
              </div>
            ) : null}

            <div>
              <label className="mb-1.5 block text-xs font-medium text-lila-600">
                Separar a ahorro ({savingsPct}%)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {SAVINGS_PRESETS.map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setSavingsPct(pct)}
                    className={
                      savingsPct === pct
                        ? "rounded-lg bg-amber-500 px-2.5 py-1 text-xs font-medium text-white"
                        : "rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100"
                    }
                  >
                    {pct}%
                  </button>
                ))}
              </div>

              {numericAmount > 0 ? (
                <div className="mt-2 rounded-xl bg-amber-50/70 px-3 py-2 text-[10px] text-amber-800">
                  En ahorros: <strong>{formatCurrency(savingsAmount)}</strong>
                  {" · "}
                  Disponible: <strong>{formatCurrency(netAmount)}</strong>
                </div>
              ) : null}
            </div>
          </>
        ) : null}

        <div className="flex gap-2 pt-2">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            className="flex-1"
            onClick={handleSave}
            disabled={
              !accountId ||
              numericAmount <= 0 ||
              !description.trim() ||
              invalidRetiro ||
              loading
            }
          >
            {loading
              ? "Guardando…"
              : editing
                ? "Guardar cambios"
                : "Registrar"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
