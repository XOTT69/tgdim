"use client";

import { useState } from "react";

import { AuthRequired } from "@/components/auth/auth-required";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, Input, Select, Textarea } from "@/components/ui/form-fields";
import { ListError, ListLoading } from "@/components/ui/feedback";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useAsyncData } from "@/hooks/use-async-data";
import type { HelpPost, HelpPostType } from "@/types/database";

export function HelpScreen() { return <AuthRequired><HelpContent /></AuthRequired>; }
function HelpContent() {
  const { profile } = useAuth(); const [open, setOpen] = useState(false); const [type, setType] = useState<HelpPostType>("need_help"); const [title, setTitle] = useState(""); const [description, setDescription] = useState(""); const [location, setLocation] = useState(""); const [contact, setContact] = useState(""); const [pending, setPending] = useState(false); const [message, setMessage] = useState<string | null>(null);
  const posts = useAsyncData(async () => { const client = getSupabaseBrowserClient(); if (!client) throw new Error("Supabase не налаштовано."); const { data, error } = await client.from("help_posts").select("*").order("created_at", { ascending: false }); if (error) throw error; return data as HelpPost[]; });
  async function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); if (!profile) return; setPending(true); try { const client = getSupabaseBrowserClient(); if (!client) throw new Error("Supabase не налаштовано."); const { error } = await client.from("help_posts").insert({ type, title: title.trim(), description: description.trim(), location: location.trim() || null, contact_details: contact.trim() || null, author_id: profile.id }); if (error) throw error; setTitle(""); setDescription(""); setLocation(""); setContact(""); setOpen(false); setMessage("Публікацію додано."); await posts.refresh(); } catch (cause) { setMessage(cause instanceof Error ? cause.message : "Не вдалося додати публікацію."); } finally { setPending(false); } }
  return <div className="space-y-4"><div className="flex items-center justify-between gap-3"><p className="text-sm text-[var(--tg-hint-color)]">Допомога від сусідів для сусідів</p><Button onClick={() => setOpen(!open)}>{open ? "Закрити" : "Додати"}</Button></div>{open ? <Card><form className="space-y-3" onSubmit={submit}><Field label="Тип"><Select onChange={(event) => setType(event.target.value as HelpPostType)} value={type}><option value="need_help">Потрібна допомога</option><option value="can_help">Можу допомогти</option></Select></Field><Field label="Заголовок"><Input maxLength={200} onChange={(event) => setTitle(event.target.value)} required value={title} /></Field><Field label="Опис"><Textarea maxLength={5000} onChange={(event) => setDescription(event.target.value)} required value={description} /></Field><Field label="Місце (необов’язково)"><Input maxLength={200} onChange={(event) => setLocation(event.target.value)} value={location} /></Field><Field label="Контакти (необов’язково)"><Input maxLength={500} onChange={(event) => setContact(event.target.value)} value={contact} /></Field><Button disabled={pending} type="submit">{pending ? "Додаємо…" : "Опублікувати"}</Button></form></Card> : null}{message ? <p aria-live="polite" className="text-sm text-[var(--tg-link-color)]">{message}</p> : null}{posts.loading ? <ListLoading /> : posts.error ? <ListError message={posts.error} onRetry={posts.refresh} /> : posts.data?.length ? <div className="space-y-3">{posts.data.map((post) => <Card key={post.id}><p className="text-xs font-semibold uppercase text-[var(--tg-link-color)]">{post.type === "need_help" ? "Потрібна допомога" : "Можу допомогти"}</p><h2 className="mt-1 font-semibold">{post.title}</h2><p className="mt-2 whitespace-pre-wrap text-sm">{post.description}</p>{post.location ? <p className="mt-3 text-sm text-[var(--tg-hint-color)]">{post.location}</p> : null}{post.contact_details ? <p className="mt-1 text-sm">Контакти: {post.contact_details}</p> : null}</Card>)}</div> : <EmptyState description="Тут можна попросити допомогу або запропонувати свою." icon="🤝" title="Запитів поки немає" />}</div>;
}
