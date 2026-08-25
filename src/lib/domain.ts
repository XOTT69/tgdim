import type { IssueCategory, IssueStatus } from "@/types/database";

export const ISSUE_CATEGORIES: Array<{ value: IssueCategory; label: string }> = [
  { value: "lighting", label: "💡 Освітлення" },
  { value: "water", label: "🚰 Вода" },
  { value: "waste", label: "🗑 Сміття" },
  { value: "cleaning", label: "🧹 Прибирання" },
  { value: "doors_intercom", label: "🚪 Двері / домофон" },
  { value: "parking_territory", label: "🅿️ Паркування / територія" },
  { value: "yard_common_area", label: "🌳 Двір / спільна зона" },
  { value: "other", label: "❓ Інше" },
];

export const ISSUE_STATUSES: Record<IssueStatus, { label: string; icon: string }> = {
  new: { label: "Нова", icon: "🟡" },
  in_progress: { label: "В роботі", icon: "🔵" },
  resolved: { label: "Вирішено", icon: "🟢" },
};

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("uk-UA", { dateStyle: "medium" }).format(new Date(value));
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("uk-UA", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
