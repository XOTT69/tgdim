import { NextRequest, NextResponse } from "next/server";
import { requireTelegramUser } from "@/lib/telegram-auth";
import { isAdmin } from "@/lib/admins";
import { supabaseServer } from "@/lib/supabase-server";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  event_date: z.string().datetime(),
  location: z.string().max(200).optional(),
});

export async function GET() {
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .gte("event_date", new Date().toISOString())
    .order("event_date", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ events: data });
}

export async function POST(req: NextRequest) {
  try {
    const initData = req.headers.get("x-telegram-init-data");
    const tgUser = requireTelegramUser(initData);

    if (!isAdmin(tgUser.id)) {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }

    const parsed = createSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from("events")
      .insert({ ...parsed.data, organizer_id: tgUser.id })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ event: data }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    const status = message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
