"use client";

import { useEffect, useState } from "react";
import { useTelegramWebApp, tgFetch } from "@/lib/use-telegram";
import { SkeletonList } from "@/components/Skeleton";
import Avatar from "@/components/Avatar";
import { Building2, Check, LogOut } from "lucide-react";

interface Profile {
  telegram_id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  apartment?: string | null;
}

export default function ProfilePage() {
  const { user, initData, ready } = useTelegramWebApp();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [apartment, setApartment] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !initData) return;
    tgFetch(initData, "/api/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.profile) {
          setProfile(d.profile);
          setApartment(d.profile.apartment || "");
        }
      })
      .catch(() => {});
  }, [ready, initData]);

  async function handleSave() {
    if (!initData) return;
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await tgFetch(initData, "/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apartment: apartment.trim() || undefined }),
      });
      const data = await res.json();
      if (data.error) throw new Error(JSON.stringify(data.error));
      setProfile(data.profile);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Помилка збереження");
    } finally {
      setSaving(false);
    }
  }

  if (!ready) return <SkeletonList count={2} />;

  if (!user) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <LogOut size={24} className="text-slate-400" />
        </div>
        <p className="text-slate-500 text-sm">
          Відкрийте застосунок через Telegram
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-slate-900">Профіль</h1>

      {/* User card */}
      <div className="card !p-5">
        <div className="flex items-center gap-4">
          <Avatar name={user.first_name} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-slate-900 text-lg truncate">
              {user.first_name}
            </div>
            {user.username && (
              <div className="text-sm text-slate-500">@{user.username}</div>
            )}
            <div className="text-xs text-slate-400 mt-0.5">ID: {user.id}</div>
          </div>
        </div>
      </div>

      {/* Apartment settings */}
      <div className="card !p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Building2 size={18} className="text-blue-500" />
          <h2 className="font-semibold text-slate-800">Моя квартира</h2>
        </div>

        <div>
          <label className="block text-sm text-slate-600 mb-1.5">Номер квартири</label>
          <input
            type="text"
            value={apartment}
            onChange={(e) => setApartment(e.target.value)}
            placeholder="Напр. 42"
            className="w-full border border-slate-200 rounded-xl p-3 text-sm bg-slate-50 focus:bg-white"
          />
        </div>

        {error && <p className="text-red-500 text-xs">{error}</p>}

        <button
          onClick={handleSave}
          disabled={saving}
          className={`w-full py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
            saved
              ? "bg-green-500 text-white"
              : "bg-blue-500 text-white active:bg-blue-600 disabled:opacity-50"
          }`}
        >
          {saved ? (
            <>
              <Check size={16} />
              Збережено!
            </>
          ) : saving ? (
            "Збереження..."
          ) : (
            "Зберегти"
          )}
        </button>
      </div>

      {/* Stats */}
      {profile && (
        <div className="card !p-4">
          <p className="text-xs text-slate-400">
            Зареєстровано: {profile.telegram_id ? "✓" : "–"}
          </p>
        </div>
      )}

      <div className="h-4" />
    </div>
  );
}
