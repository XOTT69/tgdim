"use client";

import { useEffect, useState } from "react";
import { SkeletonList } from "@/components/Skeleton";
import EmptyState from "@/components/EmptyState";
import { useTelegramWebApp, tgFetch } from "@/lib/use-telegram";
import { timeAgo } from "@/lib/time-ago";
import { Check } from "lucide-react";

interface PollOption {
  id: string;
  text: string;
  votes_count: number;
}

interface Poll {
  id: string;
  question: string;
  is_multiple: boolean;
  closes_at: string | null;
  created_at: string;
  options: PollOption[];
  user_voted: boolean;
  user_votes: string[];
}

export default function PollsPage() {
  const { initData, ready } = useTelegramWebApp();
  const [polls, setPolls] = useState<Poll[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [voting, setVoting] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    tgFetch(initData, "/api/polls")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setPolls(d.polls);
      })
      .catch(() => setError("Не вдалось завантажити"));
  }, [ready, initData]);

  async function handleVote(pollId: string, optionId: string) {
    if (!initData || voting) return;
    setVoting(pollId);
    try {
      const res = await tgFetch(initData, `/api/polls/${pollId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ option_ids: [optionId] }),
      });
      const data = await res.json();
      if (data.error) {
        alert(typeof data.error === "string" ? data.error : "Помилка голосування");
      } else {
        // Refresh polls
        const refreshRes = await tgFetch(initData, "/api/polls");
        const refreshData = await refreshRes.json();
        if (refreshData.polls) setPolls(refreshData.polls);
      }
    } catch {
      alert("Помилка мережі");
    } finally {
      setVoting(null);
    }
  }

  if (!ready || polls === null) return <SkeletonList count={2} />;
  if (error) return <div className="text-red-500 text-center py-10 text-sm">{error}</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-900">🗳 Голосування</h1>

      {polls.length === 0 && <EmptyState text="Активних опитувань немає" />}

      <div className="space-y-3">
        {polls.map((poll) => {
          const totalVotes = poll.options.reduce((sum, o) => sum + o.votes_count, 0);
          const isClosed = poll.closes_at ? new Date(poll.closes_at) < new Date() : false;
          const canVote = !poll.user_voted && !isClosed;

          return (
            <div key={poll.id} className="card !p-5">
              <div className="font-semibold text-slate-800">{poll.question}</div>
              {isClosed && (
                <span className="badge bg-red-50 text-red-600 mt-1">Завершено</span>
              )}

              <div className="mt-4 space-y-2">
                {poll.options.map((opt) => {
                  const pct = totalVotes > 0 ? Math.round((opt.votes_count / totalVotes) * 100) : 0;
                  const isUserVote = poll.user_votes?.includes(opt.id);

                  return (
                    <button
                      key={opt.id}
                      onClick={() => canVote && handleVote(poll.id, opt.id)}
                      disabled={!canVote || voting === poll.id}
                      className={`relative w-full text-left rounded-xl overflow-hidden transition-all ${
                        canVote ? "active:scale-[0.98] cursor-pointer" : "cursor-default"
                      } ${isUserVote ? "ring-2 ring-blue-400" : ""}`}
                    >
                      <div
                        className="absolute inset-0 bg-blue-50 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                      <div className="relative flex items-center justify-between px-3.5 py-2.5">
                        <span className="text-sm text-slate-700 flex items-center gap-1.5">
                          {isUserVote && <Check size={14} className="text-blue-500" />}
                          {opt.text}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">{pct}%</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between mt-3">
                <span className="text-[11px] text-slate-400">Голосів: {totalVotes}</span>
                <span className="text-[11px] text-slate-400">{timeAgo(poll.created_at)}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="h-4" />
    </div>
  );
}
