import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={cn("rounded-2xl bg-[var(--tg-secondary-bg-color)] p-4 shadow-sm ring-1 ring-black/5", className)}
      {...props}
    />
  );
}
