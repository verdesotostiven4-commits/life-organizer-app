"use client";

import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from "lucide-react";
import type { Transaction } from "@/features/finance/queries";
import { formatCurrency } from "@/config/finance";
import { cn } from "@/lib/utils";
import type { TransactionType } from "@/types/domain";

interface TransactionListProps {
  transactions: Transaction[];
}

const TYPE_META: Record<
  TransactionType,
  { icon: typeof ArrowDownLeft; color: string; sign: string; label: string }
> = {
  ingreso: {
    icon: ArrowDownLeft,
    color: "text-emerald-600 bg-emerald-50",
    sign: "+",
    label: "Ingreso",
  },
  gasto: {
    icon: ArrowUpRight,
    color: "text-rose-500 bg-rose-50",
    sign: "-",
    label: "Gasto",
  },
  retiro: {
    icon: ArrowLeftRight,
    color: "text-amber-600 bg-amber-50",
    sign: "",
    label: "Transferencia",
  },
};

const dateFormatter = new Intl.DateTimeFormat("es-EC", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function TransactionList({ transactions }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-lila-400">
        Sin movimientos todavía. Registra tu primer ingreso o gasto.
      </p>
    );
  }

  return (
    <div className="space-y-1.5">
      {transactions.map((tx) => {
        const meta = TYPE_META[tx.type];
        const Icon = meta.icon;
        return (
          <div
            key={tx.id}
            className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-lila-50/50"
          >
            <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", meta.color)}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-lila-900">{tx.description}</p>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[10px] text-lila-400">
                <span>{meta.label}</span>
                <span>·</span>
                <span>{dateFormatter.format(new Date(tx.created_at))}</span>
                <span>·</span>
                <span className="truncate">{tx.account_name}</span>
                {tx.to_account_name ? (
                  <>
                    <span>→</span>
                    <span className="truncate">{tx.to_account_name}</span>
                  </>
                ) : null}
                {tx.sub_category ? (
                  <>
                    <span>·</span>
                    <span className="truncate">{tx.sub_category}</span>
                  </>
                ) : null}
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p
                className={cn(
                  "text-sm font-black",
                  tx.type === "ingreso"
                    ? "text-emerald-600"
                    : tx.type === "gasto"
                      ? "text-rose-500"
                      : "text-amber-600",
                )}
              >
                {meta.sign}{formatCurrency(tx.amount)}
              </p>
              {tx.savings_amount > 0 ? (
                <p className="text-[10px] font-medium text-amber-600">
                  {tx.savings_pct}% · {formatCurrency(tx.savings_amount)} ahorrado
                </p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
