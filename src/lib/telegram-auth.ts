import crypto from "crypto";

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

interface VerifiedInitData {
  user: TelegramUser;
  authDate: number;
}

/**
 * Перевіряє підпис Telegram WebApp initData.
 * Алгоритм: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function verifyTelegramInitData(
  initData: string,
  botToken: string,
  maxAgeSeconds = 86400
): VerifiedInitData | null {
  if (!initData) return null;

  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return null;

  params.delete("hash");

  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();

  const computedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  if (computedHash !== hash) return null;

  const authDate = Number(params.get("auth_date") ?? 0);
  const now = Math.floor(Date.now() / 1000);
  if (now - authDate > maxAgeSeconds) return null; // застаріла сесія

  const userRaw = params.get("user");
  if (!userRaw) return null;

  const user = JSON.parse(userRaw) as TelegramUser;
  return { user, authDate };
}

/**
 * Дістає і перевіряє initData з заголовка запиту.
 * Кидає помилку, якщо дані невалідні — використовується в API routes.
 */
export function requireTelegramUser(initDataHeader: string | null): TelegramUser {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) throw new Error("TELEGRAM_BOT_TOKEN не заданий на сервері");
  if (!initDataHeader) throw new Error("UNAUTHORIZED");

  const verified = verifyTelegramInitData(initDataHeader, botToken);
  if (!verified) throw new Error("UNAUTHORIZED");

  return verified.user;
}
