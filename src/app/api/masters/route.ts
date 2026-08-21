import { NextRequest, NextResponse } from "next/server";
import { requireTelegramUser } from "@/lib/telegram-auth";
import { supabaseServer } from "@/lib/supabase-server";
import { z } from "zod";

const createSchema = z.object({
  category: z.enum(["plumber", "electrician", "appliance", "cleaning", "locksmith", "other"]),
  name: z.string().min(2).max(200),
  description: z.string().max(1000).optional(),
  contact: z.string().max(200).optional(),
});

export async function GET() {
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("masters")
    .select("*")
    .order("rating_count", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ masters: data });
}

export async function POST(req: NextRequest) {
  try {
    const initData = req.headers.get("x-telegram-init-data");
    const tgUser = requireTelegramUser(initData);

    const parsed = createSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const supabase = supabaseServer();

    await supabase.from("users").upsert({
      telegram_id: tgUser.id,
      first_name: tgUser.first_name,
      last_name: tgUser.last_name,
      username: tgUser.username,
      photo_url: tgUser.photo_url,
    });

    const { data, error } = await supabase
      .from("masters")
      .insert({ ...parsed.data, created_by: tgUser.id })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ master: data }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    const status = message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
