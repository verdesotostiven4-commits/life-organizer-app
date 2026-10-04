"use client";

import { useState } from "react";
import { Plus, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Card, CardBody } from "@/components/ui/Card";
import type { ShoppingItem } from "@/features/pantry/queries";
import {
  addShoppingItem,
  toggleShoppingItem,
  deleteShoppingItem,
} from "@/features/pantry/queries";
import { PANTRY_CATEGORIES } from "@/config/finance";
import { cn } from "@/lib/utils";

interface ShoppingListProps {
  initialItems: ShoppingItem[];
}

const OTHER_CATEGORY = "__other__";

const CATEGORY_OPTIONS = [
  ...PANTRY_CATEGORIES.map((category) => ({
    value: category,
    label: category,
  })),
  { value: OTHER_CATEGORY, label: "Otra categoría…" },
];

const CATEGORY_DOT: Record<string, string> = {
  Frutas: "bg-rose-400",
  Verduras: "bg-emerald-400",
  Proteína: "bg-amber-400",
  "Granos secos": "bg-lavanda-400",
  Lácteos: "bg-sky-400",
  Limpieza: "bg-cyan-500",
};

export function ShoppingList({ initialItems }: ShoppingListProps) {
  const [items, setItems] = useState(initialItems);
  const [name, setName] = useState("");
  const [categoryChoice, setCategoryChoice] = useState<string>("Frutas");
  const [customCategory, setCustomCategory] = useState("");

  const selectedCategory =
    categoryChoice === OTHER_CATEGORY ? customCategory.trim() : categoryChoice;

  const handleAdd = async () => {
    if (!name.trim() || !selectedCategory) return;

    const tempItem: ShoppingItem = {
      id: `temp-${Date.now()}`,
      name: name.trim(),
      category: selectedCategory,
      checked: false,
      created_at: new Date().toISOString(),
    };

    setItems((prev) => [tempItem, ...prev]);
    setName("");

    try {
      const realId = await addShoppingItem({
        name: tempItem.name,
        category: selectedCategory,
      });
      setItems((prev) =>
        prev.map((item) =>
          item.id === tempItem.id ? { ...item, id: realId } : item,
        ),
      );
    } catch {
      setItems((prev) => prev.filter((item) => item.id !== tempItem.id));
    }
  };

  const handleToggle = async (id: string, checked: boolean) => {
    const previous = items.find((item) => item.id === id);
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, checked } : item)),
    );

    try {
      await toggleShoppingItem(id, checked);
    } catch {
      if (previous) {
        setItems((current) =>
          current.map((item) =>
            item.id === id ? { ...item, checked: previous.checked } : item,
          ),
        );
      }
    }
  };

  const handleDelete = async (id: string) => {
    const backup = items.find((item) => item.id === id);
    setItems((current) => current.filter((item) => item.id !== id));

    try {
      await deleteShoppingItem(id);
    } catch {
      if (backup) setItems((current) => [backup, ...current]);
    }
  };

  return (
    <Card>
      <CardBody>
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-lila-900">Lista de compras</h3>
          <p className="mt-1 text-[10px] text-lila-400">
            Elige una categoría o escribe una propia cuando necesites algo diferente.
          </p>
        </div>

        <div className="mb-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_190px_auto] sm:items-end">
          <label className="block">
            <span className="sr-only">Producto</span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="¿Qué comprar?"
              onKeyDown={(event) => event.key === "Enter" && handleAdd()}
              className="h-11 w-full rounded-xl border border-lila-200 px-3 text-sm text-lila-900 placeholder:text-lila-300 focus:border-lavanda-400 focus:outline-none focus:ring-2 focus:ring-lavanda-400"
            />
          </label>

          <Select
            value={categoryChoice}
            options={CATEGORY_OPTIONS}
            onChange={(value) => {
              setCategoryChoice(value);
              if (value !== OTHER_CATEGORY) setCustomCategory("");
            }}
          />

          <Button
            className="w-full sm:w-11 sm:px-0"
            onClick={handleAdd}
            disabled={!name.trim() || !selectedCategory}
            aria-label="Agregar producto"
          >
            <Plus className="h-4 w-4" />
            <span className="sm:hidden">Agregar</span>
          </Button>
        </div>

        {categoryChoice === OTHER_CATEGORY ? (
          <div className="mb-4 rounded-2xl border border-purple-100 bg-purple-50/50 p-3">
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-bold text-purple-700">
                Nombre de la categoría
              </span>
              <input
                type="text"
                value={customCategory}
                onChange={(event) => setCustomCategory(event.target.value.slice(0, 40))}
                onKeyDown={(event) => event.key === "Enter" && handleAdd()}
                placeholder="Ej. Mascotas, papelería, hogar…"
                maxLength={40}
                className="h-10 w-full rounded-xl border border-purple-100 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100"
              />
            </label>
          </div>
        ) : null}

        {items.length === 0 ? (
          <p className="py-4 text-center text-sm text-lila-400">
            Lista vacía. Agrega lo que necesitas comprar.
          </p>
        ) : (
          <div className="space-y-1.5">
            {items.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors",
                  item.checked && "bg-lila-50/50",
                )}
              >
                <button
                  type="button"
                  onClick={() => handleToggle(item.id, !item.checked)}
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors duration-100",
                    item.checked
                      ? "border-emerald-500 bg-emerald-500"
                      : "border-lila-200 hover:border-lavanda-400",
                  )}
                  aria-label={item.checked ? "Marcar como pendiente" : "Marcar como comprado"}
                >
                  {item.checked ? <Check className="h-3 w-3 text-white" /> : null}
                </button>

                <span
                  className={cn(
                    "h-2 w-2 shrink-0 rounded-full",
                    CATEGORY_DOT[item.category] ?? "bg-purple-400",
                  )}
                />

                <span
                  className={cn(
                    "min-w-0 flex-1 truncate text-sm",
                    item.checked
                      ? "text-lila-400 line-through"
                      : "text-lila-900",
                  )}
                >
                  {item.name}
                </span>

                <span className="max-w-28 shrink-0 truncate text-[10px] text-lila-400 sm:max-w-40">
                  {item.category}
                </span>

                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="shrink-0 rounded p-1 text-lila-300 transition-colors hover:bg-rose-50 hover:text-rose-500"
                  aria-label={`Eliminar ${item.name}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
