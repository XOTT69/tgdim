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

export default function HomePage() {
  const [issues, setIssues] = useState<Issue[] | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[] | null>(null);

  useEffect(() => {
    fetch("/api/issues")
      .then((r) => r.json())
      .then((d) => setIssues((d.issues ?? []).filter((i: Issue) => i.status !== "resolved").slice(0, 3)));

    fetch("/api/announcements")
      .then((r) => r.json())
      .then((d) => setAnnouncements((d.announcements ?? []).slice(0, 3)));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Наш будинок</h1>

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
        <Link href="/announcements" className="text-blue-600 text-sm">Усі оголошення →</Link>
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
        <Link href="/issues" className="text-blue-600 text-sm">Усі проблеми →</Link>
      </section>
    </div>
  );
}
