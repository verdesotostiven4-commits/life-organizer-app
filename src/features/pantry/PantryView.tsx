"use client";

import { useState } from "react";
import { BudgetOverview } from "./components/BudgetOverview";
import { ShoppingList } from "./components/ShoppingList";
import { ExtraExpenses } from "./components/ExtraExpenses";
import { PantryBudgetControls } from "./components/PantryBudgetControls";
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
}

export function PantryView({
  budget: initialBudget,
  shoppingItems,
  categoryExpenses: initialCategoryExpenses,
  extraExpenses: initialExtraExpenses,
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

      <ExtraExpenses
        initialExpenses={initialExtraExpenses}
        onChange={setExtraExpenses}
      />
    </div>
  );
}
