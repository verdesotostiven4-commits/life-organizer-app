"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  Clock3,
  CreditCard,
  Droplets,
  GraduationCap,
  Home,
  LayoutDashboard,
  ListChecks,
  LogOut,
  MoreHorizontal,
  ShoppingBag,
  Sparkles,
  Layers3,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";

const LINKS = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/schedule", label: "Horario", icon: Clock3 },
  { href: "/calendar", label: "Calendario", icon: CalendarDays },
  { href: "/tasks", label: "Tareas", icon: ListChecks },
  { href: "/wellness", label: "Bienestar", icon: Droplets },
  { href: "/pantry", label: "Despensa", icon: ShoppingBag },
  { href: "/finance", label: "Finanzas", icon: CreditCard },
  { href: "/academic", label: "Académico", icon: GraduationCap },
  { href: "/templates", label: "Plantillas", icon: Layers3 },
  { href: "/household", label: "Hogar", icon: Home },
  { href: "/stats", label: "Resumen", icon: BarChart3 },
] as const;

const MOBILE_PRIMARY = LINKS.slice(0, 4);
const MOBILE_MORE = LINKS.slice(4);

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const moreRef = useRef<HTMLDetailsElement>(null);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const supabase = createClient();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const navigationPending =
    pendingHref !== null && !isActive(pendingHref);

  const warmRoute = (href: string) => {
    if (!isActive(href)) router.prefetch(href);
  };

  const beginNavigation = (href: string) => {
    warmRoute(href);
    if (!isActive(href)) {
      setPendingHref(href);
      window.setTimeout(() => {
        setPendingHref((current) => (current === href ? null : current));
      }, 6000);
    }
  };

  // En móvil varias rutas viven dentro de "Más" y no entran al viewport.
  // Las precalentamos cuando el navegador queda libre para que el primer toque
  // no tenga que empezar desde cero.
  useEffect(() => {
    moreRef.current?.removeAttribute("open");

    const timer = window.setTimeout(() => {
      for (const link of LINKS) {
        if (!isActive(link.href)) router.prefetch(link.href);
      }
    }, 650);

    return () => window.clearTimeout(timer);
    // pathname cambia cuando la navegación ya terminó; volvemos a calentar
    // únicamente las rutas restantes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  };

  const linkIntentProps = (href: string) => ({
    onPointerEnter: () => warmRoute(href),
    onFocus: () => warmRoute(href),
    onTouchStart: () => warmRoute(href),
    onClick: () => beginNavigation(href),
  });

  return (
    <>
      <NotificationCenter />

      {navigationPending ? (
        <div className="pointer-events-none fixed inset-x-0 top-0 z-[80] h-0.5 overflow-hidden bg-purple-100">
          <div className="nav-progress-bar h-full rounded-full bg-purple-600" />
        </div>
      ) : null}

      <aside className="app-chrome-fixed fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r border-purple-100/80 bg-white px-5 py-6 shadow-[8px_0_24px_rgba(88,28,135,0.035)] lg:flex">
        <Link
          href="/dashboard"
          prefetch={true}
          {...linkIntentProps("/dashboard")}
          className="flex items-center gap-3 rounded-2xl px-1"
        >
          <div className="rounded-2xl bg-gradient-to-tr from-purple-500 via-rose-300 to-indigo-300 p-[2px] shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-white">
              <BookOpen className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-tight text-slate-950">Harmony OS</span>
              <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[9px] font-bold text-purple-700">ESPOCH</span>
            </div>
            <p className="mt-0.5 text-[11px] font-medium text-slate-400">Vida, estudio y finanzas</p>
          </div>
        </Link>

        <nav className="mt-5 flex-1 space-y-0.5 overflow-y-auto pb-3 pr-1" aria-label="Principal">
          {LINKS.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href) || pendingHref === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                prefetch={true}
                aria-current={isActive(link.href) ? "page" : undefined}
                {...linkIntentProps(link.href)}
                className={cn(
                  "group flex min-h-10 items-center gap-3 rounded-2xl px-3.5 text-sm font-semibold transition-colors duration-100",
                  active
                    ? "bg-purple-600 text-white shadow-sm shadow-purple-600/15"
                    : "text-slate-600 hover:bg-purple-50 hover:text-purple-800",
                )}
              >
                <Icon className={cn("h-4.5 w-4.5", active ? "text-white" : "text-slate-400 group-hover:text-purple-600")} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-3 rounded-3xl border border-purple-100 bg-gradient-to-br from-purple-50 via-rose-50 to-indigo-50 p-3">
          <div className="mb-2 flex items-center gap-2 text-purple-700">
            <Sparkles className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.14em]">Nuestro hogar</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-600">
            Un solo espacio para sus tareas, compras, estudios y dinero compartido.
          </p>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/70 bg-white/70 px-3 py-2 text-xs font-bold text-slate-500 transition-colors duration-100 hover:text-rose-600"
          >
            <LogOut className="h-3.5 w-3.5" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <header className="app-chrome-fixed sticky top-0 z-30 border-b border-purple-100/80 bg-white px-4 lg:hidden">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between">
          <Link
            href="/dashboard"
            prefetch={true}
            {...linkIntentProps("/dashboard")}
            className="flex min-h-11 items-center gap-2 font-black text-slate-950"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-600 text-white">
              <BookOpen className="h-4 w-4" />
            </span>
            Harmony OS
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-400 transition-colors duration-100 hover:bg-rose-50 hover:text-rose-500"
            aria-label="Cerrar sesión"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <nav className="app-mobile-nav app-chrome-fixed fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 gap-1 border-t border-purple-100 bg-white lg:hidden" aria-label="Principal móvil">
        {MOBILE_PRIMARY.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.href) || pendingHref === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              prefetch={true}
              onPointerEnter={() => warmRoute(link.href)}
              onFocus={() => warmRoute(link.href)}
              onTouchStart={() => warmRoute(link.href)}
              onClick={() => {
                moreRef.current?.removeAttribute("open");
                beginNavigation(link.href);
              }}
              className={cn(
                "flex min-h-12 min-w-0 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-bold transition-colors duration-100",
                active ? "bg-purple-50 text-purple-700" : "text-slate-400 active:bg-slate-50",
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="max-w-full truncate">{link.label}</span>
            </Link>
          );
        })}

        <details ref={moreRef} className="group relative">
          <summary
            onPointerEnter={() => {
              for (const link of MOBILE_MORE) warmRoute(link.href);
            }}
            className={cn(
              "flex min-h-12 cursor-pointer list-none flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-bold active:bg-slate-50",
              MOBILE_MORE.some((link) => isActive(link.href) || pendingHref === link.href)
                ? "bg-purple-50 text-purple-700"
                : "text-slate-400",
            )}
          >
            <MoreHorizontal className="h-5 w-5" />
            Más
          </summary>
          <div className="absolute bottom-full right-0 mb-3 w-60 rounded-2xl border border-purple-100 bg-white p-2 shadow-xl">
            {MOBILE_MORE.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href) || pendingHref === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={true}
                  onPointerEnter={() => warmRoute(link.href)}
                  onFocus={() => warmRoute(link.href)}
                  onTouchStart={() => warmRoute(link.href)}
                  onClick={() => {
                    moreRef.current?.removeAttribute("open");
                    beginNavigation(link.href);
                  }}
                  className={cn(
                    "flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors duration-100",
                    active ? "bg-purple-50 text-purple-700" : "text-slate-600 active:bg-slate-50",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </details>
      </nav>
    </>
  );
}
