import type { AccountKind, DebtDirection, DebtStatus } from "@/types/domain";

export type FinanceSummary = {
  totalBalance: number;
  totalSavings: number;
  debtsOwed: number;
  debtsOwedToMe: number;
};

type AccountLike = {
  kind: AccountKind;
  balance: number;
};

type DebtLike = {
  direction: DebtDirection;
  status: DebtStatus;
  amount: number;
};

export function summarizeFinance(
  accounts: AccountLike[],
  debts: DebtLike[],
): FinanceSummary {
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
