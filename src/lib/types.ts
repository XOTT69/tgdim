export type IssueCategory =
  | "lighting" | "water" | "waste" | "cleaning" | "doors" | "parking" | "yard" | "other";

export type IssueStatus = "new" | "in_progress" | "resolved";

export interface Issue {
  id: string;
  category: IssueCategory;
  location: string;
  description: string;
  photo_url: string | null;
  status: IssueStatus;
  created_by: number | null;
  created_at: string;
}

export const CATEGORY_LABELS: Record<IssueCategory, string> = {
  lighting: "💡 Освітлення",
  water: "🚰 Вода",
  waste: "🗑 Сміття",
  cleaning: "🧹 Прибирання",
  doors: "🚪 Двері / домофон",
  parking: "🅿️ Паркування / територія",
  yard: "🌳 Двір",
  other: "❓ Інше",
};

export const STATUS_LABELS: Record<IssueStatus, string> = {
  new: "🟡 Нова",
  in_progress: "🔵 В роботі",
  resolved: "🟢 Вирішена",
};
