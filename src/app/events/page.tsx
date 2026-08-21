"use client";

import { useEffect, useState } from "react";
import Loader from "@/components/Loader";
import EmptyState from "@/components/EmptyState";
import BackButton from "@/components/BackButton";

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  location: string | null;
  created_at: string;
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

  if (error) return <div className="text-red-500 text-center py-10">{error}</div>;
  if (events === null) return <Loader />;

  return (
    <div className="space-y-3">
      <BackButton />
      <h1 className="text-xl font-bold">📅 Події</h1>

      {events.length === 0 && <EmptyState text="Найближчих подій немає" />}

      {events.map((event) => (
        <div key={event.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="font-semibold">{event.title}</div>
          <div className="text-sm text-blue-600 mt-1">
            📅 {new Date(event.event_date).toLocaleDateString("uk-UA", {
              weekday: "short",
              day: "numeric",
              month: "long",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          {event.location && (
            <p className="text-gray-500 text-xs mt-1">📍 {event.location}</p>
          )}
          {event.description && (
            <p className="text-gray-700 text-sm mt-2">{event.description}</p>
          )}
        </div>
      ))}
    </div>
  );
}
