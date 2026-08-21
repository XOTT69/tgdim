"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTelegramWebApp, tgFetch } from "@/lib/use-telegram";
import BackButton from "@/components/BackButton";

const CATEGORIES = [
  { value: "plumber", label: "🔧 Сантехнік" },
  { value: "electrician", label: "⚡ Електрик" },
  { value: "appliance", label: "🔌 Побутова техніка" },
  { value: "cleaning", label: "🧹 Клінінг" },
  { value: "locksmith", label: "🔐 Замки / двері" },
  { value: "other", label: "🛠 Інше" },
];

export default function NewMasterPage() {
  const { initData, ready } = useTelegramWebApp();
  const router = useRouter();

  const [category, setCategory] = useState("plumber");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [contact, setContact] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Вкажіть ім'я/назву"); return; }
    setError(null);
    setSubmitting(true);
    try {
      const res = await tgFetch(initData, "/api/masters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, name, description: description || undefined, contact: contact || undefined }),
      });
      const data = await res.json();
      if (data.error) throw new Error(JSON.stringify(data.error));
      router.push("/masters");
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
      <h1 className="text-xl font-bold">Рекомендувати майстра</h1>

      <div>
        <label className="block text-sm font-medium mb-1">Категорія</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border rounded-lg p-3">
          {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Ім&apos;я / Назва</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Іван Петренко" className="w-full border rounded-lg p-3" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Опис</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Чим займається, досвід..." className="w-full border rounded-lg p-3" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Контакт</label>
        <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Телефон або @username" className="w-full border rounded-lg p-3" />
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      <button type="submit" disabled={submitting} className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium disabled:opacity-50">
        {submitting ? "Надсилання…" : "Рекомендувати"}
      </button>
    </form>
  );
}
