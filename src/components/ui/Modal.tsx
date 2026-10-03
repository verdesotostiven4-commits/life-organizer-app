"use client";

import { useEffect, useId, type ReactNode } from "react";
import { createPortal } from "react-dom";
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
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-lila-950/35"
        onClick={onClose}
        aria-label="Cerrar modal"
        tabIndex={-1}
      />

      <div
        className={cn(
          "relative z-10 w-full overflow-y-auto bg-white",
          "max-h-[calc(100dvh-3.5rem)] rounded-t-3xl border border-lila-100 shadow-[0_18px_48px_rgba(30,23,37,0.18)]",
          "px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-5",
          "sm:max-h-[min(90dvh,760px)] sm:max-w-lg sm:rounded-3xl sm:px-6 sm:pb-5",
          className,
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : "Ventana"}
      >
        {title ? (
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 id={titleId} className="text-lg font-semibold text-lila-950">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lila-400 transition-colors duration-100 hover:bg-lila-50 hover:text-lila-700"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        ) : null}

        {children}
      </div>
    </div>,
    document.body,
  );
}
