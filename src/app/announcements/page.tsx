"use client";
import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import Loader from "@/components/Loader";
import EmptyState from "@/components/EmptyState";
import { announcements as fallback } from "@/lib/demo-data";
type Announcement = { id: string; title: string; body: string; published_at?: string; created_at?: string };
export default function AnnouncementsPage() { const [items, setItems] = useState<Announcement[] | null>(null); const [error, setError] = useState(false);
 useEffect(() => { fetch("/api/announcements").then(r => r.ok ? r.json() : Promise.reject()).then(d => setItems(d.announcements)).catch(() => { setItems(fallback); setError(true); }); }, []);
 return <><PageHeader title="Оголошення" />{error && <p className="mb-3 text-xs text-slate-400">Показано приклад, бо серверні дані поки недоступні.</p>}{items === null ? <Loader /> : items.length === 0 ? <EmptyState text="Оголошень поки немає" /> : <div className="space-y-3">{items.map(a => <article key={a.id} className="card"><div className="mb-2 text-xs text-slate-400">{a.published_at ? new Date(a.published_at).toLocaleDateString("uk-UA") : "Оголошення будинку"}</div><h2 className="font-semibold">{a.title}</h2><p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{a.body}</p></article>)}</div>}</>; }
