"use client";

import { useEffect, useState } from "react";
import Loader from "@/components/Loader";
import EmptyState from "@/components/EmptyState";

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
      .catch(() => setError("Не вдалось завантажити оголошення"));
  }, []);

  if (error) return <div className="text-red-500 text-center py-10">{error}</div>;
  if (announcements === null) return <Loader />;

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold">📢 Оголошення</h1>

      {announcements.length === 0 && <EmptyState text="Оголошень поки немає" />}

      {announcements.map((a) => (
        <div key={a.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="font-semibold text-base">{a.title}</div>
          <p className="text-gray-700 text-sm mt-1 whitespace-pre-line">{a.body}</p>
          {a.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={a.image_url}
              alt={a.title}
              className="mt-2 rounded-lg max-h-48 w-full object-cover"
            />
          )}
          <div className="text-xs text-gray-400 mt-2">
            {new Date(a.published_at).toLocaleDateString("uk-UA", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
