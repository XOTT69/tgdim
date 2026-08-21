import { NextRequest, NextResponse } from "next/server";
import { requireTelegramUser } from "@/lib/telegram-auth";
import { supabaseServer } from "@/lib/supabase-server";
import { z } from "zod";

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: masterId } = await params;
    const initData = req.headers.get("x-telegram-init-data");
    const tgUser = requireTelegramUser(initData);

    const parsed = reviewSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const supabase = supabaseServer();

    // Check if user already reviewed
    const { data: existing } = await supabase
      .from("master_reviews")
      .select("id")
      .eq("master_id", masterId)
      .eq("user_id", tgUser.id)
      .single();

    if (existing) {
      return NextResponse.json({ error: "Ви вже залишали відгук" }, { status: 400 });
    }

    // Insert review
    const { error: reviewError } = await supabase
      .from("master_reviews")
      .insert({
        master_id: masterId,
        user_id: tgUser.id,
        rating: parsed.data.rating,
        comment: parsed.data.comment,
      });

    if (reviewError) return NextResponse.json({ error: reviewError.message }, { status: 500 });

    // Use RPC for atomic increment of rating
    await supabase.rpc("increment_master_rating", {
      master_id_input: masterId,
      rating_input: parsed.data.rating,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    const status = message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
