import { redirect } from "next/navigation";
import { CreditCard } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAccounts, getRecentTransactions, getDebts, summarizeFinance } from "@/features/finance/queries";
import { FinanceView } from "@/features/finance/FinanceView";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function FinancePage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims?.sub) redirect("/login");

  const [accounts, transactions, debts] = await Promise.all([
    getAccounts(),
    getRecentTransactions(),
    getDebts(),
  ]);
  const summary = summarizeFinance(accounts, debts);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 lg:px-10 lg:py-10">
      <PageHeader
        eyebrow="Finanzas"
        title="Tu dinero, claro"
        description="Cuentas, ingresos, gastos, ahorro automático y deudas en una sola vista."
        icon={<CreditCard className="h-4 w-4" />}
        tone="emerald"
      />
      <FinanceView accounts={accounts} transactions={transactions} debts={debts} summary={summary} />
    </main>
  );
}
