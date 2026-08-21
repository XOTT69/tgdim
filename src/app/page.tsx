"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Loader from "@/components/Loader";
import { Issue, CATEGORY_LABELS } from "@/lib/types";

interface Announcement {
  id: string;
  title: string;
  body: string;
}

const quickLinks = [
  { href: "/found-lost", label: "Знахідки", icon: "🔑" },
  { href: "/masters", label: "Майстри", icon: "🛠" },
  { href: "/help", label: "Допомога", icon: "🤝" },
  { href: "/events", label: "Події", icon: "📅" },
];

export default function HomePage() {
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
    return <div className="text-red-500 text-center py-10">{error}</div>;
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Наш будинок</h1>

      {/* Quick links to secondary modules */}
      <section className="grid grid-cols-4 gap-2">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex flex-col items-center bg-white rounded-xl p-3 shadow-sm text-center active:bg-gray-50"
          >
            <span className="text-2xl">{link.icon}</span>
            <span className="text-xs text-gray-600 mt-1">{link.label}</span>
          </Link>
        ))}
      </section>

      {/* Quick action button */}
      <Link
        href="/issues/new"
        className="block w-full bg-blue-600 text-white text-center py-3 rounded-xl font-medium shadow-sm active:bg-blue-700"
      >
        + Повідомити про проблему
      </Link>

      <section>
        <h2 className="font-semibold text-gray-700 mb-2">📢 Останні оголошення</h2>
        {announcements === null && <Loader />}
        {announcements?.length === 0 && <p className="text-gray-400 text-sm">Оголошень немає</p>}
        <div className="space-y-2">
          {announcements?.map((a) => (
            <div key={a.id} className="bg-white rounded-xl p-3 shadow-sm">
              <div className="font-medium">{a.title}</div>
              <p className="text-sm text-gray-600 line-clamp-2">{a.body}</p>
            </div>
          ))}
        </div>
        {announcements && announcements.length > 0 && (
          <Link href="/announcements" className="text-blue-600 text-sm mt-2 inline-block">
            Усі оголошення →
          </Link>
        )}
      </section>

      <section>
        <h2 className="font-semibold text-gray-700 mb-2">🔧 Активні проблеми</h2>
        {issues === null && <Loader />}
        {issues?.length === 0 && <p className="text-gray-400 text-sm">Активних проблем немає 🎉</p>}
        <div className="space-y-2">
          {issues?.map((i) => (
            <div key={i.id} className="bg-white rounded-xl p-3 shadow-sm">
              <div className="text-sm text-gray-500">{CATEGORY_LABELS[i.category]}</div>
              <div className="font-medium">{i.location}</div>
            </div>
          ))}
        </div>
        {issues && issues.length > 0 && (
          <Link href="/issues" className="text-blue-600 text-sm mt-2 inline-block">
            Усі проблеми →
          </Link>
        )}
      </section>

      {/* Spacer for bottom nav */}
      <div className="h-16" />
    </div>
  );
}
