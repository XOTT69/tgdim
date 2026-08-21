"use client";

import { useEffect, useState } from "react";
import Loader from "@/components/Loader";
import EmptyState from "@/components/EmptyState";
import { useTelegramWebApp, tgFetch } from "@/lib/use-telegram";

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
}

export default function PollsPage() {
  const { initData, ready } = useTelegramWebApp();
  const [polls, setPolls] = useState<Poll[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    tgFetch(initData, "/api/polls")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setPolls(d.polls);
      })
      .catch(() => setError("Не вдалось завантажити опитування"));
  }, [ready, initData]);

  if (!ready || polls === null) return <Loader />;
  if (error) return <div className="text-red-500 text-center py-10">{error}</div>;

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold">🗳 Голосування</h1>

      {polls.length === 0 && <EmptyState text="Активних опитувань немає" />}

      {polls.map((poll) => {
        const totalVotes = poll.options.reduce((sum, o) => sum + o.votes_count, 0);
        const isClosed = poll.closes_at ? new Date(poll.closes_at) < new Date() : false;

        return (
          <div key={poll.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="font-semibold">{poll.question}</div>
            {isClosed && <span className="text-xs text-red-500">Завершено</span>}

            <div className="mt-3 space-y-2">
              {poll.options.map((opt) => {
                const pct = totalVotes > 0 ? Math.round((opt.votes_count / totalVotes) * 100) : 0;
                return (
                  <div key={opt.id} className="relative">
                    <div
                      className="absolute inset-0 bg-blue-50 rounded"
                      style={{ width: `${pct}%` }}
                    />
                    <div className="relative flex justify-between px-3 py-2 text-sm">
                      <span>{opt.text}</span>
                      <span className="text-gray-500">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="text-xs text-gray-400 mt-2">Голосів: {totalVotes}</div>
          </div>
        );
      })}
    </div>
  );
}
