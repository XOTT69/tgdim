"use client";

import Link from "next/link";

import { AuthRequired } from "@/components/auth/auth-required";
import { Card } from "@/components/ui/card";
import { ListError, ListLoading } from "@/components/ui/feedback";
import { formatDateTime, ISSUE_STATUSES } from "@/lib/domain";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useAsyncData } from "@/hooks/use-async-data";
import type { Announcement, BuildingEvent, BuildingIssue, Poll } from "@/types/database";

export function HomeDashboard() { return <AuthRequired><HomeContent /></AuthRequired>; }
function HomeContent() {
  const data = useAsyncData(async () => {
    const client = getSupabaseBrowserClient(); if (!client) throw new Error("Supabase не налаштовано.");
    const now = new Date().toISOString();
    const [announcements, issues, polls, events] = await Promise.all([
      client.from("announcements").select("*").order("published_at", { ascending: false }).limit(3),
      client.from("issues").select("*").neq("status", "resolved").order("created_at", { ascending: false }).limit(3),
      client.from("polls").select("*").eq("is_closed", false).order("created_at", { ascending: false }).limit(3),
      client.from("events").select("*").gte("starts_at", now).order("starts_at").limit(3),
    ]);
    for (const result of [announcements, issues, polls, events]) if (result.error) throw result.error;
    return { announcements: announcements.data as Announcement[], issues: issues.data as BuildingIssue[], polls: polls.data as Poll[], events: events.data as BuildingEvent[] };
  });
  if (data.loading) return <ListLoading />;
  if (data.error) return <ListError message={data.error} onRetry={data.refresh} />;
  const value = data.data!;
  return <div className="space-y-5"><HomeSection href="/announcements" title="Важливі оголошення">{value.announcements.length ? value.announcements.map((item) => <p className="text-sm" key={item.id}>{item.title}</p>) : <SmallEmpty text="Наразі оголошень немає." />}</HomeSection><HomeSection href="/issues" title="Відкриті проблеми">{value.issues.length ? value.issues.map((item) => <p className="text-sm" key={item.id}>{ISSUE_STATUSES[item.status].icon} {item.location}</p>) : <SmallEmpty text="Відкритих проблем немає." />}</HomeSection><HomeSection href="/polls" title="Активні голосування">{value.polls.length ? value.polls.map((item) => <p className="text-sm" key={item.id}>{item.question}</p>) : <SmallEmpty text="Активних голосувань немає." />}</HomeSection><HomeSection href="/events" title="Найближчі події">{value.events.length ? value.events.map((item) => <p className="text-sm" key={item.id}>{item.title} <span className="text-[var(--tg-hint-color)]">· {formatDateTime(item.starts_at)}</span></p>) : <SmallEmpty text="Подій поки немає." />}</HomeSection><Link className="flex min-h-11 items-center justify-center rounded-xl bg-[var(--tg-secondary-bg-color)] text-sm font-semibold text-[var(--tg-link-color)]" href="/more">Інші розділи</Link></div>;
}
function HomeSection({ title, href, children }: { title: string; href: string; children: React.ReactNode }) { return <Card><div className="mb-3 flex items-center justify-between gap-3"><h2 className="font-semibold">{title}</h2><Link className="text-sm font-semibold text-[var(--tg-link-color)]" href={href}>Усі</Link></div><div className="space-y-2">{children}</div></Card>; }
function SmallEmpty({ text }: { text: string }) { return <p className="text-sm text-[var(--tg-hint-color)]">{text}</p>; }
