export function isAdmin(telegramId: number): boolean {
  const ids = (process.env.ADMIN_TELEGRAM_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map(Number);
  return ids.includes(telegramId);
}
