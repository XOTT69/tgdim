import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";

type EmptyStateProps = {
  icon: string;
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Card className="flex min-h-44 flex-col items-center justify-center px-5 text-center">
      <span aria-hidden="true" className="mb-2 text-3xl">{icon}</span>
      <h2 className="text-base font-semibold text-[var(--tg-text-color)]">{title}</h2>
      <p className="mt-1 max-w-xs text-sm leading-5 text-[var(--tg-hint-color)]">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </Card>
  );
}
