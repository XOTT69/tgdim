"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SkeletonList } from "@/components/Skeleton";
import { Issue, CATEGORY_LABELS } from "@/lib/types";
import { timeAgo } from "@/lib/time-ago";
import { useTelegramWebApp } from "@/lib/use-telegram";
import Avatar from "@/components/Avatar";
import { Key, Hammer, HandHeart, CalendarDays, Plus, ArrowRight } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  body: string;
  published_at: string;
}

const quickLinks = [
  { href: "/found-lost", label: "Знахідки", Icon: Key, color: "from-amber-400 to-orange-500" },
  { href: "/masters", label: "Майстри", Icon: Hammer, color: "from-violet-400 to-purple-600" },
  { href: "/help", label: "Допомога", Icon: HandHeart, color: "from-emerald-400 to-green-600" },
  { href: "/events", label: "Події", Icon: CalendarDays, color: "from-pink-400 to-rose-600" },
];

export default function HomePage() {
  const { user } = useTelegramWebApp();
  const [issues, setIssues] = useState<Issue[] | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/issues")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setIssues((d.issues ?? []).filter((i: Issue) => i.status !== "resolved").slice(0, 3));
      })
      .catch((err) => setError(err.message));

    fetch("/api/announcements")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setAnnouncements((d.announcements ?? []).slice(0, 3));
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return <div className="text-red-500 text-center py-10 text-sm">{error}</div>;
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {user ? `Привіт, ${user.first_name}` : "Наш будинок"}
          </h1>
          <p className="text-sm text-slate-500">Що нового у будинку?</p>
        </div>
        {user && <Avatar name={user.first_name} size="md" />}
      </div>

      {/* Quick links */}
      <section className="grid grid-cols-4 gap-2.5">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex flex-col items-center gap-1.5 group"
          >
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${link.color} flex items-center justify-center shadow-sm group-active:scale-95 transition-transform`}>
              <link.Icon size={22} className="text-white" />
            </div>
            <span className="text-[11px] text-slate-600 font-medium">{link.label}</span>
          </Link>
        ))}
      </section>

      {/* Quick action */}
      <Link
        href="/issues/new"
        className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3.5 rounded-2xl font-semibold shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-transform"
      >
        <Plus size={18} />
        Повідомити про проблему
      </Link>

      {/* Announcements */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-800">📢 Оголошення</h2>
          {announcements && announcements.length > 0 && (
            <Link href="/announcements" className="text-blue-500 text-xs font-medium flex items-center gap-0.5">
              Усі <ArrowRight size={12} />
            </Link>
          )}
        </div>
        {announcements === null && <SkeletonList count={2} />}
        {announcements?.length === 0 && (
          <div className="card text-center py-6">
            <p className="text-slate-400 text-sm">Оголошень поки немає</p>
          </div>
        )}
        <div className="space-y-2.5">
          {announcements?.map((a) => (
            <div key={a.id} className="card">
              <div className="font-semibold text-slate-800 text-sm">{a.title}</div>
              <p className="text-slate-500 text-xs mt-1 line-clamp-2">{a.body}</p>
              <p className="text-slate-400 text-[11px] mt-2">{timeAgo(a.published_at)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Issues */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-800">🔧 Активні проблеми</h2>
          {issues && issues.length > 0 && (
            <Link href="/issues" className="text-blue-500 text-xs font-medium flex items-center gap-0.5">
              Усі <ArrowRight size={12} />
            </Link>
          )}
        </div>
        {issues === null && <SkeletonList count={2} />}
        {issues?.length === 0 && (
          <div className="card text-center py-6">
            <p className="text-slate-400 text-sm">Активних проблем немає 🎉</p>
          </div>
        )}
        <div className="space-y-2.5">
          {issues?.map((i) => (
            <div key={i.id} className="card">
              <div className="flex items-center justify-between">
                <span className="badge bg-slate-100 text-slate-600">{CATEGORY_LABELS[i.category]}</span>
                <span className="text-[11px] text-slate-400">{timeAgo(i.created_at)}</span>
              </div>
              <div className="font-medium text-slate-800 text-sm mt-1.5">{i.location}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="h-4" />
    </div>
  );
}
