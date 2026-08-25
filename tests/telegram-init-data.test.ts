import { createHmac } from "node:crypto";

import { describe, expect, it } from "vitest";

import { TelegramInitDataError, verifyTelegramInitData } from "../src/lib/telegram-init-data";

const botToken = "123456:test-token";

function makeInitData(overrides: Record<string, string> = {}) {
  const values = new URLSearchParams({ auth_date: String(Math.floor(Date.now() / 1000)), query_id: "AAEAAAE", user: JSON.stringify({ id: 42, first_name: "Олена", username: "olena" }), ...overrides });
  const check = [...values.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([key, value]) => `${key}=${value}`).join("\n");
  const secret = createHmac("sha256", "WebAppData").update(botToken).digest();
  values.set("hash", createHmac("sha256", secret).update(check).digest("hex"));
  return values.toString();
}

describe("verifyTelegramInitData", () => {
  it("accepts a correctly signed Telegram payload", () => {
    expect(verifyTelegramInitData(makeInitData(), botToken)).toMatchObject({ id: 42, firstName: "Олена", username: "olena" });
  });
  it("rejects a payload whose signature was tampered with", () => {
    const tampered = makeInitData().replace("%D0%9E%D0%BB%D0%B5%D0%BD%D0%B0", "%D0%86%D1%80%D0%B8%D0%BD%D0%B0");
    expect(() => verifyTelegramInitData(tampered, botToken)).toThrow(TelegramInitDataError);
  });
  it("rejects expired init data even when it has a valid signature", () => {
    expect(() => verifyTelegramInitData(makeInitData({ auth_date: String(Math.floor(Date.now() / 1000) - 90_000) }), botToken)).toThrow(TelegramInitDataError);
  });
});
