"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SkeletonList } from "@/components/Skeleton";
import EmptyState from "@/components/EmptyState";
import BackButton from "@/components/BackButton";
import { timeAgo } from "@/lib/time-ago";
import { Plus, MapPin, Phone } from "lucide-react";

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

  if (error) return <div className="text-red-500 text-center py-10 text-sm">{error}</div>;
  if (items === null) return <SkeletonList count={3} />;

  return (
    <div className="space-y-4">
      <BackButton />
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-slate-900">Знахідки / Втрати</h1>
        <Link
          href="/found-lost/new"
          className="flex items-center gap-1.5 bg-blue-500 text-white px-3.5 py-2 rounded-xl text-sm font-medium active:scale-95 transition-transform"
        >
          <Plus size={16} />
          Додати
        </Link>
      </div>

      {items.length === 0 && <EmptyState text="Поки немає оголошень" />}

      <div className="space-y-2.5">
        {items.map((item) => (
          <div key={item.id} className="card">
            <div className="flex items-center justify-between mb-1">
              <span className={`badge ${item.type === "found" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                {item.type === "found" ? "✅ Знайдено" : "❌ Загублено"}
              </span>
              <span className="text-[11px] text-slate-400">{timeAgo(item.created_at)}</span>
            </div>
            <div className="font-semibold text-slate-800 text-sm mt-1">{item.title}</div>
            {item.description && (
              <p className="text-slate-500 text-xs mt-1">{item.description}</p>
            )}
            {item.location && (
              <p className="text-slate-500 text-xs mt-1.5 flex items-center gap-1">
                <MapPin size={12} /> {item.location}
              </p>
            )}
            {item.photo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.photo_url} alt={item.title} className="mt-2 rounded-xl max-h-36 w-full object-cover" />
            )}
            {item.contact_method && (
              <p className="text-blue-600 text-xs mt-2 flex items-center gap-1">
                <Phone size={12} /> {item.contact_method}
              </p>
            )}
          </div>
        ))}
      </div>
      <div className="h-4" />
    </div>
  );
}
