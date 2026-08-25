"use client";

import type { ReactNode } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { EmptyState } from "@/components/ui/empty-state";
import { ListLoading } from "@/components/ui/feedback";

export function AuthRequired({ children }: { children: ReactNode }) {
  const { status, error } = useAuth();
  if (status === "loading") {
    return <ListLoading />;
  }
  if (status !== "authenticated") {
    return <EmptyState description={error ?? "Відкрийте Mini App через Telegram, щоб продовжити."} icon="🔐" title="Потрібна авторизація" />;
  }
  return <>{children}</>;
}
