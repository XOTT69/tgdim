"use client";

import { useEffect, useState } from "react";
import { SkeletonList } from "@/components/Skeleton";
import EmptyState from "@/components/EmptyState";
import { timeAgo } from "@/lib/time-ago";

interface Announcement {
  id: string;
  title: string;
  body: string;
  image_url: string | null;
  published_at: string;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/announcements")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setAnnouncements(d.announcements);
      })
      .catch(() => setError("Не вдалось завантажити"));
  }, []);

  if (error) return <div className="text-red-500 text-center py-10 text-sm">{error}</div>;
  if (announcements === null) return <SkeletonList count={3} />;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-900">📢 Оголошення</h1>

      {announcements.length === 0 && <EmptyState text="Оголошень поки немає" />}

      <div className="space-y-2.5">
        {announcements.map((a) => (
          <div key={a.id} className="card">
            <div className="font-semibold text-slate-800">{a.title}</div>
            <p className="text-slate-600 text-sm mt-1.5 whitespace-pre-line">{a.body}</p>
            {a.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={a.image_url}
                alt={a.title}
                className="mt-3 rounded-xl max-h-48 w-full object-cover"
              />
            )}
            <p className="text-slate-400 text-[11px] mt-3">{timeAgo(a.published_at)}</p>
          </div>
        ))}
      </div>

      <div className="h-4" />
    </div>
  );
}
