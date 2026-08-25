"use client";

import { useState } from "react";

import { AuthRequired } from "@/components/auth/auth-required";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ListError, ListLoading } from "@/components/ui/feedback";
import { formatDateTime } from "@/lib/domain";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useAsyncData } from "@/hooks/use-async-data";
import type { BuildingEvent, EventAttendee } from "@/types/database";

type EventsData = { events: BuildingEvent[]; attendees: EventAttendee[] };
export function EventsScreen() { return <AuthRequired><EventsContent /></AuthRequired>; }
function EventsContent() {
  const data = useAsyncData(async () => { const client = getSupabaseBrowserClient(); if (!client) throw new Error("Supabase не налаштовано."); const [events, attendees] = await Promise.all([client.from("events").select("*").gte("starts_at", new Date().toISOString()).order("starts_at"), client.from("event_attendees").select("*")]); if (events.error) throw events.error; if (attendees.error) throw attendees.error; return { events: events.data as BuildingEvent[], attendees: attendees.data as EventAttendee[] }; });
  return data.loading ? <ListLoading /> : data.error ? <ListError message={data.error} onRetry={data.refresh} /> : data.data?.events.length ? <div className="space-y-3">{data.data.events.map((event) => <EventCard data={data.data!} event={event} key={event.id} refresh={data.refresh} />)}</div> : <EmptyState description="Зустрічі, толоки та інші події з’являться тут." icon="📅" title="Подій поки немає" />;
}
function EventCard({ event, data, refresh }: { event: BuildingEvent; data: EventsData; refresh: () => Promise<void> }) {
  const { profile } = useAuth(); const [pending, setPending] = useState(false); const attendance = data.attendees.find((item) => item.event_id === event.id && item.user_id === profile?.id); const count = data.attendees.filter((item) => item.event_id === event.id).length;
  async function toggle() { if (!profile) return; setPending(true); try { const client = getSupabaseBrowserClient(); if (!client) throw new Error("Supabase не налаштовано."); const response = attendance ? await client.from("event_attendees").delete().eq("event_id", event.id).eq("user_id", profile.id) : await client.from("event_attendees").insert({ event_id: event.id, user_id: profile.id }); if (response.error) throw response.error; await refresh(); } finally { setPending(false); } }
  return <Card><h2 className="font-semibold">{event.title}</h2><p className="mt-1 text-sm text-[var(--tg-hint-color)]">{formatDateTime(event.starts_at)} · {event.location}</p><p className="mt-3 whitespace-pre-wrap text-sm">{event.description}</p><div className="mt-3 flex items-center justify-between gap-3"><span className="text-sm text-[var(--tg-hint-color)]">Учасників: {count}</span><Button disabled={pending} onClick={() => void toggle()} variant={attendance ? "secondary" : "primary"}>{attendance ? "Не йду" : "Я буду"}</Button></div></Card>;
}
