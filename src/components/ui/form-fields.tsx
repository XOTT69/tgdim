import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type FieldProps = { label: string; hint?: string; error?: string };

const baseClassName = "mt-1.5 min-h-11 w-full rounded-xl border border-black/10 bg-[var(--tg-bg-color)] px-3 text-base text-[var(--tg-text-color)] outline-none transition focus:border-[var(--tg-link-color)] focus:ring-2 focus:ring-[var(--tg-link-color)]/20";

export function Field({ label, hint, error, children }: FieldProps & { children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-[var(--tg-text-color)]">
      {label}
      {children}
      {error ? <span className="mt-1 block text-xs text-[var(--tg-destructive-text-color)]">{error}</span> : hint ? <span className="mt-1 block text-xs font-normal text-[var(--tg-hint-color)]">{hint}</span> : null}
    </label>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(baseClassName, className)} {...props} />;
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(baseClassName, className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(baseClassName, "min-h-28 py-3", className)} {...props} />;
}
