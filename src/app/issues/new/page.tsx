"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTelegramWebApp, tgFetch } from "@/lib/use-telegram";
import { CATEGORY_LABELS, IssueCategory } from "@/lib/types";

export default function NewIssuePage() {
  const { initData, ready } = useTelegramWebApp();
  const router = useRouter();

  const [category, setCategory] = useState<IssueCategory>("other");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!location.trim() || !description.trim()) {
      setError("Заповніть локацію і опис");
      return;
    }

    setSubmitting(true);
    try {
      let photo_url: string | null = null;

      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await tgFetch(initData, "/api/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadData.error) throw new Error(uploadData.error);
        photo_url = uploadData.url;
      }

      const res = await tgFetch(initData, "/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, location, description, photo_url }),
      });
      const data = await res.json();
      if (data.error) throw new Error(JSON.stringify(data.error));

      router.push("/issues");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Помилка. Спробуйте ще раз");
    } finally {
      setSubmitting(false);
    }
  }

  if (!ready) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h1 className="text-xl font-bold">Нова проблема</h1>

      <div>
        <label className="block text-sm font-medium mb-1">Категорія</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as IssueCategory)}
          className="w-full border rounded-lg p-3"
        >
          {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Локація (підʼїзд/поверх)</label>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Наприклад: 2 підʼїзд, 3 поверх"
          className="w-full border rounded-lg p-3"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Опис проблеми</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Що сталось?"
          className="w-full border rounded-lg p-3"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Фото (опційно)</label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="w-full"
        />
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium disabled:opacity-50"
      >
        {submitting ? "Надсилання…" : "Надіслати"}
      </button>
    </form>
  );
}
