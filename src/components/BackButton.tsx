"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="flex items-center gap-1 text-blue-600 text-sm font-medium mb-3 active:opacity-60"
    >
      <span>←</span>
      <span>Назад</span>
    </button>
  );
}
