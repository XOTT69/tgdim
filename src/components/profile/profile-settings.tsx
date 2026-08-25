"use client";

import Link from "next/link";
import { useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/form-fields";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export function ProfileSettings() {
  const { profile, refreshProfile } = useAuth(); const [entrance, setEntrance] = useState(profile?.entrance ?? ""); const [apartment, setApartment] = useState(profile?.apartment ?? ""); const [notifications, setNotifications] = useState(profile?.notifications_enabled ?? true); const [pending, setPending] = useState(false); const [message, setMessage] = useState<string | null>(null);
  if (!profile) return null;
  async function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setPending(true); setMessage(null); try { const client = getSupabaseBrowserClient(); if (!client) throw new Error("Supabase не налаштовано."); const { error } = await client.rpc("update_my_profile", { new_entrance: entrance.trim() || null, new_apartment: apartment.trim() || null, new_notifications_enabled: notifications }); if (error) throw error; await refreshProfile(); setMessage("Налаштування збережено."); } catch (cause) { setMessage(cause instanceof Error ? cause.message : "Не вдалося зберегти налаштування."); } finally { setPending(false); } }
  return <Card className="mt-4"><form className="space-y-3" onSubmit={submit}><h2 className="font-semibold">Налаштування проживання</h2><Field label="Під’їзд (необов’язково)"><Input maxLength={32} onChange={(event) => setEntrance(event.target.value)} value={entrance} /></Field><Field label="Квартира (необов’язково)"><Input maxLength={32} onChange={(event) => setApartment(event.target.value)} value={apartment} /></Field><label className="flex min-h-11 items-center gap-3 text-sm"><input checked={notifications} className="size-5 accent-[var(--tg-button-color)]" onChange={(event) => setNotifications(event.target.checked)} type="checkbox" />Отримувати сповіщення</label><Button disabled={pending} type="submit">{pending ? "Зберігаємо…" : "Зберегти"}</Button>{profile.is_admin ? <Link className="ml-3 text-sm font-semibold text-[var(--tg-link-color)]" href="/admin">Адмін-панель</Link> : null}{message ? <p aria-live="polite" className="text-sm text-[var(--tg-link-color)]">{message}</p> : null}</form></Card>;
}
