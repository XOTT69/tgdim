"use client";

import { useEffect, useState } from "react";
import Loader from "@/components/Loader";
import EmptyState from "@/components/EmptyState";

interface FoundLostItem {
  id: string;
  type: "found" | "lost";
  title: string;
  description: string | null;
  location: string | null;
  photo_url: string | null;
  contact_method: string | null;
  created_at: string;
}

const TYPE_LABELS = {
  found: "✅ Знайдено",
  lost: "❌ Загублено",
};

export default function FoundLostPage() {
  const [items, setItems] = useState<FoundLostItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/found-lost")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setItems(d.items);
      })
      .catch(() => setError("Не вдалось завантажити"));
  }, []);

  if (error) return <div className="text-red-500 text-center py-10">{error}</div>;
  if (items === null) return <Loader />;

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold">🔑 Знахідки / Втрати</h1>

      {items.length === 0 && <EmptyState text="Поки немає оголошень" />}

      {items.map((item) => (
        <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div className="font-semibold">{item.title}</div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100">
              {TYPE_LABELS[item.type]}
            </span>
          </div>
          {item.description && (
            <p className="text-gray-700 text-sm mt-1">{item.description}</p>
          )}
          {item.location && (
            <p className="text-gray-500 text-xs mt-1">📍 {item.location}</p>
          )}
          {item.photo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.photo_url}
              alt={item.title}
              className="mt-2 rounded-lg max-h-40 w-full object-cover"
            />
          )}
          {item.contact_method && (
            <p className="text-blue-600 text-xs mt-2">📞 {item.contact_method}</p>
          )}
          <div className="text-xs text-gray-400 mt-2">
            {new Date(item.created_at).toLocaleDateString("uk-UA")}
          </div>
        </div>
      ))}
    </div>
  );
}
