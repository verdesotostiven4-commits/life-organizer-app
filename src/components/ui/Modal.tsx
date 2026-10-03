"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-lila-950/30"
        onClick={onClose}
        aria-label="Cerrar modal"
        tabIndex={-1}
      />

      <div
        className={cn(
          "relative z-10 max-h-[90vh] w-full overflow-y-auto",
          "rounded-t-3xl border border-lila-100 bg-white shadow-[0_18px_48px_rgba(30,23,37,0.16)] sm:max-w-lg sm:rounded-3xl",
          "px-6 py-5",
          className,
        )}
        role="dialog"
        aria-modal="true"
        aria-label={title ?? "Ventana"}
      >
        {title ? (
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-lila-950">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-lila-400 transition-colors duration-100 hover:text-lila-700"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
}
