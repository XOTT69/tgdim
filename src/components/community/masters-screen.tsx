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
import type { Master, MasterRecommendation } from "@/types/database";

type MastersData = { masters: Master[]; recommendations: MasterRecommendation[] };
export function MastersScreen() { return <AuthRequired><MastersContent /></AuthRequired>; }
function MastersContent() {
  const data = useAsyncData(async () => { const client = getSupabaseBrowserClient(); if (!client) throw new Error("Supabase не налаштовано."); const [masters, recommendations] = await Promise.all([client.from("masters").select("*").order("category").order("name"), client.from("master_recommendations").select("*")]); if (masters.error) throw masters.error; if (recommendations.error) throw recommendations.error; return { masters: masters.data as Master[], recommendations: recommendations.data as MasterRecommendation[] }; });
  return data.loading ? <ListLoading /> : data.error ? <ListError message={data.error} onRetry={data.refresh} /> : data.data?.masters.length ? <div className="space-y-3">{data.data.masters.map((master) => <MasterCard data={data.data!} key={master.id} master={master} refresh={data.refresh} />)}</div> : <EmptyState description="Адміністратор ще не додав рекомендованих фахівців." icon="🛠" title="Майстрів поки немає" />;
}
function MasterCard({ master, data, refresh }: { master: Master; data: MastersData; refresh: () => Promise<void> }) {
  const { profile } = useAuth(); const [open, setOpen] = useState(false); const [rating, setRating] = useState("5"); const [comment, setComment] = useState(""); const [contact, setContact] = useState(""); const [message, setMessage] = useState<string | null>(null); const [pending, setPending] = useState(false);
  const recommendations = data.recommendations.filter((item) => item.master_id === master.id); const average = recommendations.length ? recommendations.reduce((sum, item) => sum + item.rating, 0) / recommendations.length : null;
  async function recommend(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); if (!profile) return; setPending(true); try { const client = getSupabaseBrowserClient(); if (!client) throw new Error("Supabase не налаштовано."); const { error } = await client.from("master_recommendations").upsert({ master_id: master.id, author_id: profile.id, rating: Number(rating), comment: comment.trim() || null, contact_details: contact.trim() || null }, { onConflict: "master_id,author_id" }); if (error) throw error; setOpen(false); setMessage("Вашу рекомендацію збережено."); await refresh(); } catch (cause) { setMessage(cause instanceof Error ? cause.message : "Не вдалося зберегти рекомендацію."); } finally { setPending(false); } }
  return <Card><p className="text-xs font-semibold uppercase text-[var(--tg-link-color)]">{master.category}</p><h2 className="mt-1 font-semibold">{master.name}</h2>{master.description ? <p className="mt-2 text-sm">{master.description}</p> : null}{master.contact_details ? <p className="mt-2 text-sm">Контакти: {master.contact_details}</p> : null}<p className="mt-3 text-sm text-[var(--tg-hint-color)]">{recommendations.length} рек. {average ? `· ${average.toFixed(1)} / 5` : ""}</p><Button className="mt-3" onClick={() => setOpen(!open)} variant="secondary">{open ? "Закрити" : "Рекомендувати"}</Button>{open ? <form className="mt-3 space-y-3 border-t border-black/10 pt-3" onSubmit={recommend}><Field label="Оцінка"><Select onChange={(event) => setRating(event.target.value)} value={rating}>{[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} / 5</option>)}</Select></Field><Field label="Коментар (необов’язково)"><Textarea maxLength={2000} onChange={(event) => setComment(event.target.value)} value={comment} /></Field><Field label="Контакти (необов’язково)"><Input maxLength={500} onChange={(event) => setContact(event.target.value)} value={contact} /></Field><Button disabled={pending} type="submit">{pending ? "Зберігаємо…" : "Зберегти"}</Button></form> : null}{message ? <p className="mt-2 text-sm text-[var(--tg-link-color)]">{message}</p> : null}</Card>;
}
