"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg" | "icon";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800 shadow-md shadow-purple-600/15",
  secondary:
    "bg-white text-slate-700 border border-slate-200 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-800",
  ghost:
    "bg-transparent text-slate-600 hover:bg-purple-50 hover:text-purple-800",
  danger:
    "bg-rose-500 text-white hover:bg-rose-600 active:bg-rose-700 shadow-sm",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3.5 text-xs rounded-xl gap-1.5",
  md: "h-10 px-4 text-sm rounded-xl gap-2",
  lg: "h-12 px-6 text-sm rounded-2xl gap-2",
  icon: "h-10 w-10 rounded-xl justify-center",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center font-bold transition-colors duration-100",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    />
  ),
);

Button.displayName = "Button";
