"use client";

import type { Account } from "@/features/finance/queries";
import { ACCOUNT_KIND_LABELS, formatCurrency } from "@/config/finance";
import { cn } from "@/lib/utils";

export function AccountCard({ account }: { account: Account }) {
  const meta = ACCOUNT_KIND_LABELS[account.kind];

  return (
    <div className={cn(
      "min-h-32 rounded-3xl border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
      account.kind === "ahorros"
        ? "border-amber-100 bg-gradient-to-br from-white to-amber-50"
        : account.kind === "efectivo"
          ? "border-emerald-100 bg-gradient-to-br from-white to-emerald-50"
          : "border-purple-100 bg-gradient-to-br from-white to-purple-50",
    )}>
      <div className="flex items-center justify-between">
        <span className="text-lg">{meta.emoji}</span>
        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">{meta.label}</span>
      </div>
      <p className="mt-4 truncate text-xs font-bold text-slate-500">{account.name}</p>
      <p className={cn("mt-1 text-xl font-black", account.balance >= 0 ? "text-slate-950" : "text-rose-600")}>{formatCurrency(account.balance)}</p>
      {account.note && <p className="mt-1 truncate text-[10px] text-slate-400">{account.note}</p>}
    </div>
  );
}
