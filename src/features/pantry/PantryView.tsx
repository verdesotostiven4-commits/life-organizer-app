"use client";

import { useState } from "react";
import { BudgetOverview } from "./components/BudgetOverview";
import { ShoppingList } from "./components/ShoppingList";
import { ExtraExpenses } from "./components/ExtraExpenses";
import { PantryBudgetControls } from "./components/PantryBudgetControls";
import { NeighborList } from "./components/NeighborList";
import type { NeighborListData } from "./neighbor-queries";
import type {
  PantryBudget,
  ShoppingItem,
  CategoryExpense,
  ExtraExpense,
} from "./queries";

interface PantryViewProps {
  budget: PantryBudget | null;
  shoppingItems: ShoppingItem[];
  categoryExpenses: CategoryExpense[];
  extraExpenses: ExtraExpense[];
  neighborList: NeighborListData | null;
}

export function PantryView({
  budget: initialBudget,
  shoppingItems,
  categoryExpenses: initialCategoryExpenses,
  extraExpenses: initialExtraExpenses,
  neighborList,
}: PantryViewProps) {
  const [budget, setBudget] = useState(initialBudget);
  const [categoryExpenses, setCategoryExpenses] = useState(initialCategoryExpenses);
  const [extraExpenses, setExtraExpenses] = useState(initialExtraExpenses);

  const extraTotal = extraExpenses.reduce((sum, expense) => sum + expense.cost, 0);

  return (
    <div className="space-y-4">
      <BudgetOverview
        budget={budget}
        expenses={categoryExpenses}
        extraTotal={extraTotal}
      />

      <PantryBudgetControls
        budget={budget}
        expenses={categoryExpenses}
        onBudgetChange={setBudget}
        onExpensesChange={setCategoryExpenses}
      />

      <ShoppingList initialItems={shoppingItems} />

      <NeighborList initialList={neighborList} />

      <ExtraExpenses
        initialExpenses={initialExtraExpenses}
        onChange={setExtraExpenses}
      />
    </div>
  );
}
