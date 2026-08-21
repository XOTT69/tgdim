import { NextRequest, NextResponse } from "next/server";
import { requireTelegramUser } from "@/lib/telegram-auth";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const initData = req.headers.get("x-telegram-init-data");
    const tgUser = requireTelegramUser(initData);

    const supabase = supabaseServer();

    // Toggle participation
    const { data: existing } = await supabase
      .from("event_participants")
      .select("id")
      .eq("event_id", eventId)
      .eq("user_id", tgUser.id)
      .single();

    if (existing) {
      // Remove participation
      await supabase
        .from("event_participants")
        .delete()
        .eq("event_id", eventId)
        .eq("user_id", tgUser.id);

      return NextResponse.json({ participating: false });
    } else {
      // Add participation
      const { error } = await supabase
        .from("event_participants")
        .insert({ event_id: eventId, user_id: tgUser.id });

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ participating: true });
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    const status = message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
