"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SkeletonList } from "@/components/Skeleton";
import EmptyState from "@/components/EmptyState";
import BackButton from "@/components/BackButton";
import { Plus, Star, Phone } from "lucide-react";

interface Master {
  id: string;
  category: string;
  name: string;
  description: string | null;
  contact: string | null;
  rating_sum: number;
  rating_count: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  plumber: "🔧 Сантехнік",
  electrician: "⚡ Електрик",
  appliance: "🔌 Побутова техніка",
  cleaning: "🧹 Клінінг",
  locksmith: "🔐 Замки / двері",
  other: "🛠 Інше",
};

export default function MastersPage() {
  const [masters, setMasters] = useState<Master[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/masters")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setMasters(d.masters);
      })
      .catch(() => setError("Не вдалось завантажити"));
  }, []);

  if (error) return <div className="text-red-500 text-center py-10 text-sm">{error}</div>;
  if (masters === null) return <SkeletonList count={3} />;

  return (
    <div className="space-y-4">
      <BackButton />
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-slate-900">Майстри</h1>
        <Link
          href="/masters/new"
          className="flex items-center gap-1.5 bg-blue-500 text-white px-3.5 py-2 rounded-xl text-sm font-medium active:scale-95 transition-transform"
        >
          <Plus size={16} />
          Додати
        </Link>
      </div>

      {masters.length === 0 && <EmptyState text="Рекомендацій поки немає" />}

      <div className="space-y-2.5">
        {masters.map((m) => {
          const avg = m.rating_count > 0 ? (m.rating_sum / m.rating_count).toFixed(1) : "—";
          return (
            <div key={m.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold text-slate-800 text-sm">{m.name}</div>
                  <div className="badge bg-slate-100 text-slate-600 mt-1 text-[11px]">
                    {CATEGORY_LABELS[m.category] ?? m.category}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm font-medium text-amber-600">
                  <Star size={14} fill="currentColor" />
                  {avg}
                  <span className="text-slate-400 text-[11px]">({m.rating_count})</span>
                </div>
              </div>
              {m.description && (
                <p className="text-slate-500 text-xs mt-2">{m.description}</p>
              )}
              {m.contact && (
                <p className="text-blue-600 text-xs mt-2 flex items-center gap-1">
                  <Phone size={12} /> {m.contact}
                </p>
              )}
            </div>
          );
        })}
      </div>
      <div className="h-4" />
    </div>
  );
}
