"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTelegramWebApp, tgFetch } from "@/lib/use-telegram";
import BackButton from "@/components/BackButton";

export default function NewFoundLostPage() {
  const { initData, ready } = useTelegramWebApp();
  const router = useRouter();

  const [type, setType] = useState<"found" | "lost">("found");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [contactMethod, setContactMethod] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError("Вкажіть назву"); return; }
    setError(null);
    setSubmitting(true);
    try {
      const res = await tgFetch(initData, "/api/found-lost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, title, description: description || undefined, location: location || undefined, contact_method: contactMethod || undefined }),
      });
      const data = await res.json();
      if (data.error) throw new Error(JSON.stringify(data.error));
      router.push("/found-lost");
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
      <h1 className="text-xl font-bold">Нова знахідка / втрата</h1>

      <div>
        <label className="block text-sm font-medium mb-1">Тип</label>
        <select value={type} onChange={(e) => setType(e.target.value as "found" | "lost")} className="w-full border rounded-lg p-3">
          <option value="found">✅ Знайдено</option>
          <option value="lost">❌ Загублено</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Назва</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Що знайдено/загублено?" className="w-full border rounded-lg p-3" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Опис</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Деталі..." className="w-full border rounded-lg p-3" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Де знайдено / загублено</label>
        <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Біля під'їзду 2" className="w-full border rounded-lg p-3" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Контакт</label>
        <input value={contactMethod} onChange={(e) => setContactMethod(e.target.value)} placeholder="Телефон або @username" className="w-full border rounded-lg p-3" />
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      <button type="submit" disabled={submitting} className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium disabled:opacity-50">
        {submitting ? "Надсилання…" : "Надіслати"}
      </button>
    </form>
  );
}
