import { NextResponse } from "next/server";

import { getServerAuthConfig, getTelegramAdminIds } from "@/lib/env";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { TelegramInitDataError, verifyTelegramInitData } from "@/lib/telegram-auth";

export const runtime = "nodejs";

type BootstrapRequest = { initData?: unknown };

export async function POST(request: Request) {
  let body: BootstrapRequest;
  try {
    body = (await request.json()) as BootstrapRequest;
  } catch {
    return NextResponse.json({ error: "Некоректний запит." }, { status: 400 });
  }

  if (typeof body.initData !== "string" || body.initData.length === 0 || body.initData.length > 8_192) {
    return NextResponse.json({ error: "Не вдалося отримати дані Telegram." }, { status: 400 });
  }

  try {
    const { botToken } = getServerAuthConfig();
    const telegramUser = verifyTelegramInitData(body.initData, botToken);
    const admin = getSupabaseAdminClient();
    const email = `telegram-${telegramUser.id}@tgdim.invalid`;
    const isAdmin = getTelegramAdminIds().has(String(telegramUser.id));
    const metadata = {
      telegram_id: String(telegramUser.id),
      first_name: telegramUser.firstName,
      last_name: telegramUser.lastName ?? null,
      username: telegramUser.username ?? null,
      photo_url: telegramUser.photoUrl ?? null,
    };
    const { data, error } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { data: metadata },
    });

    if (error || !data) {
      console.error("Supabase magic link generation failed", error);
      return NextResponse.json({ error: "Не вдалося створити сесію. Спробуйте ще раз." }, { status: 502 });
    }

    const { error: profileError } = await admin.from("profiles").upsert(
      {
        id: data.user.id,
        telegram_id: telegramUser.id,
        first_name: telegramUser.firstName,
        last_name: telegramUser.lastName ?? null,
        username: telegramUser.username ?? null,
        photo_url: telegramUser.photoUrl ?? null,
        is_admin: isAdmin,
      },
      { onConflict: "id" },
    );

    if (profileError) {
      console.error("Supabase profile sync failed", profileError);
      return NextResponse.json({ error: "Не вдалося оновити профіль. Спробуйте ще раз." }, { status: 502 });
    }

    return NextResponse.json({
      email,
      tokenHash: data.properties.hashed_token,
    });
  } catch (error) {
    if (error instanceof TelegramInitDataError) {
      return NextResponse.json({ error: "Не вдалося підтвердити дані Telegram." }, { status: 401 });
    }

    console.error("Telegram bootstrap failed", error);
    return NextResponse.json({ error: "Сервіс тимчасово недоступний." }, { status: 503 });
  }
}
