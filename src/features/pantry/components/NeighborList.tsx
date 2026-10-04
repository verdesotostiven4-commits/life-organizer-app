"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Circle,
  PackageX,
  Plus,
  Radio,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import {
  addNeighborItem,
  deleteNeighborItem,
  setNeighborItemStatus,
  type NeighborItem,
  type NeighborItemStatus,
  type NeighborListData,
} from "../neighbor-queries";
import { cn } from "@/lib/utils";

const STATUS_META: Record<
  NeighborItemStatus,
  { label: string; className: string; icon: typeof Circle }
> = {
  pendiente: {
    label: "Pendiente",
    className: "border-slate-200 bg-white text-slate-500",
    icon: Circle,
  },
  comprado: {
    label: "Comprado",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: CheckCircle2,
  },
  no_habia: {
    label: "No había",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    icon: PackageX,
  },
};

function upsertItem(items: NeighborItem[], next: NeighborItem) {
  const exists = items.some((item) => item.id === next.id);
  if (!exists) return [next, ...items];
  return items.map((item) => (item.id === next.id ? next : item));
}

export function NeighborList({
  initialList,
}: {
  initialList: NeighborListData | null;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [items, setItems] = useState(initialList?.items ?? []);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!initialList) return;

    const channel = supabase
      .channel(`neighbor-list-${initialList.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "household_purchase_items",
        },
        (payload) => {
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            const row = payload.new as NeighborItem;
            if (row.list_id !== initialList.id) return;
            setItems((current) => upsertItem(current, row));
          } else if (payload.eventType === "DELETE") {
            const oldRow = payload.old as { id?: string };
            if (!oldRow.id) return;
            setItems((current) =>
              current.filter((item) => item.id !== oldRow.id),
            );
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [initialList, supabase]);

  if (!initialList) {
    return null;
  }

  const pending = items.filter((item) => item.status === "pendiente").length;

  const handleAdd = async () => {
    if (!name.trim()) return;
    setSaving(true);

    try {
      const created = await addNeighborItem({
        list_id: initialList.id,
        name,
        quantity,
        note,
      });
      setItems((current) => upsertItem(current, created));
      setName("");
      setQuantity("");
      setNote("");
    } finally {
      setSaving(false);
    }
  };

  const handleStatus = async (
    id: string,
    status: NeighborItemStatus,
  ) => {
    const previous = items;
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
              purchased_at:
                status === "pendiente" ? null : new Date().toISOString(),
            }
          : item,
      ),
    );

    try {
      await setNeighborItemStatus(id, status);
    } catch {
      setItems(previous);
    }
  };

  const handleDelete = async (id: string) => {
    const previous = items;
    setItems((current) => current.filter((item) => item.id !== id));

    try {
      await deleteNeighborItem(id);
    } catch {
      setItems(previous);
    }
  };

  return (
    <Card className="border-indigo-100">
      <CardBody className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-indigo-600" />
              <h3 className="text-sm font-black text-slate-900">
                {initialList.name}
              </h3>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-600">
                En vivo
              </span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              Lista compartida para compras rápidas. Si uno marca un producto,
              el otro lo ve sin refrescar.
            </p>
          </div>

          <span className="self-start rounded-full bg-indigo-50 px-3 py-1.5 text-[10px] font-black text-indigo-700">
            {pending} pendiente{pending === 1 ? "" : "s"}
          </span>
        </div>

        <div className="grid gap-2 lg:grid-cols-[1.2fr_120px_1fr_auto]">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && handleAdd()}
            placeholder="Producto · ej. pan, queso…"
            maxLength={120}
            className="h-11 rounded-xl border border-indigo-100 px-3 text-sm font-semibold text-slate-800 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
          />
          <input
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            placeholder="Cantidad"
            maxLength={40}
            className="h-11 rounded-xl border border-indigo-100 px-3 text-sm text-slate-700 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
          />
          <input
            value={note}
            onChange={(event) => setNote(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && handleAdd()}
            placeholder="Nota opcional"
            maxLength={160}
            className="h-11 rounded-xl border border-indigo-100 px-3 text-sm text-slate-700 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
          />
          <Button onClick={handleAdd} disabled={!name.trim() || saving}>
            <Plus className="h-4 w-4" />
            {saving ? "Agregando…" : "Agregar"}
          </Button>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-indigo-100 py-7 text-center text-xs text-slate-400">
            Lista vacía. Agrega lo que necesitan comprar.
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "rounded-2xl border p-3 transition-colors",
                  item.status === "comprado"
                    ? "border-emerald-100 bg-emerald-50/40"
                    : item.status === "no_habia"
                      ? "border-amber-100 bg-amber-50/40"
                      : "border-slate-100 bg-white",
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-sm font-black text-slate-900",
                        item.status === "comprado" &&
                          "text-slate-400 line-through",
                      )}
                    >
                      {item.name}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-[10px] text-slate-400">
                      {item.quantity ? (
                        <span>Cantidad: {item.quantity}</span>
                      ) : null}
                      {item.note ? <span>· {item.note}</span> : null}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-slate-300 hover:bg-rose-50 hover:text-rose-500"
                    aria-label={`Eliminar ${item.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {(Object.keys(STATUS_META) as NeighborItemStatus[]).map(
                    (status) => {
                      const meta = STATUS_META[status];
                      const Icon = meta.icon;
                      const active = item.status === status;

                      return (
                        <button
                          key={status}
                          type="button"
                          onClick={() => handleStatus(item.id, status)}
                          className={cn(
                            "inline-flex min-h-9 items-center gap-1.5 rounded-xl border px-3 text-[10px] font-black transition-colors",
                            active
                              ? meta.className
                              : "border-slate-100 bg-white text-slate-400 hover:bg-slate-50",
                          )}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {meta.label}
                        </button>
                      );
                    },
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
