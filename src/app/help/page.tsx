"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SkeletonList } from "@/components/Skeleton";
import EmptyState from "@/components/EmptyState";
import BackButton from "@/components/BackButton";
import { timeAgo } from "@/lib/time-ago";
import { Plus, MapPin, Phone } from "lucide-react";

interface HelpPost {
  id: string;
  type: "need_help" | "offer_help";
  title: string;
  description: string | null;
  location: string | null;
  contact: string | null;
  created_at: string;
}

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

  if (error) return <div className="text-red-500 text-center py-10 text-sm">{error}</div>;
  if (posts === null) return <SkeletonList count={3} />;

  return (
    <div className="space-y-4">
      <BackButton />
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-slate-900">Допомога</h1>
        <Link
          href="/help/new"
          className="flex items-center gap-1.5 bg-blue-500 text-white px-3.5 py-2 rounded-xl text-sm font-medium active:scale-95 transition-transform"
        >
          <Plus size={16} />
          Додати
        </Link>
      </div>

      {posts.length === 0 && <EmptyState text="Поки немає оголошень" />}

      <div className="space-y-2.5">
        {posts.map((post) => (
          <div key={post.id} className="card">
            <div className="flex items-center justify-between mb-1">
              <span className={`badge ${post.type === "need_help" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                {post.type === "need_help" ? "🆘 Потрібна допомога" : "🤝 Можу допомогти"}
              </span>
            </div>
            <div className="font-semibold text-slate-800 text-sm mt-1">{post.title}</div>
            {post.description && (
              <p className="text-slate-500 text-xs mt-1">{post.description}</p>
            )}
            {post.location && (
              <p className="text-slate-500 text-xs mt-1.5 flex items-center gap-1">
                <MapPin size={12} /> {post.location}
              </p>
            )}
            {post.contact && (
              <p className="text-blue-600 text-xs mt-2 flex items-center gap-1">
                <Phone size={12} /> {post.contact}
              </p>
            )}
            <p className="text-slate-400 text-[11px] mt-2">{timeAgo(post.created_at)}</p>
          </div>
        ))}
      </div>
      <div className="h-4" />
    </div>
  );
}
