"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center gap-0.5 text-blue-600 text-sm font-medium mb-2 -ml-1 px-2 py-1 rounded-lg active:bg-blue-50 transition-colors"
    >
      <ChevronLeft size={18} />
      <span>Назад</span>
    </button>
  );
}
