create type public.moderation_content_type as enum ('found_lost', 'help_post', 'master_recommendation');

create table public.moderation_records (
  content_type public.moderation_content_type not null,
  content_id uuid not null,
  is_hidden boolean not null default false,
  reason text check (reason is null or char_length(reason) <= 500),
  moderator_id uuid not null references public.profiles(id) on delete restrict,
  updated_at timestamptz not null default now(),
  primary key (content_type, content_id)
);

create function public.is_content_hidden(
  checked_type public.moderation_content_type,
  checked_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((
    select is_hidden
    from public.moderation_records
    where content_type = checked_type and content_id = checked_id
  ), false);
$$;

create trigger moderation_records_updated_at before update on public.moderation_records for each row execute procedure public.set_updated_at();

alter table public.moderation_records enable row level security;

create policy "admins manage moderation records" on public.moderation_records for all to authenticated using (public.is_admin()) with check (public.is_admin() and moderator_id = auth.uid());

drop policy "votes are visible to residents" on public.poll_votes;
create policy "residents view own votes" on public.poll_votes for select to authenticated using (voter_id = auth.uid() or public.is_admin());

create function public.get_poll_results(checked_poll_id uuid)
returns table (option_id uuid, votes bigint)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.polls p
    where p.id = checked_poll_id
      and (
        p.is_closed
        or (p.closes_at is not null and p.closes_at <= now())
        or exists (select 1 from public.poll_votes v where v.poll_id = p.id and v.voter_id = auth.uid())
        or public.is_admin()
      )
  ) then
    raise exception 'Poll results are not available yet';
  end if;

  return query
  select o.id, count(v.id)
  from public.poll_options o
  left join public.poll_votes v on v.option_id = o.id
  where o.poll_id = checked_poll_id
  group by o.id;
end;
$$;

revoke all on function public.get_poll_results(uuid) from public;
grant execute on function public.get_poll_results(uuid) to authenticated;

drop policy "found lost posts are visible to residents" on public.found_lost_posts;
create policy "visible found lost posts are visible to residents" on public.found_lost_posts for select to authenticated using (
  not public.is_content_hidden('found_lost', id) or author_id = auth.uid() or public.is_admin()
);

drop policy "recommendations are visible to residents" on public.master_recommendations;
create policy "visible recommendations are visible to residents" on public.master_recommendations for select to authenticated using (
  not public.is_content_hidden('master_recommendation', id) or author_id = auth.uid() or public.is_admin()
);

drop policy "help posts are visible to residents" on public.help_posts;
create policy "visible help posts are visible to residents" on public.help_posts for select to authenticated using (
  not public.is_content_hidden('help_post', id) or author_id = auth.uid() or public.is_admin()
);

revoke all on function public.is_content_hidden(public.moderation_content_type, uuid) from public;
grant execute on function public.is_content_hidden(public.moderation_content_type, uuid) to authenticated;
