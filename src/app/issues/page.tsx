"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Loader from "@/components/Loader";
import EmptyState from "@/components/EmptyState";
import { Issue, CATEGORY_LABELS, STATUS_LABELS } from "@/lib/types";

export default function IssuesPage() {
  const [issues, setIssues] = useState<Issue[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/issues")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setIssues(d.issues);
      })
      .catch(() => setError("Не вдалось завантажити дані"));
  }, []);

  if (error) return <div className="text-red-500 text-center py-10">{error}</div>;
  if (issues === null) return <Loader />;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Проблеми будинку</h1>
        <Link
          href="/issues/new"
          className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium"
        >
          + Повідомити
        </Link>
      </div>

      {issues.length === 0 && <EmptyState text="Проблем не зафіксовано 🎉" />}

      {issues.map((issue) => (
        <div key={issue.id} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
          <div className="flex justify-between text-sm text-gray-500 mb-1">
            <span>{CATEGORY_LABELS[issue.category]}</span>
            <span>{STATUS_LABELS[issue.status]}</span>
          </div>
          <div className="font-medium">{issue.location}</div>
          <p className="text-gray-700 text-sm mt-1">{issue.description}</p>
          {issue.photo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={issue.photo_url}
              alt="Фото проблеми"
              className="mt-2 rounded-lg max-h-48 w-full object-cover"
            />
          )}
        </div>
      ))}
    </div>
  );
}
