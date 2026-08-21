"use client";

import { useTelegramWebApp } from "@/lib/use-telegram";
import Loader from "@/components/Loader";

export default function ProfilePage() {
  const { user, ready } = useTelegramWebApp();

  if (!ready) return <Loader />;

  if (!user) {
    return (
      <div className="text-center py-10 text-gray-500">
        Відкрийте застосунок через Telegram для автентифікації.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">👤 Профіль</h1>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-xl font-bold text-blue-600">
            {user.first_name.charAt(0)}
          </div>
          <div>
            <div className="font-semibold">{user.first_name}</div>
            {user.username && (
              <div className="text-sm text-gray-500">@{user.username}</div>
            )}
            <div className="text-xs text-gray-400">ID: {user.id}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-3">
        <h2 className="font-semibold text-gray-700">Дані мешканця</h2>
        <div>
          <label className="block text-sm text-gray-500 mb-1">Під&apos;їзд</label>
          <input
            type="text"
            placeholder="Номер під'їзду"
            className="w-full border rounded-lg p-3 text-sm"
            disabled
          />
        </div>
        <div>
          <label className="block text-sm text-gray-500 mb-1">Квартира</label>
          <input
            type="text"
            placeholder="Номер квартири"
            className="w-full border rounded-lg p-3 text-sm"
            disabled
          />
        </div>
        <p className="text-xs text-gray-400">
          Редагування профілю буде доступне у наступному оновленні.
        </p>
      </div>
    </div>
  );
}
