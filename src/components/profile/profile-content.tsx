"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { PageHeading } from "@/components/app/page-heading";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileSettings } from "@/components/profile/profile-settings";

export function ProfileContent() {
  const { status, user, error } = useAuth();

  if (status === "loading") {
    return (
      <>
        <PageHeading description="Дані вашого профілю та сповіщень" title="Профіль" />
        <div className="space-y-3"><Skeleton className="h-24 w-full" /><Skeleton className="h-16 w-full" /></div>
      </>
    );
  }

  if (status !== "authenticated" || !user) {
    return (
      <>
        <PageHeading description="Дані вашого профілю та сповіщень" title="Профіль" />
        <EmptyState description={error ?? "Не вдалося визначити ваш профіль."} icon="🔐" title="Потрібна авторизація" />
      </>
    );
  }

  const metadata = user.user_metadata as { first_name?: string; last_name?: string; username?: string; photo_url?: string };
  const name = [metadata.first_name, metadata.last_name].filter(Boolean).join(" ") || "Мешканець";

  return (
    <>
      <PageHeading description="Дані з вашого облікового запису Telegram" title="Профіль" />
      <Card className="flex items-center gap-3">
        {metadata.photo_url ? (
          // Telegram controls this URL; Next Image is not used to avoid an external-domain allowlist.
          // eslint-disable-next-line @next/next/no-img-element
          <img alt="Аватар профілю" className="size-14 rounded-full object-cover" referrerPolicy="no-referrer" src={metadata.photo_url} />
        ) : <span aria-hidden="true" className="flex size-14 items-center justify-center rounded-full bg-[var(--tg-bg-color)] text-2xl">👤</span>}
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold">{name}</h2>
          {metadata.username ? <p className="truncate text-sm text-[var(--tg-hint-color)]">@{metadata.username}</p> : null}
        </div>
      </Card>
      <ProfileSettings />
    </>
  );
}
