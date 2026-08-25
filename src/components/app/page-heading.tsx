import type { ReactNode } from "react";

export function PageHeading({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--tg-text-color)]">{title}</h1>
        {description ? <p className="mt-1 text-sm text-[var(--tg-hint-color)]">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
