"use client";

import { useEffect, useState } from "react";
import { SkeletonList } from "@/components/Skeleton";
import EmptyState from "@/components/EmptyState";
import BackButton from "@/components/BackButton";
import { Calendar, MapPin } from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  location: string | null;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setEvents(d.events);
      })
      .catch(() => setError("Не вдалось завантажити"));
  }, []);

  if (error) return <div className="text-red-500 text-center py-10 text-sm">{error}</div>;
  if (events === null) return <SkeletonList count={2} />;

  return (
    <div className="space-y-4">
      <BackButton />
      <h1 className="text-xl font-bold text-slate-900">📅 Події</h1>

      {events.length === 0 && <EmptyState text="Найближчих подій немає" />}

      <div className="space-y-2.5">
        {events.map((event) => (
          <div key={event.id} className="card">
            <div className="font-semibold text-slate-800">{event.title}</div>
            <div className="flex items-center gap-1.5 text-blue-600 text-sm mt-1.5">
              <Calendar size={14} />
              {new Date(event.event_date).toLocaleDateString("uk-UA", {
                weekday: "short",
                day: "numeric",
                month: "long",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
            {event.location && (
              <p className="text-slate-500 text-xs mt-1.5 flex items-center gap-1">
                <MapPin size={12} /> {event.location}
              </p>
            )}
            {event.description && (
              <p className="text-slate-600 text-sm mt-2">{event.description}</p>
            )}
          </div>
        ))}
      </div>
      <div className="h-4" />
    </div>
  );
}
