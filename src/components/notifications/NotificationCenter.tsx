"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type HarmonyNotification = {
  id: string;
  recipient_user_id: string;
  type: "task" | "purchase" | "schedule" | "academic" | "system";
  title: string;
  body: string;
  href: string;
  read_at: string | null;
  created_at: string;
};

const formatter = new Intl.DateTimeFormat("es-EC", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export function NotificationCenter() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [notifications, setNotifications] = useState<HarmonyNotification[]>([]);
  const [open, setOpen] = useState(false);

  const unread = notifications.filter((item) => !item.read_at).length;

  useEffect(() => {
    let active = true;
    let userId = "";

    const load = async () => {
      const { data: auth } = await supabase.auth.getClaims();
      userId = auth?.claims?.sub ?? "";
      if (!userId || !active) return;

      const { data, error } = await supabase
        .from("notifications")
        .select("id, recipient_user_id, type, title, body, href, read_at, created_at")
        .eq("recipient_user_id", userId)
        .order("created_at", { ascending: false })
        .limit(30);

      if (!error && active) {
        setNotifications((data ?? []) as HarmonyNotification[]);
      }

      const channel = supabase
        .channel(`harmony-notifications-${userId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `recipient_user_id=eq.${userId}`,
          },
          async (payload) => {
            const row = payload.new as HarmonyNotification;
            if (!active) return;

            setNotifications((current) => [
              row,
              ...current.filter((item) => item.id !== row.id),
            ].slice(0, 30));

            if (
              "Notification" in window &&
              Notification.permission === "granted" &&
              "serviceWorker" in navigator
            ) {
              try {
                const registration = await navigator.serviceWorker.ready;
                await registration.showNotification(row.title, {
                  body: row.body,
                  icon: "/pwa/icon/192",
                  badge: "/pwa/icon/192",
                  tag: row.id,
                  data: { href: row.href },
                });
              } catch {
                // El aviso seguirá disponible dentro de Harmony.
              }
            }
          },
        )
        .subscribe();

      return channel;
    };

    let channel: ReturnType<typeof supabase.channel> | undefined;
    load().then((value) => {
      channel = value;
    });

    return () => {
      active = false;
      if (channel) void supabase.removeChannel(channel);
    };
  }, [supabase]);

  const markRead = async (id: string) => {
    const readAt = new Date().toISOString();
    setNotifications((current) =>
      current.map((item) =>
        item.id === id ? { ...item, read_at: readAt } : item,
      ),
    );

    await supabase
      .from("notifications")
      .update({ read_at: readAt })
      .eq("id", id);
  };

  const markAllRead = async () => {
    const readAt = new Date().toISOString();
    const ids = notifications.filter((item) => !item.read_at).map((item) => item.id);
    if (ids.length === 0) return;

    setNotifications((current) =>
      current.map((item) => ({ ...item, read_at: item.read_at ?? readAt })),
    );

    await supabase
      .from("notifications")
      .update({ read_at: readAt })
      .in("id", ids);
  };

  const openNotification = async (item: HarmonyNotification) => {
    if (!item.read_at) await markRead(item.id);
    setOpen(false);
    router.push(item.href || "/dashboard");
  };

  return (
    <div className="fixed right-[3.8rem] top-2 z-[70] lg:left-[13.4rem] lg:right-auto lg:top-5">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "relative flex h-10 w-10 items-center justify-center rounded-2xl border bg-white shadow-sm transition-colors",
          open
            ? "border-purple-200 text-purple-700"
            : "border-purple-100 text-slate-400 hover:text-purple-600",
        )}
        aria-label="Notificaciones"
        aria-expanded={open}
      >
        <Bell className="h-4.5 w-4.5" />
        {unread > 0 ? (
          <span className="absolute -right-1 -top-1 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[8px] font-black text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="fixed left-3 right-3 top-14 z-[75] max-h-[70dvh] overflow-hidden rounded-3xl border border-purple-100 bg-white shadow-[0_20px_60px_rgba(76,29,149,0.18)] sm:left-auto sm:right-3 sm:w-[360px] lg:left-[12.5rem] lg:right-auto lg:top-16">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <p className="text-sm font-black text-slate-950">Notificaciones</p>
              <p className="text-[10px] text-slate-400">
                {unread > 0 ? `${unread} sin leer` : "Todo al día"}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {unread > 0 ? (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="flex h-8 items-center gap-1 rounded-xl px-2 text-[10px] font-bold text-purple-600 hover:bg-purple-50"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Leer todo
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-50"
                aria-label="Cerrar notificaciones"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="max-h-[calc(70dvh-60px)] overflow-y-auto p-2">
            {notifications.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Bell className="mx-auto h-6 w-6 text-slate-200" />
                <p className="mt-2 text-xs font-semibold text-slate-400">
                  Aún no hay avisos.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {notifications.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => openNotification(item)}
                    className={cn(
                      "w-full rounded-2xl px-3 py-3 text-left transition-colors",
                      item.read_at
                        ? "bg-white hover:bg-slate-50"
                        : "bg-purple-50/70 hover:bg-purple-50",
                    )}
                  >
                    <div className="flex items-start gap-2.5">
                      <span
                        className={cn(
                          "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                          item.read_at ? "bg-slate-200" : "bg-purple-500",
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-black text-slate-800">
                          {item.title}
                        </p>
                        {item.body ? (
                          <p className="mt-0.5 line-clamp-2 text-[10px] leading-relaxed text-slate-500">
                            {item.body}
                          </p>
                        ) : null}
                        <p className="mt-1 text-[9px] font-semibold text-slate-300">
                          {formatter.format(new Date(item.created_at))}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
