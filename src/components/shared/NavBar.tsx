"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  Clock3,
  CreditCard,
  Droplets,
  GraduationCap,
  LayoutDashboard,
  Layers3,
  ListChecks,
  LogOut,
  MoreHorizontal,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

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
  { href: "/stats", label: "Resumen", icon: BarChart3 },
] as const;

const MOBILE_PRIMARY = LINKS.slice(0, 4);
const MOBILE_MORE = LINKS.slice(4);

export function NavBar() {
  const pathname = usePathname();
  const supabase = createClient();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r border-purple-100/80 bg-white/95 px-5 py-6 shadow-[12px_0_40px_rgba(88,28,135,0.04)] backdrop-blur-xl lg:flex">
        <Link href="/dashboard" className="flex items-center gap-3 rounded-2xl px-1">
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

        <nav className="mt-7 flex-1 space-y-1 overflow-y-auto pr-1" aria-label="Principal">
          {LINKS.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex min-h-11 items-center gap-3 rounded-2xl px-3.5 text-sm font-semibold transition-all",
                  active
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                    : "text-slate-600 hover:bg-purple-50 hover:text-purple-800",
                )}
              >
                <Icon className={cn("h-4.5 w-4.5", active ? "text-white" : "text-slate-400 group-hover:text-purple-600")} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="rounded-3xl border border-purple-100 bg-gradient-to-br from-purple-50 via-rose-50 to-indigo-50 p-4">
          <div className="mb-2 flex items-center gap-2 text-purple-700">
            <Sparkles className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.14em]">Tu espacio</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-600">
            Organiza clases, tareas, bienestar, compras y dinero sin mezclarlo todo.
          </p>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/70 bg-white/70 px-3 py-2 text-xs font-bold text-slate-500 transition hover:text-rose-600"
          >
            <LogOut className="h-3.5 w-3.5" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-30 border-b border-purple-100/80 bg-white/90 px-4 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 font-black text-slate-950">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-600 text-white">
              <BookOpen className="h-4 w-4" />
            </span>
            Harmony OS
          </Link>
          <button onClick={handleLogout} className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-500" aria-label="Cerrar sesión">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <nav className="app-mobile-nav fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 gap-1 border-t border-purple-100 bg-white/95 backdrop-blur-xl lg:hidden" aria-label="Principal móvil">
        {MOBILE_PRIMARY.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex min-h-12 min-w-0 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-bold transition-colors",
                active ? "bg-purple-50 text-purple-700" : "text-slate-400",
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="max-w-full truncate">{link.label}</span>
            </Link>
          );
        })}
        <details className="group relative">
          <summary className={cn(
            "flex min-h-12 cursor-pointer list-none flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-bold",
            MOBILE_MORE.some((link) => isActive(link.href)) ? "bg-purple-50 text-purple-700" : "text-slate-400",
          )}>
            <MoreHorizontal className="h-5 w-5" />
            Más
          </summary>
          <div className="absolute bottom-full right-0 mb-3 w-56 rounded-2xl border border-purple-100 bg-white p-2 shadow-xl">
            {MOBILE_MORE.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.href} href={link.href} className={cn(
                  "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold",
                  isActive(link.href) ? "bg-purple-50 text-purple-700" : "text-slate-600 hover:bg-slate-50",
                )}>
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
