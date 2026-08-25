import Link from "next/link";
import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";

type SectionCardProps = {
  icon: string;
  title: string;
  description: string;
  href: string;
  children?: ReactNode;
};

export function SectionCard({ icon, title, description, href, children }: SectionCardProps) {
  return (
    <Card>
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--tg-bg-color)] text-xl">{icon}</span>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold">{title}</h2>
          <p className="mt-0.5 text-sm leading-5 text-[var(--tg-hint-color)]">{description}</p>
        </div>
      </div>
      {children}
      <Link className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-[var(--tg-link-color)]" href={href}>
        Переглянути
        <span aria-hidden="true" className="ml-1 text-base">→</span>
      </Link>
    </Card>
  );
}
