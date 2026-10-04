import { redirect } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getActiveBudget, getShoppingItems, getCategoryExpenses, getExtraExpenses } from "@/features/pantry/queries";
import { PantryView } from "@/features/pantry/PantryView";
import { getNeighborList } from "@/features/pantry/neighbor-queries";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function PantryPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims?.sub) redirect("/login");

  const [budget, shoppingItems, categoryExpenses, extraExpenses, neighborList] = await Promise.all([
    getActiveBudget(),
    getShoppingItems(),
    getCategoryExpenses(),
    getExtraExpenses(),
    getNeighborList(),
  ]);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-8 lg:px-10 lg:py-10">
      <PageHeader
        eyebrow="Despensa & compras"
        title="Compra con intención"
        description="Presupuesto, lista del mercado y compras compartidas del hogar en un solo lugar."
        icon={<ShoppingBag className="h-4 w-4" />}
        tone="emerald"
      />
      <PantryView budget={budget} shoppingItems={shoppingItems} categoryExpenses={categoryExpenses} extraExpenses={extraExpenses} neighborList={neighborList} />
    </main>
  );
}
