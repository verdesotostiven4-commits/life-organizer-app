"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { NavBar } from "@/components/shared/NavBar";

export function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = pathname === "/login" || pathname.startsWith("/auth/");

  if (isAuthRoute) return <>{children}</>;

  return (
    <>
      <NavBar />
      <div className="min-h-dvh pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pl-72 lg:pb-0">
        {children}
      </div>
    </>
  );
}
