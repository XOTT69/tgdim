import { NextRequest, NextResponse } from "next/server";
import { requireTelegramUser } from "@/lib/telegram-auth";
import { supabaseServer } from "@/lib/supabase-server";
import { z } from "zod";

const voteSchema = z.object({
  option_ids: z.array(z.string().uuid()).min(1),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pollId } = await params;
    const initData = req.headers.get("x-telegram-init-data");
    const tgUser = requireTelegramUser(initData);

    const parsed = voteSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const supabase = supabaseServer();

    // Check poll exists and is open
    const { data: poll, error: pollError } = await supabase
      .from("polls")
      .select("*")
      .eq("id", pollId)
      .single();

    if (pollError || !poll) {
      return NextResponse.json({ error: "Опитування не знайдено" }, { status: 404 });
    }

    if (poll.closes_at && new Date(poll.closes_at) < new Date()) {
      return NextResponse.json({ error: "Опитування завершено" }, { status: 400 });
    }

    // Check if user already voted
    const { data: existingVotes } = await supabase
      .from("poll_votes")
      .select("id")
      .eq("poll_id", pollId)
      .eq("user_id", tgUser.id);

    if (existingVotes && existingVotes.length > 0) {
      return NextResponse.json({ error: "Ви вже проголосували" }, { status: 400 });
    }

    // Validate options belong to this poll
    const { data: validOptions } = await supabase
      .from("poll_options")
      .select("id")
      .eq("poll_id", pollId)
      .in("id", parsed.data.option_ids);

    if (!validOptions || validOptions.length !== parsed.data.option_ids.length) {
      return NextResponse.json({ error: "Невалідні варіанти відповіді" }, { status: 400 });
    }

    // If single-choice, only allow one option
    if (!poll.is_multiple && parsed.data.option_ids.length > 1) {
      return NextResponse.json({ error: "Можна обрати лише один варіант" }, { status: 400 });
    }

    // Insert votes
    const votes = parsed.data.option_ids.map((optionId) => ({
      poll_id: pollId,
      option_id: optionId,
      user_id: tgUser.id,
    }));

    const { error: insertError } = await supabase.from("poll_votes").insert(votes);
    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

    // Increment vote counts
    for (const optionId of parsed.data.option_ids) {
      await supabase.rpc("increment_vote_count", { option_id_input: optionId });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    const status = message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
