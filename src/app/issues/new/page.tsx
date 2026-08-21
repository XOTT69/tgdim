"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTelegramWebApp, tgFetch } from "@/lib/use-telegram";
import { CATEGORY_LABELS, IssueCategory } from "@/lib/types";
import BackButton from "@/components/BackButton";
import { Send, Camera } from "lucide-react";

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
      <BackButton />
      <h1 className="text-xl font-bold text-slate-900">Нова проблема</h1>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Категорія</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as IssueCategory)}
          className="w-full border border-slate-200 rounded-xl p-3 text-sm bg-slate-50"
        >
          {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Локація (поверх / квартира)</label>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Наприклад: 3 поверх, біля ліфта"
          className="w-full border border-slate-200 rounded-xl p-3 text-sm bg-slate-50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Опис проблеми</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Що сталось?"
          className="w-full border border-slate-200 rounded-xl p-3 text-sm bg-slate-50 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Фото (опційно)</label>
        <label className="flex items-center gap-2 border border-dashed border-slate-300 rounded-xl p-3 cursor-pointer hover:bg-slate-50 transition-colors">
          <Camera size={18} className="text-slate-400" />
          <span className="text-sm text-slate-500">
            {file ? file.name : "Натисніть щоб додати фото"}
          </span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="hidden"
          />
        </label>
      </div>

      {error && <div className="text-red-500 text-sm bg-red-50 rounded-xl p-3">{error}</div>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3.5 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
      >
        <Send size={16} />
        {submitting ? "Надсилання…" : "Надіслати"}
      </button>
    </form>
  );
}
