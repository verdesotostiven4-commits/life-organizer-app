"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Camera,
  Code2,
  Gift,
  PiggyBank,
  Plus,
  Wallet,
} from "lucide-react";
import type {
  Account,
  Debt,
  Transaction,
  TransactionInput,
} from "@/features/finance/queries";
import {
  deleteTransaction,
  getFinanceState,
  recordTransaction,
  updateTransaction,
} from "@/features/finance/queries";
import { AccountCard } from "./components/AccountCard";
import { TransactionForm } from "./components/TransactionForm";
import { TransactionList } from "./components/TransactionList";
import { DebtList } from "./components/DebtList";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { formatCurrency } from "@/config/finance";
import type { IncomeMainCategory } from "@/types/domain";

interface FinanceViewProps {
  accounts: Account[];
  transactions: Transaction[];
  debts: Debt[];
  summary: {
    totalBalance: number;
    totalSavings: number;
    debtsOwed: number;
    debtsOwedToMe: number;
  };
}

const incomeIcon = (category: IncomeMainCategory | null) => {
  if (category === "Fotografía & Video") return Camera;
  if (category === "Sistemas / Programación") return Code2;
  return Gift;
};

const dateFormatter = new Intl.DateTimeFormat("es-EC", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function FinanceView({
  accounts: initialAccounts,
  transactions: initialTransactions,
  debts,
  summary: initialSummary,
}: FinanceViewProps) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [summary, setSummary] = useState(initialSummary);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDebtsChange = (nextDebts: Debt[]) => {
    const pending = nextDebts.filter((debt) => debt.status === "pendiente");
    setSummary((current) => ({
      ...current,
      debtsOwed: pending
        .filter((debt) => debt.direction === "debo")
        .reduce((sum, debt) => sum + debt.amount, 0),
      debtsOwedToMe: pending
        .filter((debt) => debt.direction === "me_deben")
        .reduce((sum, debt) => sum + debt.amount, 0),
    }));
  };

  const incomes = useMemo(
    () => transactions.filter((transaction) => transaction.type === "ingreso"),
    [transactions],
  );

  const incomeTotal = useMemo(
    () => incomes.reduce((sum, transaction) => sum + transaction.amount, 0),
    [incomes],
  );

  const applyAccounts = (nextAccounts: Account[]) => {
    setAccounts(nextAccounts);
    setSummary((current) => ({
      ...current,
      totalBalance: nextAccounts
        .filter((account) => account.kind !== "ahorros")
        .reduce((sum, account) => sum + account.balance, 0),
      totalSavings: nextAccounts
        .filter((account) => account.kind === "ahorros")
        .reduce((sum, account) => sum + account.balance, 0),
    }));
  };

  const refreshFinanceState = async () => {
    const next = await getFinanceState();
    applyAccounts(next.accounts);
    setTransactions(next.transactions);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingTransaction(null);
  };

  const handleCreate = async (input: TransactionInput) => {
    const prevAccounts = accounts;
    const prevSummary = summary;
    const prevTransactions = transactions;

    const account = accounts.find((item) => item.id === input.account_id);
    const toAccount = input.to_account_id
      ? accounts.find((item) => item.id === input.to_account_id)
      : null;
    const savingsPct = input.savings_pct ?? 0;
    const savingsAmount =
      input.type === "ingreso" ? (input.amount * savingsPct) / 100 : 0;
    const netAmount =
      input.type === "ingreso" ? input.amount - savingsAmount : input.amount;

    const tempId = `temp-${Date.now()}`;
    const optimisticTx: Transaction = {
      id: tempId,
      type: input.type,
      account_id: input.account_id,
      account_name: account?.name ?? "—",
      to_account_id: input.to_account_id ?? null,
      to_account_name: toAccount?.name ?? null,
      amount: input.amount,
      main_category: input.main_category ?? null,
      sub_category: input.sub_category ?? null,
      description: input.description,
      savings_pct: savingsPct,
      savings_amount: savingsAmount,
      net_amount: netAmount,
      created_at: new Date().toISOString(),
    };

    const nextAccounts = accounts.map((item) => {
      let balance = item.balance;

      if (input.type === "ingreso") {
        if (item.id === input.account_id) balance += netAmount;
        if (item.kind === "ahorros" && savingsAmount > 0) {
          balance += savingsAmount;
        }
      } else if (
        input.type === "gasto" &&
        item.id === input.account_id
      ) {
        balance -= input.amount;
      } else if (input.type === "retiro") {
        if (item.id === input.account_id) balance -= input.amount;
        if (input.to_account_id && item.id === input.to_account_id) {
          balance += input.amount;
        }
      }

      return { ...item, balance };
    });

    setTransactions((current) => [optimisticTx, ...current]);
    applyAccounts(nextAccounts);
    closeForm();

    try {
      const realId = await recordTransaction(input);
      setTransactions((current) =>
        current.map((transaction) =>
          transaction.id === tempId
            ? { ...transaction, id: realId }
            : transaction,
        ),
      );
    } catch (error) {
      console.error("Error al registrar transacción:", error);
      setTransactions(prevTransactions);
      setAccounts(prevAccounts);
      setSummary(prevSummary);
    }
  };

  const handleSave = async (input: TransactionInput) => {
    if (!editingTransaction) {
      await handleCreate(input);
      return;
    }

    setSaving(true);
    try {
      await updateTransaction(editingTransaction.id, input);
      await refreshFinanceState();
      closeForm();
    } catch (error) {
      console.error("Error al editar movimiento:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormOpen(true);
  };

  const handleDelete = async (transaction: Transaction) => {
    const confirmed = window.confirm(
      `¿Eliminar "${transaction.description}"? Harmony revertirá su efecto en los saldos.`,
    );
    if (!confirmed) return;

    setDeletingId(transaction.id);
    try {
      await deleteTransaction(transaction.id);
      await refreshFinanceState();
    } catch (error) {
      console.error("Error al eliminar movimiento:", error);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50 p-5">
          <Wallet className="h-5 w-5 text-emerald-600" />
          <p className="mt-3 text-[10px] font-black uppercase tracking-wider text-emerald-600">
            Disponible
          </p>
          <p className="mt-1 text-2xl font-black text-slate-950">
            {formatCurrency(summary.totalBalance)}
          </p>
        </div>
        <div className="rounded-3xl border border-amber-100 bg-gradient-to-br from-white to-amber-50 p-5">
          <PiggyBank className="h-5 w-5 text-amber-600" />
          <p className="mt-3 text-[10px] font-black uppercase tracking-wider text-amber-600">
            Bóveda
          </p>
          <p className="mt-1 text-2xl font-black text-slate-950">
            {formatCurrency(summary.totalSavings)}
          </p>
        </div>
        <div className="rounded-3xl border border-rose-100 bg-gradient-to-br from-white to-rose-50 p-5">
          <ArrowUpRight className="h-5 w-5 text-rose-500" />
          <p className="mt-3 text-[10px] font-black uppercase tracking-wider text-rose-500">
            Debo
          </p>
          <p className="mt-1 text-2xl font-black text-slate-950">
            {formatCurrency(summary.debtsOwed)}
          </p>
        </div>
        <div className="rounded-3xl border border-sky-100 bg-gradient-to-br from-white to-sky-50 p-5">
          <ArrowDownRight className="h-5 w-5 text-sky-600" />
          <p className="mt-3 text-[10px] font-black uppercase tracking-wider text-sky-600">
            Me deben
          </p>
          <p className="mt-1 text-2xl font-black text-slate-950">
            {formatCurrency(summary.debtsOwedToMe)}
          </p>
        </div>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black text-slate-900">
              Cuentas del hogar
            </h2>
            <p className="text-xs text-slate-400">
              Los dos ven los mismos saldos y movimientos.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => {
              setEditingTransaction(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> Movimiento
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {accounts.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>
      </section>

      <Card className="overflow-hidden border-emerald-100">
        <CardBody>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-600">
                Registro permanente
              </p>
              <h3 className="mt-1 text-base font-black text-slate-950">
                Ingresos recibidos
              </h3>
              <p className="text-xs text-slate-400">
                Cada trabajo queda guardado con cuenta, categoría, ahorro y fecha.
              </p>
            </div>
            <div className="rounded-2xl bg-emerald-50 px-4 py-2 text-right">
              <p className="text-[10px] font-bold uppercase text-emerald-600">
                Total visible
              </p>
              <p className="text-lg font-black text-emerald-700">
                {formatCurrency(incomeTotal)}
              </p>
            </div>
          </div>

          {incomes.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-emerald-100 py-7 text-center text-sm text-slate-400">
              Aún no hay ingresos registrados.
            </p>
          ) : (
            <div className="grid gap-2 lg:grid-cols-2">
              {incomes.slice(0, 10).map((income) => {
                const Icon = incomeIcon(income.main_category);
                return (
                  <button
                    key={income.id}
                    type="button"
                    onClick={() => handleEdit(income)}
                    className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/30 p-3 text-left transition-colors hover:bg-emerald-50"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-black text-slate-900">
                        {income.description}
                      </p>
                      <p className="mt-0.5 truncate text-[10px] text-slate-400">
                        {income.sub_category ??
                          income.main_category ??
                          "Ingreso"}{" "}
                        · {income.account_name} ·{" "}
                        {dateFormatter.format(new Date(income.created_at))}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-black text-emerald-600">
                        +{formatCurrency(income.amount)}
                      </p>
                      {income.savings_amount > 0 ? (
                        <p className="text-[9px] font-semibold text-amber-600">
                          {formatCurrency(income.savings_amount)} ahorrado
                        </p>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
        <Card>
          <CardBody>
            <h3 className="mb-1 text-sm font-black text-slate-900">
              Historial de movimientos
            </h3>
            <p className="mb-3 text-xs text-slate-400">
              Puedes corregir o eliminar cualquier movimiento; los saldos se
              recalculan automáticamente.
            </p>
            <TransactionList
              transactions={transactions}
              onEdit={handleEdit}
              onDelete={handleDelete}
              deletingId={deletingId}
            />
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <DebtList
              initialDebts={debts}
              onChange={handleDebtsChange}
            />
          </CardBody>
        </Card>
      </div>

      <TransactionForm
        key={editingTransaction?.id ?? (formOpen ? "new-open" : "closed")}
        open={formOpen}
        accounts={accounts}
        initialTransaction={editingTransaction}
        onClose={closeForm}
        onSave={handleSave}
        loading={saving}
      />
    </div>
  );
}
