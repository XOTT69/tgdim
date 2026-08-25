"use client";

import { useState } from "react";

import { AuthRequired } from "@/components/auth/auth-required";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, Input, Textarea } from "@/components/ui/form-fields";
import { ListError, ListLoading } from "@/components/ui/feedback";
import { SignedImage } from "@/components/ui/signed-image";
import { formatDateTime } from "@/lib/domain";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { uploadImage } from "@/lib/storage";
import { useAsyncData } from "@/hooks/use-async-data";
import type { Announcement } from "@/types/database";

export function AnnouncementsScreen() { return <AuthRequired><AnnouncementsContent /></AuthRequired>; }

function AnnouncementsContent() {
  const { profile } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const announcements = useAsyncData(async () => {
    const client = getSupabaseBrowserClient(); if (!client) throw new Error("Supabase не налаштовано.");
    const { data, error } = await client.from("announcements").select("*").order("published_at", { ascending: false });
    if (error) throw error; return data as Announcement[];
  });
  async function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!profile) return; setPending(true); setMessage(null);
    try {
      const client = getSupabaseBrowserClient(); if (!client) throw new Error("Supabase не налаштовано.");
      const imagePath = image ? await uploadImage("announcement-images", "announcements", profile.id, image) : editing?.image_path ?? null;
      const values = { title: title.trim(), body: body.trim(), expires_at: expiresAt ? new Date(expiresAt).toISOString() : null, image_path: imagePath };
      const response = editing ? await client.from("announcements").update(values).eq("id", editing.id) : await client.from("announcements").insert({ ...values, author_id: profile.id });
      if (response.error) throw response.error; setTitle(""); setBody(""); setExpiresAt(""); setImage(null); setEditing(null); setShowForm(false); setMessage(editing ? "Оголошення оновлено." : "Оголошення опубліковано."); await announcements.refresh();
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : "Не вдалося опублікувати оголошення."); } finally { setPending(false); }
  }
  async function remove(id: string) {
    const client = getSupabaseBrowserClient(); if (!client) return;
    const { error } = await client.from("announcements").delete().eq("id", id); if (error) setMessage(error.message); else await announcements.refresh();
  }
  function startEdit(item: Announcement) {
    setEditing(item); setTitle(item.title); setBody(item.body); setExpiresAt(item.expires_at ? item.expires_at.slice(0, 16) : ""); setImage(null); setShowForm(true);
  }
  return <div className="space-y-4"><div className="flex items-center justify-between gap-3"><p className="text-sm text-[var(--tg-hint-color)]">Новини для всього будинку</p>{profile?.is_admin ? <Button onClick={() => { setEditing(null); setShowForm((value) => !value); }}>{showForm ? "Закрити" : "Створити"}</Button> : null}</div>{showForm ? <Card><form className="space-y-3" onSubmit={create}><Field label="Заголовок"><Input maxLength={200} onChange={(event) => setTitle(event.target.value)} required value={title} /></Field><Field label="Текст"><Textarea maxLength={10000} onChange={(event) => setBody(event.target.value)} required value={body} /></Field><Field label="Показувати до (необов’язково)"><Input onChange={(event) => setExpiresAt(event.target.value)} type="datetime-local" value={expiresAt} /></Field><Field hint="JPEG, PNG або WebP, до 5 МБ" label="Зображення"><Input accept="image/jpeg,image/png,image/webp" onChange={(event) => setImage(event.target.files?.[0] ?? null)} type="file" /></Field><Button disabled={pending} type="submit">{pending ? "Зберігаємо…" : editing ? "Оновити" : "Опублікувати"}</Button></form></Card> : null}{message ? <p aria-live="polite" className="text-sm text-[var(--tg-link-color)]">{message}</p> : null}{announcements.loading ? <ListLoading /> : announcements.error ? <ListError message={announcements.error} onRetry={announcements.refresh} /> : announcements.data?.length ? <div className="space-y-3">{announcements.data.map((item) => <Card key={item.id}><h2 className="font-semibold">{item.title}</h2><p className="mt-2 whitespace-pre-wrap text-sm leading-5">{item.body}</p>{item.image_path ? <SignedImage alt={`Зображення: ${item.title}`} bucket="announcement-images" path={item.image_path} /> : null}<p className="mt-3 text-xs text-[var(--tg-hint-color)]">{formatDateTime(item.published_at)}</p>{profile?.is_admin ? <div className="mt-3 flex gap-2"><Button onClick={() => startEdit(item)} variant="ghost">Редагувати</Button><Button onClick={() => void remove(item.id)} variant="ghost">Видалити</Button></div> : null}</Card>)}</div> : <EmptyState description="Адміністратор ще не опублікував жодного повідомлення." icon="📢" title="Оголошень поки немає" />}</div>;
}
