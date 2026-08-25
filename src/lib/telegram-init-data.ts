import { createHmac, timingSafeEqual } from "node:crypto";

export type VerifiedTelegramUser = {
  id: number;
  firstName: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
};

type TelegramInitUser = { id?: unknown; first_name?: unknown; last_name?: unknown; username?: unknown; photo_url?: unknown };
const MAX_INIT_DATA_AGE_SECONDS = 60 * 60 * 24;
const FUTURE_CLOCK_SKEW_SECONDS = 5 * 60;
export class TelegramInitDataError extends Error {}

export function verifyTelegramInitData(initData: string, botToken: string): VerifiedTelegramUser {
  const params = new URLSearchParams(initData);
  const receivedHash = params.get("hash");
  const authDate = Number(params.get("auth_date"));
  if (!receivedHash || !Number.isSafeInteger(authDate)) throw new TelegramInitDataError("Telegram initData is incomplete.");
  const now = Math.floor(Date.now() / 1000);
  if (authDate > now + FUTURE_CLOCK_SKEW_SECONDS || now - authDate > MAX_INIT_DATA_AGE_SECONDS) throw new TelegramInitDataError("Telegram initData has expired.");
  params.delete("hash");
  const dataCheckString = [...params.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([key, value]) => `${key}=${value}`).join("\n");
  const secretKey = createHmac("sha256", "WebAppData").update(botToken).digest();
  const expectedHash = createHmac("sha256", secretKey).update(dataCheckString).digest("hex");
  const receivedHashBuffer = Buffer.from(receivedHash, "hex");
  const expectedHashBuffer = Buffer.from(expectedHash, "hex");
  if (receivedHashBuffer.length !== expectedHashBuffer.length || !timingSafeEqual(receivedHashBuffer, expectedHashBuffer)) throw new TelegramInitDataError("Telegram initData signature is invalid.");
  const rawUser = params.get("user");
  if (!rawUser) throw new TelegramInitDataError("Telegram user is missing.");
  let user: TelegramInitUser;
  try { user = JSON.parse(rawUser) as TelegramInitUser; } catch { throw new TelegramInitDataError("Telegram user payload is invalid."); }
  if (typeof user.id !== "number" || !Number.isSafeInteger(user.id) || user.id <= 0 || typeof user.first_name !== "string" || user.first_name.length === 0) throw new TelegramInitDataError("Telegram user payload is incomplete.");
  return { id: user.id, firstName: user.first_name.slice(0, 128), lastName: typeof user.last_name === "string" ? user.last_name.slice(0, 128) : undefined, username: typeof user.username === "string" ? user.username.slice(0, 128) : undefined, photoUrl: typeof user.photo_url === "string" ? user.photo_url.slice(0, 2048) : undefined };
}
