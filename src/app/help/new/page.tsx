"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTelegramWebApp, tgFetch } from "@/lib/use-telegram";
import BackButton from "@/components/BackButton";

export default function NewHelpPage() {
  const { initData, ready } = useTelegramWebApp();
  const router = useRouter();

  const [type, setType] = useState<"need_help" | "offer_help">("need_help");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [contact, setContact] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError("Вкажіть заголовок"); return; }
    setError(null);
    setSubmitting(true);
    try {
      const res = await tgFetch(initData, "/api/help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, title, description: description || undefined, location: location || undefined, contact: contact || undefined }),
      });
      const data = await res.json();
      if (data.error) throw new Error(JSON.stringify(data.error));
      router.push("/help");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Помилка");
    } finally {
      setSubmitting(false);
    }
  }

  if (!ready) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <BackButton />
      <h1 className="text-xl font-bold">Нове оголошення</h1>

      <div>
        <label className="block text-sm font-medium mb-1">Тип</label>
        <select value={type} onChange={(e) => setType(e.target.value as "need_help" | "offer_help")} className="w-full border rounded-lg p-3">
          <option value="need_help">🆘 Потрібна допомога</option>
          <option value="offer_help">🤝 Можу допомогти</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Заголовок</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Коротко про що" className="w-full border rounded-lg p-3" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Опис</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Деталі..." className="w-full border rounded-lg p-3" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Де (опційно)</label>
        <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Під'їзд, поверх" className="w-full border rounded-lg p-3" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Контакт</label>
        <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Телефон або @username" className="w-full border rounded-lg p-3" />
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      <button type="submit" disabled={submitting} className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium disabled:opacity-50">
        {submitting ? "Надсилання…" : "Надіслати"}
      </button>
    </form>
  );
}
