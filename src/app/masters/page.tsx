"use client";

import { useEffect, useState } from "react";
import Loader from "@/components/Loader";
import EmptyState from "@/components/EmptyState";

interface Master {
  id: string;
  category: string;
  name: string;
  description: string | null;
  contact: string | null;
  rating_sum: number;
  rating_count: number;
  created_at: string;
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

  if (error) return <div className="text-red-500 text-center py-10">{error}</div>;
  if (masters === null) return <Loader />;

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold">🛠 Майстри</h1>

      {masters.length === 0 && <EmptyState text="Рекомендацій поки немає" />}

      {masters.map((m) => {
        const avg = m.rating_count > 0 ? (m.rating_sum / m.rating_count).toFixed(1) : "—";
        return (
          <div key={m.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold">{m.name}</div>
                <div className="text-xs text-gray-500">
                  {CATEGORY_LABELS[m.category] ?? m.category}
                </div>
              </div>
              <div className="text-sm font-medium text-yellow-600">
                ⭐ {avg} ({m.rating_count})
              </div>
            </div>
            {m.description && (
              <p className="text-gray-700 text-sm mt-2">{m.description}</p>
            )}
            {m.contact && (
              <p className="text-blue-600 text-xs mt-2">📞 {m.contact}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
