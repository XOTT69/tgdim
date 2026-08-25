import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ className, variant = "primary", type = "button", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tg-link-color)] disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" && "bg-[var(--tg-button-color)] text-[var(--tg-button-text-color)]",
        variant === "secondary" && "bg-[var(--tg-secondary-bg-color)] text-[var(--tg-text-color)]",
        variant === "ghost" && "text-[var(--tg-link-color)] hover:bg-[var(--tg-secondary-bg-color)]",
        className,
      )}
      type={type}
      {...props}
    />
  );
}
