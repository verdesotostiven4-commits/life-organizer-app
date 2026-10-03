"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

type MenuPosition = {
  left: number;
  width: number;
  top?: number;
  bottom?: number;
  maxHeight: number;
};

export function Select({
  value,
  options,
  onChange,
  placeholder = "Selecciona…",
  className,
  disabled,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);

  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const selected = options.find((option) => option.value === value);

  const updateMenuPosition = () => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const viewportPadding = 12;
    const gap = 6;
    const availableBelow = window.innerHeight - rect.bottom - viewportPadding;
    const availableAbove = rect.top - viewportPadding;
    const preferredMaxHeight = 260;
    const openAbove = availableBelow < 180 && availableAbove > availableBelow;
    const maxHeight = Math.max(
      120,
      Math.min(preferredMaxHeight, openAbove ? availableAbove - gap : availableBelow - gap),
    );

    const width = Math.max(rect.width, 168);
    const left = Math.min(
      Math.max(viewportPadding, rect.left),
      Math.max(viewportPadding, window.innerWidth - width - viewportPadding),
    );

    setMenuPosition(
      openAbove
        ? {
            left,
            width,
            bottom: window.innerHeight - rect.top + gap,
            maxHeight,
          }
        : {
            left,
            width,
            top: rect.bottom + gap,
            maxHeight,
          },
    );
  };

  useEffect(() => {
    if (!open) return;

    updateMenuPosition();

    const handleOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (
        ref.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };

    const handleViewportChange = () => updateMenuPosition();

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside, { passive: true });
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [open]);

  const openMenu = () => {
    const index = options.findIndex((option) => option.value === value);
    setHighlighted(index >= 0 ? index : 0);
    setOpen(true);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (
      !open &&
      (event.key === "Enter" ||
        event.key === " " ||
        event.key === "ArrowDown")
    ) {
      event.preventDefault();
      openMenu();
      return;
    }

    if (!open) return;

    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      buttonRef.current?.focus();
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlighted((current) =>
        Math.min(current + 1, options.length - 1),
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlighted((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === "Enter" && options[highlighted]) {
      event.preventDefault();
      onChange(options[highlighted].value);
      setOpen(false);
      buttonRef.current?.focus();
    }
  };

  const menu =
    open && menuPosition && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={menuRef}
            className="fixed z-[120] overflow-y-auto rounded-2xl border border-purple-100 bg-white p-1.5 shadow-[0_16px_45px_rgba(76,29,149,0.16)]"
            role="listbox"
            style={{
              left: menuPosition.left,
              width: menuPosition.width,
              top: menuPosition.top,
              bottom: menuPosition.bottom,
              maxHeight: menuPosition.maxHeight,
            }}
            onKeyDown={handleKeyDown}
          >
            {options.map((option, index) => {
              const isSelected = option.value === value;
              const isHighlighted = index === highlighted;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                    buttonRef.current?.focus();
                  }}
                  onMouseEnter={() => setHighlighted(index)}
                  className={cn(
                    "flex min-h-10 w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors duration-100",
                    isHighlighted && "bg-purple-50",
                    isSelected
                      ? "font-bold text-purple-700"
                      : "text-slate-700",
                  )}
                >
                  <span className="min-w-0 flex-1 whitespace-normal break-words">
                    {option.label}
                  </span>
                  {isSelected ? (
                    <Check className="h-4 w-4 shrink-0 text-purple-600" />
                  ) : null}
                </button>
              );
            })}
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <div
        ref={ref}
        className={cn("relative", className)}
        onKeyDown={handleKeyDown}
      >
        <button
          ref={buttonRef}
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => {
            if (open) setOpen(false);
            else openMenu();
          }}
          className={cn(
            "flex h-11 w-full items-center justify-between gap-2 rounded-xl border bg-white px-3 text-sm font-semibold text-slate-800 transition-colors duration-100",
            "focus:outline-none focus:ring-2 focus:ring-purple-200",
            open
              ? "border-purple-400 ring-2 ring-purple-100"
              : "border-purple-100 hover:border-purple-200",
            disabled && "cursor-not-allowed opacity-50",
          )}
        >
          <span className={cn("truncate", !selected && "text-slate-400")}>
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-purple-400 transition-transform duration-100",
              open && "rotate-180",
            )}
          />
        </button>
      </div>
      {menu}
    </>
  );
}

export type { ReactNode };
