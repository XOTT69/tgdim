import { NextRequest, NextResponse } from "next/server";
import { requireTelegramUser } from "@/lib/telegram-auth";
import { isAdmin } from "@/lib/admins";
import { supabaseServer } from "@/lib/supabase-server";
import { z } from "zod";

const createPollSchema = z.object({
  question: z.string().min(3).max(500),
  options: z.array(z.string().min(1).max(200)).min(2).max(10),
  is_multiple: z.boolean().optional().default(false),
  closes_at: z.string().datetime().nullable().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const initData = req.headers.get("x-telegram-init-data");
    let userId: number | null = null;
    try {
      const user = requireTelegramUser(initData);
      userId = user.id;
    } catch {
      // Allow unauthenticated GET for viewing polls
    }

    const supabase = supabaseServer();

    const { data: polls, error } = await supabase
      .from("polls")
      .select("*, poll_options(*)")
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Get user votes if authenticated
    let userVotes: Record<string, string[]> = {};
    if (userId) {
      const { data: votes } = await supabase
        .from("poll_votes")
        .select("poll_id, option_id")
        .eq("user_id", userId);

      if (votes) {
        for (const v of votes) {
          if (!userVotes[v.poll_id]) userVotes[v.poll_id] = [];
          userVotes[v.poll_id].push(v.option_id);
        }
      }
    }

    const result = (polls ?? []).map((poll) => ({
      id: poll.id,
      question: poll.question,
      is_multiple: poll.is_multiple,
      closes_at: poll.closes_at,
      created_at: poll.created_at,
      options: (poll.poll_options ?? []).map((o: { id: string; option_text: string; votes_count: number }) => ({
        id: o.id,
        text: o.option_text,
        votes_count: o.votes_count,
      })),
      user_voted: !!userVotes[poll.id]?.length,
      user_votes: userVotes[poll.id] ?? [],
    }));

    return NextResponse.json({ polls: result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const initData = req.headers.get("x-telegram-init-data");
    const tgUser = requireTelegramUser(initData);

    if (!isAdmin(tgUser.id)) {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }

    const parsed = createPollSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const supabase = supabaseServer();

    const { data: poll, error: pollError } = await supabase
      .from("polls")
      .insert({
        question: parsed.data.question,
        is_multiple: parsed.data.is_multiple,
        closes_at: parsed.data.closes_at ?? null,
        created_by: tgUser.id,
      })
      .select()
      .single();

    if (pollError) return NextResponse.json({ error: pollError.message }, { status: 500 });

    const options = parsed.data.options.map((optionText) => ({
      poll_id: poll.id,
      option_text: optionText,
      votes_count: 0,
    }));

    const { error: optError } = await supabase.from("poll_options").insert(options);
    if (optError) return NextResponse.json({ error: optError.message }, { status: 500 });

    return NextResponse.json({ poll }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    const status = message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
