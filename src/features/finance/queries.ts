"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/supabase/auth";
import type {
  TransactionType,
  IncomeMainCategory,
  AccountKind,
  DebtDirection,
  DebtStatus,
} from "@/types/domain";

export type Account = {
  id: string;
  name: string;
  kind: AccountKind;
  balance: number;
  note: string;
  sort_order: number;
};

export type Transaction = {
  id: string;
  type: TransactionType;
  account_id: string;
  account_name: string;
  to_account_id: string | null;
  to_account_name: string | null;
  amount: number;
  main_category: IncomeMainCategory | null;
  sub_category: string | null;
  description: string;
  savings_pct: number;
  savings_amount: number;
  net_amount: number;
  created_at: string;
};

export type Debt = {
  id: string;
  person: string;
  amount: number;
  reason: string;
  direction: DebtDirection;
  status: DebtStatus;
  settled_at: string | null;
  created_at: string;
};

/** Trae todas las cuentas del usuario con saldo. */
export async function getAccounts(): Promise<Account[]> {
  const supabase = await createClient();
  const userId = await getCurrentUserId(supabase);
  if (!userId) return [];

  const { data, error } = await supabase
    .from("accounts")
    .select("id, name, kind, balance, note, sort_order")
    .eq("user_id", userId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Account[];
}

/** Trae las transacciones recientes del usuario (últimas 50). */
export async function getRecentTransactions(): Promise<Transaction[]> {
  const supabase = await createClient();
  const userId = await getCurrentUserId(supabase);
  if (!userId) return [];

  // Cuentas para el join en memoria.
  const { data: accounts } = await supabase
    .from("accounts")
    .select("id, name")
    .eq("user_id", userId);

  const accountMap = new Map<string, string>();
  ((accounts ?? []) as { id: string; name: string }[]).forEach((a) =>
    accountMap.set(a.id, a.name),
  );

  const { data, error } = await supabase
    .from("transactions")
    .select(
      "id, type, account_id, to_account_id, amount, main_category, sub_category, description, savings_pct, savings_amount, net_amount, created_at",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw error;

  const rows = (data ?? []) as Omit<Transaction, "account_name" | "to_account_name">[];
  return rows.map((r) => ({
    ...r,
    account_name: accountMap.get(r.account_id) ?? "—",
    to_account_name: r.to_account_id ? (accountMap.get(r.to_account_id) ?? "—") : null,
  }));
}

/** Registra una transacción vía RPC atómico (actualiza saldo + calcula ahorro). */
export async function recordTransaction(input: {
  type: TransactionType;
  account_id: string;
  amount: number;
  description: string;
  to_account_id?: string | null;
  main_category?: IncomeMainCategory | null;
  sub_category?: string | null;
  savings_pct?: number;
}): Promise<string> {
  const supabase = await createClient();
  const userId = await getCurrentUserId(supabase);
  if (!userId) throw new Error("No autenticado");

  const { data, error } = await supabase.rpc("record_transaction", {
    p_type: input.type,
    p_account_id: input.account_id,
    p_amount: input.amount,
    p_description: input.description,
    p_to_account_id: input.to_account_id ?? null,
    p_main_category: input.main_category ?? null,
    p_sub_category: input.sub_category ?? null,
    p_savings_pct: input.savings_pct ?? 0,
  } as never);

  if (error) throw error;
  return data as string;
}

/** Trae todas las deudas del usuario. */
export async function getDebts(): Promise<Debt[]> {
  const supabase = await createClient();
  const userId = await getCurrentUserId(supabase);
  if (!userId) return [];

  const { data, error } = await supabase
    .from("debts")
    .select(
      "id, person, amount, reason, direction, status, settled_at, created_at",
    )
    .eq("user_id", userId)
    .order("status", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Debt[];
}

/** Crea una nueva deuda. */
export async function createDebt(input: {
  person: string;
  amount: number;
  reason?: string;
  direction: DebtDirection;
}): Promise<void> {
  const supabase = await createClient();
  const userId = await getCurrentUserId(supabase);
  if (!userId) throw new Error("No autenticado");

  const { error } = await supabase.from("debts").insert(
    {
      user_id: userId,
      person: input.person,
      amount: input.amount,
      reason: input.reason ?? "",
      direction: input.direction,
    } as never,
  );

  if (error) throw error;
}

/** Marca una deuda como pagada / pendiente. */
export async function toggleDebtStatus(
  id: string,
  status: DebtStatus,
): Promise<void> {
  const supabase = await createClient();
  const userId = await getCurrentUserId(supabase);
  if (!userId) throw new Error("No autenticado");

  const { error } = await supabase
    .from("debts")
    .update({
      status,
      settled_at: status === "pagado" ? new Date().toISOString() : null,
    } as never)
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
}

/** Elimina una deuda. */
export async function deleteDebt(id: string): Promise<void> {
  const supabase = await createClient();
  const userId = await getCurrentUserId(supabase);
  if (!userId) throw new Error("No autenticado");

  const { error } = await supabase
    .from("debts")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw error;
}

export type FinanceSummary = {
  totalBalance: number;
  totalSavings: number;
  debtsOwed: number;
  debtsOwedToMe: number;
};

/** Calcula totales sin volver a consultar la base cuando ya tenemos los datos. */
export function summarizeFinance(accounts: Account[], debts: Debt[]): FinanceSummary {
  const totalBalance = accounts
    .filter((account) => account.kind !== "ahorros")
    .reduce((sum, account) => sum + account.balance, 0);

  const totalSavings = accounts
    .filter((account) => account.kind === "ahorros")
    .reduce((sum, account) => sum + account.balance, 0);

  const debtsOwed = debts
    .filter((debt) => debt.direction === "debo" && debt.status === "pendiente")
    .reduce((sum, debt) => sum + debt.amount, 0);

  const debtsOwedToMe = debts
    .filter((debt) => debt.direction === "me_deben" && debt.status === "pendiente")
    .reduce((sum, debt) => sum + debt.amount, 0);

  return { totalBalance, totalSavings, debtsOwed, debtsOwedToMe };
}

/** Calcula totales para pantallas que todavía no tienen cuentas/deudas cargadas. */
export async function getFinanceSummary(): Promise<FinanceSummary> {
  const [accounts, debts] = await Promise.all([getAccounts(), getDebts()]);
  return summarizeFinance(accounts, debts);
}
