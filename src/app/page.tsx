"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Loader from "@/components/Loader";
import { Issue, CATEGORY_LABELS } from "@/lib/types";
import { announcements as fallbackAnnouncements, events, extras } from "@/lib/demo-data";

interface Announcement { id: string; title: string; body: string; }
function SectionTitle({ title, href }: { title: string; href: string }) { return <div className="mb-2 flex items-center justify-between"><h2 className="font-semibold">{title}</h2><Link className="text-sm text-blue-600" href={href}>Усі →</Link></div>; }

export default function HomePage() {
  const [issues, setIssues] = useState<Issue[] | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[] | null>(null);
  useEffect(() => { fetch("/api/issues").then(r => r.ok ? r.json() : Promise.reject()).then(d => setIssues((d.issues ?? []).filter((i: Issue) => i.status !== "resolved").slice(0, 3))).catch(() => setIssues([])); fetch("/api/announcements").then(r => r.ok ? r.json() : Promise.reject()).then(d => setAnnouncements((d.announcements ?? []).slice(0, 3))).catch(() => setAnnouncements(fallbackAnnouncements)); }, []);
  return <div className="space-y-6"><header className="pt-1"><p className="text-sm text-slate-500">Спільнота мешканців</p><h1 className="text-2xl font-bold">Наш будинок 👋</h1></header>
    <section><SectionTitle title="📢 Оголошення" href="/announcements" />{announcements === null ? <Loader /> : <div className="space-y-2">{announcements.map(a => <Link href="/announcements" key={a.id} className="card block"><h3 className="font-medium">{a.title}</h3><p className="mt-1 line-clamp-2 text-sm text-slate-600">{a.body}</p></Link>)}</div>}</section>
    <section><SectionTitle title="🔧 Активні проблеми" href="/issues" />{issues === null ? <Loader /> : issues.length === 0 ? <div className="card text-sm text-slate-500">Активних проблем немає 🎉</div> : <div className="space-y-2">{issues.map(i => <Link href="/issues" key={i.id} className="card block"><p className="text-xs text-slate-500">{CATEGORY_LABELS[i.category]}</p><h3 className="font-medium">{i.location}</h3></Link>)}</div>}</section>
    <section><SectionTitle title="📅 Найближча подія" href="/events" /><Link href="/events" className="card flex items-center gap-3"><span className="rounded-xl bg-blue-50 px-3 py-2 text-center text-sm font-bold text-blue-700">24<br /><span className="text-xs font-medium">СЕР</span></span><div><h3 className="font-medium">{events[0].title}</h3><p className="text-sm text-slate-500">{events[0].location} · {events[0].attendees} учасників</p></div></Link></section>
    <section><h2 className="mb-2 font-semibold">Ще для сусідів</h2><div className="grid grid-cols-2 gap-2">{extras.map(item => <Link href={item.href} key={item.href} className="card p-3"><span className="text-xl">{item.icon}</span><h3 className="mt-1 text-sm font-medium">{item.title}</h3><p className="text-xs text-slate-500">{item.text}</p></Link>)}</div></section>
  </div>;
}
