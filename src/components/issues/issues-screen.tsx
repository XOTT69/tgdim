"use client";

import { useState } from "react";

import { AuthRequired } from "@/components/auth/auth-required";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, Input, Select, Textarea } from "@/components/ui/form-fields";
import { ListError, ListLoading } from "@/components/ui/feedback";
import { SignedImage } from "@/components/ui/signed-image";
import { ISSUE_CATEGORIES, ISSUE_STATUSES, formatDate } from "@/lib/domain";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { uploadImage } from "@/lib/storage";
import { useAsyncData } from "@/hooks/use-async-data";
import type { BuildingIssue, IssueCategory, IssueStatus } from "@/types/database";

const initialForm = { category: "other" as IssueCategory, location: "", description: "", photo: null as File | null };

export function IssuesScreen() {
  return <AuthRequired><IssuesContent /></AuthRequired>;
}

function IssuesContent() {
  const { profile } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [openForm, setOpenForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const issues = useAsyncData(async () => {
    const client = getSupabaseBrowserClient();
    if (!client) throw new Error("Supabase не налаштовано.");
    const { data, error } = await client.from("issues").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data as BuildingIssue[];
  });

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile) return;
    setSubmitting(true);
    setMessage(null);
    try {
      const client = getSupabaseBrowserClient();
      if (!client) throw new Error("Supabase не налаштовано.");
      const imagePath = form.photo ? await uploadImage("issue-images", "issues", profile.id, form.photo) : null;
      const { error } = await client.from("issues").insert({
        category: form.category,
        location: form.location.trim(),
        description: form.description.trim(),
        image_path: imagePath,
        reporter_id: profile.id,
      });
      if (error) throw error;
      setForm(initialForm);
      setOpenForm(false);
      setMessage("Проблему надіслано. Дякуємо!");
      await issues.refresh();
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Не вдалося надіслати проблему.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3"><p className="text-sm text-[var(--tg-hint-color)]">Несправності та їхній статус</p><Button onClick={() => setOpenForm((value) => !value)}>{openForm ? "Закрити" : "Повідомити"}</Button></div>
      {openForm ? <Card><form className="space-y-3" onSubmit={submit}>
        <Field label="Категорія"><Select onChange={(event) => setForm({ ...form, category: event.target.value as IssueCategory })} value={form.category}>{ISSUE_CATEGORIES.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}</Select></Field>
        <Field label="Під’їзд, поверх або місце"><Input maxLength={200} onChange={(event) => setForm({ ...form, location: event.target.value })} required value={form.location} /></Field>
        <Field label="Опис"><Textarea maxLength={5000} onChange={(event) => setForm({ ...form, description: event.target.value })} required value={form.description} /></Field>
        <Field hint="JPEG, PNG або WebP, до 5 МБ" label="Фото (необов’язково)"><Input accept="image/jpeg,image/png,image/webp" onChange={(event) => setForm({ ...form, photo: event.target.files?.[0] ?? null })} type="file" /></Field>
        <Button disabled={submitting} type="submit">{submitting ? "Надсилаємо…" : "Надіслати проблему"}</Button>
      </form></Card> : null}
      {message ? <p aria-live="polite" className="text-sm text-[var(--tg-link-color)]">{message}</p> : null}
      {issues.loading ? <ListLoading /> : issues.error ? <ListError message={issues.error} onRetry={issues.refresh} /> : issues.data?.length ? <div className="space-y-3">{issues.data.map((issue) => <IssueCard issue={issue} key={issue.id} onChanged={issues.refresh} />)}</div> : <EmptyState description="Будьте першим, хто повідомить про несправність." icon="🔧" title="Проблем ще немає" />}
    </div>
  );
}

function IssueCard({ issue, onChanged }: { issue: BuildingIssue; onChanged: () => Promise<void> }) {
  const { profile } = useAuth();
  const [changing, setChanging] = useState(false);
  const status = ISSUE_STATUSES[issue.status];
  const category = ISSUE_CATEGORIES.find((item) => item.value === issue.category)?.label ?? "Інше";

  async function changeStatus(nextStatus: IssueStatus) {
    setChanging(true);
    try {
      const client = getSupabaseBrowserClient();
      if (!client) throw new Error("Supabase не налаштовано.");
      const { error } = await client.from("issues").update({ status: nextStatus, resolved_at: nextStatus === "resolved" ? new Date().toISOString() : null }).eq("id", issue.id);
      if (error) throw error;
      await onChanged();
    } finally {
      setChanging(false);
    }
  }

  return <Card><div className="flex items-start justify-between gap-3"><div><p className="text-sm text-[var(--tg-hint-color)]">{category}</p><h2 className="mt-1 font-semibold">{issue.location}</h2></div><span className="shrink-0 text-sm">{status.icon} {status.label}</span></div><p className="mt-2 whitespace-pre-wrap text-sm leading-5">{issue.description}</p>{issue.image_path ? <SignedImage alt="Фото проблеми" bucket="issue-images" path={issue.image_path} /> : null}<p className="mt-3 text-xs text-[var(--tg-hint-color)]">{formatDate(issue.created_at)}</p>{profile?.is_admin ? <div className="mt-3 flex flex-wrap gap-2">{(Object.keys(ISSUE_STATUSES) as IssueStatus[]).map((value) => <Button disabled={changing || value === issue.status} key={value} onClick={() => void changeStatus(value)} variant="secondary">{ISSUE_STATUSES[value].label}</Button>)}</div> : null}</Card>;
}
