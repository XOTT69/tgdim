import type { ReactNode } from "react";

import { AppHeader } from "@/components/app/app-header";
import { BottomNavigation } from "@/components/app/bottom-navigation";

export function AppShell({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="min-h-dvh bg-[var(--tg-bg-color)] text-[var(--tg-text-color)]">
      <AppHeader />
      <main className="mx-auto w-full max-w-md px-4 py-5 pb-28">{children}</main>
      <BottomNavigation />
    </div>
  );
}
