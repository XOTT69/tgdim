"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SkeletonList } from "@/components/Skeleton";
import EmptyState from "@/components/EmptyState";
import { Issue, CATEGORY_LABELS, STATUS_LABELS } from "@/lib/types";
import { timeAgo } from "@/lib/time-ago";
import { Plus, Filter } from "lucide-react";

type FilterType = "all" | "new" | "in_progress" | "resolved";

export default function IssuesPage() {
  const [issues, setIssues] = useState<Issue[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    fetch("/api/issues")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setIssues(d.issues);
      })
      .catch(() => setError("Не вдалось завантажити дані"));
  }, []);

  const filtered = issues?.filter((i) => filter === "all" || i.status === filter);

  if (error) return <div className="text-red-500 text-center py-10 text-sm">{error}</div>;
  if (issues === null) return <SkeletonList count={4} />;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-slate-900">Проблеми</h1>
        <Link
          href="/issues/new"
          className="flex items-center gap-1.5 bg-blue-500 text-white px-3.5 py-2 rounded-xl text-sm font-medium active:scale-95 transition-transform"
        >
          <Plus size={16} />
          Додати
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {([
          { key: "all", label: "Усі" },
          { key: "new", label: "🟡 Нові" },
          { key: "in_progress", label: "🔵 В роботі" },
          { key: "resolved", label: "🟢 Вирішені" },
        ] as { key: FilterType; label: string }[]).map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              filter === f.key
                ? "bg-blue-500 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 active:bg-slate-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered?.length === 0 && <EmptyState text="Проблем не знайдено" />}

      <div className="space-y-2.5">
        {filtered?.map((issue) => (
          <div key={issue.id} className="card">
            <div className="flex items-center justify-between mb-1.5">
              <span className="badge bg-slate-100 text-slate-600 text-[11px]">
                {CATEGORY_LABELS[issue.category]}
              </span>
              <span className="text-[11px] font-medium">
                {STATUS_LABELS[issue.status]}
              </span>
            </div>
            <div className="font-medium text-slate-800 text-sm">{issue.location}</div>
            <p className="text-slate-500 text-xs mt-1 line-clamp-2">{issue.description}</p>
            {issue.photo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={issue.photo_url}
                alt="Фото"
                className="mt-2 rounded-xl max-h-36 w-full object-cover"
              />
            )}
            <p className="text-slate-400 text-[11px] mt-2">{timeAgo(issue.created_at)}</p>
          </div>
        ))}
      </div>

      <div className="h-4" />
    </div>
  );
}
