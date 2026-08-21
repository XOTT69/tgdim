import { NextRequest, NextResponse } from "next/server";
import { requireTelegramUser } from "@/lib/telegram-auth";
import { isAdmin } from "@/lib/admins";
import { supabaseServer } from "@/lib/supabase-server";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(2).max(200),
  body: z.string().min(2).max(4000),
  image_url: z.string().url().nullable().optional(),
  expires_at: z.string().datetime().nullable().optional(),
});

export async function GET() {
  const supabase = supabaseServer();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order("published_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ announcements: data });
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
      .from("announcements")
      .insert({ ...parsed.data, created_by: tgUser.id })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ announcement: data }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: message === "UNAUTHORIZED" ? 401 : 500 });
  }
}
