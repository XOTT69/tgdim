"use client";

import { useMemo, useState } from "react";

import { AuthRequired } from "@/components/auth/auth-required";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, Input, Textarea } from "@/components/ui/form-fields";
import { ListError, ListLoading } from "@/components/ui/feedback";
import { formatDateTime } from "@/lib/domain";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useAsyncData } from "@/hooks/use-async-data";
import type { Poll, PollOption, PollVote } from "@/types/database";

type PollData = { polls: Poll[]; options: PollOption[]; votes: PollVote[] };
type PollResult = { option_id: string; votes: number };

export function PollsScreen() { return <AuthRequired><PollsContent /></AuthRequired>; }

function PollsContent() {
  const { profile } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [closesAt, setClosesAt] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const data = useAsyncData(async () => {
    const client = getSupabaseBrowserClient(); if (!client) throw new Error("Supabase не налаштовано.");
    const [pollsResponse, optionsResponse, votesResponse] = await Promise.all([
      client.from("polls").select("*").order("created_at", { ascending: false }),
      client.from("poll_options").select("*").order("position"),
      client.from("poll_votes").select("*"),
    ]);
    if (pollsResponse.error) throw pollsResponse.error; if (optionsResponse.error) throw optionsResponse.error; if (votesResponse.error) throw votesResponse.error;
    return { polls: pollsResponse.data as Poll[], options: optionsResponse.data as PollOption[], votes: votesResponse.data as PollVote[] };
  });
  async function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!profile) return;
    const validOptions = options.map((option) => option.trim()).filter(Boolean);
    if (validOptions.length < 2) { setMessage("Додайте щонайменше два варіанти."); return; }
    setPending(true); setMessage(null);
    try {
      const client = getSupabaseBrowserClient(); if (!client) throw new Error("Supabase не налаштовано.");
      const { data: poll, error } = await client.from("polls").insert({ question: question.trim(), closes_at: closesAt ? new Date(closesAt).toISOString() : null, author_id: profile.id }).select("id").single();
      if (error) throw error;
      const { error: optionsError } = await client.from("poll_options").insert(validOptions.map((label, position) => ({ poll_id: (poll as { id: string }).id, label, position })));
      if (optionsError) throw optionsError;
      setQuestion(""); setOptions(["", ""]); setClosesAt(""); setShowForm(false); setMessage("Голосування опубліковано."); await data.refresh();
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : "Не вдалося створити голосування."); } finally { setPending(false); }
  }
  return <div className="space-y-4"><div className="flex items-center justify-between gap-3"><p className="text-sm text-[var(--tg-hint-color)]">Один голос від кожного мешканця</p>{profile?.is_admin ? <Button onClick={() => setShowForm((value) => !value)}>{showForm ? "Закрити" : "Створити"}</Button> : null}</div>{showForm ? <Card><form className="space-y-3" onSubmit={create}><Field label="Питання"><Textarea maxLength={500} onChange={(event) => setQuestion(event.target.value)} required value={question} /></Field>{options.map((option, index) => <Field key={index} label={`Варіант ${index + 1}`}><div className="flex gap-2"><Input maxLength={300} onChange={(event) => setOptions(options.map((value, current) => current === index ? event.target.value : value))} required={index < 2} value={option} />{index > 1 ? <Button aria-label="Видалити варіант" onClick={() => setOptions(options.filter((_, current) => current !== index))} variant="ghost">×</Button> : null}</div></Field>)}<Button onClick={() => setOptions([...options, ""])} variant="secondary">Додати варіант</Button><Field label="Завершити о (необов’язково)"><Input onChange={(event) => setClosesAt(event.target.value)} type="datetime-local" value={closesAt} /></Field><Button disabled={pending} type="submit">{pending ? "Створюємо…" : "Опублікувати"}</Button></form></Card> : null}{message ? <p aria-live="polite" className="text-sm text-[var(--tg-link-color)]">{message}</p> : null}{data.loading ? <ListLoading /> : data.error ? <ListError message={data.error} onRetry={data.refresh} /> : data.data?.polls.length ? <div className="space-y-3">{data.data.polls.map((poll) => <PollCard data={data.data!} key={poll.id} poll={poll} refresh={data.refresh} />)}</div> : <EmptyState description="Коли адміністратор створить голосування, воно з’явиться тут." icon="🗳" title="Активних голосувань немає" />}</div>;
}

function PollCard({ poll, data, refresh }: { poll: Poll; data: PollData; refresh: () => Promise<void> }) {
  const { profile } = useAuth();
  const [pending, setPending] = useState(false);
  const options = useMemo(() => data.options.filter((option) => option.poll_id === poll.id), [data.options, poll.id]);
  const ownVote = data.votes.find((vote) => vote.poll_id === poll.id && vote.voter_id === profile?.id);
  const isClosed = poll.is_closed || (poll.closes_at ? new Date(poll.closes_at) <= new Date() : false);
  const [results, setResults] = useState<PollResult[] | null>(null);
  const canSeeResults = Boolean(ownVote) || isClosed || profile?.is_admin;
  async function vote(optionId: string) {
    if (!profile) return; setPending(true);
    try { const client = getSupabaseBrowserClient(); if (!client) throw new Error("Supabase не налаштовано."); const { error } = await client.from("poll_votes").insert({ poll_id: poll.id, option_id: optionId, voter_id: profile.id }); if (error) throw error; await refresh(); } finally { setPending(false); }
  }
  async function loadResults() {
    const client = getSupabaseBrowserClient(); if (!client) return;
    const { data: resultData, error } = await client.rpc("get_poll_results", { checked_poll_id: poll.id });
    if (!error) setResults(resultData as PollResult[]);
  }
  async function close() {
    const client = getSupabaseBrowserClient(); if (!client) return;
    const { error } = await client.from("polls").update({ is_closed: true }).eq("id", poll.id); if (!error) await refresh();
  }
  const total = results?.reduce((sum, result) => sum + Number(result.votes), 0) ?? 0;
  return <Card><h2 className="font-semibold">{poll.question}</h2>{poll.closes_at ? <p className="mt-1 text-xs text-[var(--tg-hint-color)]">До {formatDateTime(poll.closes_at)}</p> : null}<div className="mt-3 space-y-2">{options.map((option) => <Button className="w-full justify-start" disabled={Boolean(ownVote) || isClosed || pending} key={option.id} onClick={() => void vote(option.id)} variant={ownVote?.option_id === option.id ? "primary" : "secondary"}>{option.label}</Button>)}</div>{ownVote ? <p className="mt-3 text-sm text-[var(--tg-link-color)]">Ваш голос враховано.</p> : null}{canSeeResults ? <div className="mt-3">{results ? <div className="space-y-1 text-sm">{options.map((option) => { const count = Number(results.find((item) => item.option_id === option.id)?.votes ?? 0); return <p key={option.id}>{option.label}: <strong>{count}</strong>{total ? ` (${Math.round(count / total * 100)}%)` : ""}</p>; })}</div> : <Button onClick={() => void loadResults()} variant="ghost">Показати результати</Button>}</div> : null}{profile?.is_admin && !poll.is_closed ? <Button className="mt-3" onClick={() => void close()} variant="ghost">Закрити голосування</Button> : null}</Card>;
}
