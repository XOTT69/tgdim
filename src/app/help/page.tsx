"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Loader from "@/components/Loader";
import EmptyState from "@/components/EmptyState";
import BackButton from "@/components/BackButton";

interface HelpPost {
  id: string;
  type: "need_help" | "offer_help";
  title: string;
  description: string | null;
  location: string | null;
  contact: string | null;
  created_at: string;
}

const TYPE_LABELS = {
  need_help: "🆘 Потрібна допомога",
  offer_help: "🤝 Можу допомогти",
};

export default function HelpPage() {
  const [posts, setPosts] = useState<HelpPost[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/help")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setPosts(d.posts);
      })
      .catch(() => setError("Не вдалось завантажити"));
  }, []);

  if (error) return <div className="text-red-500 text-center py-10">{error}</div>;
  if (posts === null) return <Loader />;

  return (
    <div className="space-y-3">
      <BackButton />
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">🤝 Допомога</h1>
        <Link
          href="/help/new"
          className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium"
        >
          + Додати
        </Link>
      </div>

      {posts.length === 0 && <EmptyState text="Поки немає оголошень" />}

      {posts.map((post) => (
        <div key={post.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div className="font-semibold">{post.title}</div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              post.type === "need_help" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
            }`}>
              {TYPE_LABELS[post.type]}
            </span>
          </div>
          {post.description && (
            <p className="text-gray-700 text-sm mt-1">{post.description}</p>
          )}
          {post.location && (
            <p className="text-gray-500 text-xs mt-1">📍 {post.location}</p>
          )}
          {post.contact && (
            <p className="text-blue-600 text-xs mt-2">📞 {post.contact}</p>
          )}
          <div className="text-xs text-gray-400 mt-2">
            {new Date(post.created_at).toLocaleDateString("uk-UA")}
          </div>
        </div>
      ))}
      <div className="h-16" />
    </div>
  );
}
