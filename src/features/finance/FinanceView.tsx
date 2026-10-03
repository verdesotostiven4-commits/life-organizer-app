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
import type { Account, Transaction, Debt } from "@/features/finance/queries";
import { recordTransaction } from "@/features/finance/queries";
import { AccountCard } from "./components/AccountCard";
import { TransactionForm } from "./components/TransactionForm";
import { TransactionList } from "./components/TransactionList";
import { DebtList } from "./components/DebtList";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { formatCurrency } from "@/config/finance";
import type { TransactionType, IncomeMainCategory } from "@/types/domain";

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

  const incomes = useMemo(
    () => transactions.filter((transaction) => transaction.type === "ingreso"),
    [transactions],
  );
  const incomeTotal = useMemo(
    () => incomes.reduce((sum, transaction) => sum + transaction.amount, 0),
    [incomes],
  );

  const handleSave = async (input: {
    type: TransactionType;
    account_id: string;
    amount: number;
    description: string;
    to_account_id?: string | null;
    main_category?: IncomeMainCategory | null;
    sub_category?: string | null;
    savings_pct?: number;
  }) => {
    const prevAccounts = accounts;
    const prevSummary = summary;
    const prevTransactions = transactions;

    const account = accounts.find((a) => a.id === input.account_id);
    const toAccount = input.to_account_id ? accounts.find((a) => a.id === input.to_account_id) : null;
    const savingsPct = input.savings_pct ?? 0;
    const savingsAmount = input.type === "ingreso" ? (input.amount * savingsPct) / 100 : 0;
    const netAmount = input.type === "ingreso" ? input.amount - savingsAmount : input.amount;

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

    const nextAccounts = accounts.map((a) => {
      let balance = a.balance;
      if (input.type === "ingreso") {
        if (a.id === input.account_id) balance += netAmount;
        if (a.kind === "ahorros" && savingsAmount > 0) balance += savingsAmount;
      } else if (input.type === "gasto" && a.id === input.account_id) {
        balance -= input.amount;
      } else if (input.type === "retiro") {
        if (a.id === input.account_id) balance -= input.amount;
        if (input.to_account_id && a.id === input.to_account_id) balance += input.amount;
      }
      return { ...a, balance };
    });

    setTransactions((prev) => [optimisticTx, ...prev]);
    setAccounts(nextAccounts);
    setSummary((prev) => ({
      ...prev,
      totalBalance: nextAccounts.filter((a) => a.kind !== "ahorros").reduce((sum, a) => sum + a.balance, 0),
      totalSavings: nextAccounts.filter((a) => a.kind === "ahorros").reduce((sum, a) => sum + a.balance, 0),
    }));
    setFormOpen(false);

    try {
      const realId = await recordTransaction(input);
      setTransactions((prev) => prev.map((t) => t.id === tempId ? { ...t, id: realId } : t));
    } catch (error) {
      console.error("Error al registrar transacción:", error);
      setTransactions(prevTransactions);
      setAccounts(prevAccounts);
      setSummary(prevSummary);
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50 p-5">
          <Wallet className="h-5 w-5 text-emerald-600" />
          <p className="mt-3 text-[10px] font-black uppercase tracking-wider text-emerald-600">Disponible</p>
          <p className="mt-1 text-2xl font-black text-slate-950">{formatCurrency(summary.totalBalance)}</p>
        </div>
        <div className="rounded-3xl border border-amber-100 bg-gradient-to-br from-white to-amber-50 p-5">
          <PiggyBank className="h-5 w-5 text-amber-600" />
          <p className="mt-3 text-[10px] font-black uppercase tracking-wider text-amber-600">Bóveda</p>
          <p className="mt-1 text-2xl font-black text-slate-950">{formatCurrency(summary.totalSavings)}</p>
        </div>
        <div className="rounded-3xl border border-rose-100 bg-gradient-to-br from-white to-rose-50 p-5">
          <ArrowUpRight className="h-5 w-5 text-rose-500" />
          <p className="mt-3 text-[10px] font-black uppercase tracking-wider text-rose-500">Debo</p>
          <p className="mt-1 text-2xl font-black text-slate-950">{formatCurrency(summary.debtsOwed)}</p>
        </div>
        <div className="rounded-3xl border border-sky-100 bg-gradient-to-br from-white to-sky-50 p-5">
          <ArrowDownRight className="h-5 w-5 text-sky-600" />
          <p className="mt-3 text-[10px] font-black uppercase tracking-wider text-sky-600">Me deben</p>
          <p className="mt-1 text-2xl font-black text-slate-950">{formatCurrency(summary.debtsOwedToMe)}</p>
        </div>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black text-slate-900">Tus cuentas</h2>
            <p className="text-xs text-slate-400">El saldo se actualiza con cada movimiento.</p>
          </div>
          <Button size="sm" onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" /> Movimiento
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {accounts.map((account) => <AccountCard key={account.id} account={account} />)}
        </div>
      </section>

      <Card className="overflow-hidden border-emerald-100">
        <CardBody>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-600">Registro permanente</p>
              <h3 className="mt-1 text-base font-black text-slate-950">Ingresos recibidos</h3>
              <p className="text-xs text-slate-400">
                Cada trabajo queda guardado con cuenta, categoría, ahorro y fecha.
              </p>
            </div>
            <div className="rounded-2xl bg-emerald-50 px-4 py-2 text-right">
              <p className="text-[10px] font-bold uppercase text-emerald-600">Total visible</p>
              <p className="text-lg font-black text-emerald-700">{formatCurrency(incomeTotal)}</p>
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
                  <div key={income.id} className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/30 p-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-black text-slate-900">{income.description}</p>
                      <p className="mt-0.5 truncate text-[10px] text-slate-400">
                        {income.sub_category ?? income.main_category ?? "Ingreso"} · {income.account_name} · {dateFormatter.format(new Date(income.created_at))}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-black text-emerald-600">+{formatCurrency(income.amount)}</p>
                      {income.savings_amount > 0 ? (
                        <p className="text-[9px] font-semibold text-amber-600">
                          {formatCurrency(income.savings_amount)} ahorrado
                        </p>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
        <Card>
          <CardBody>
            <h3 className="mb-1 text-sm font-black text-slate-900">Historial de movimientos</h3>
            <p className="mb-3 text-xs text-slate-400">Ingresos, gastos y transferencias quedan registrados aquí.</p>
            <TransactionList transactions={transactions} />
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <DebtList initialDebts={debts} />
          </CardBody>
        </Card>
      </div>

      <TransactionForm
        key={formOpen ? "finance-open" : "finance-closed"}
        open={formOpen}
        accounts={accounts}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        loading={false}
      />
    </div>
  );
}
