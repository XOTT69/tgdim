-- tgdim MVP schema. Apply with `supabase db push` against a linked project.
-- The service-role key is used only by the server-side Telegram bootstrap route.

-- SQL Editor can leave a type behind if a previous manual run stopped early.
-- These blocks make a fresh or partially started initial setup safe to retry.
do $$
begin
  create type public.issue_category as enum (
    'lighting', 'water', 'waste', 'cleaning', 'doors_intercom', 'parking_territory', 'yard_common_area', 'other'
  );
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.issue_status as enum ('new', 'in_progress', 'resolved');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.found_lost_type as enum ('lost', 'found');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.help_post_type as enum ('need_help', 'can_help');
exception when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  telegram_id bigint not null unique,
  first_name text not null check (char_length(first_name) between 1 and 128),
  last_name text check (last_name is null or char_length(last_name) <= 128),
  username text check (username is null or char_length(username) <= 128),
  photo_url text check (photo_url is null or char_length(photo_url) <= 2048),
  entrance text check (entrance is null or char_length(entrance) <= 32),
  apartment text check (apartment is null or char_length(apartment) <= 32),
  notifications_enabled boolean not null default true,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 200),
  body text not null check (char_length(body) between 1 and 10_000),
  image_path text check (image_path is null or image_path like 'announcements/%'),
  published_at timestamptz not null default now(),
  expires_at timestamptz,
  author_id uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (expires_at is null or expires_at > published_at)
);

create table if not exists public.issues (
  id uuid primary key default gen_random_uuid(),
  category public.issue_category not null,
  location text not null check (char_length(location) between 1 and 200),
  description text not null check (char_length(description) between 1 and 5_000),
  image_path text check (image_path is null or image_path like 'issues/%'),
  status public.issue_status not null default 'new',
  reporter_id uuid not null references public.profiles(id) on delete restrict,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((status = 'resolved' and resolved_at is not null) or (status <> 'resolved' and resolved_at is null))
);

create table if not exists public.polls (
  id uuid primary key default gen_random_uuid(),
  question text not null check (char_length(question) between 1 and 500),
  closes_at timestamptz,
  is_closed boolean not null default false,
  author_id uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  label text not null check (char_length(label) between 1 and 300),
  position smallint not null check (position >= 0),
  unique (poll_id, position)
);

create table if not exists public.poll_votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  option_id uuid not null references public.poll_options(id) on delete cascade,
  voter_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (poll_id, voter_id)
);

create table if not exists public.found_lost_posts (
  id uuid primary key default gen_random_uuid(),
  type public.found_lost_type not null,
  title text not null check (char_length(title) between 1 and 200),
  description text not null check (char_length(description) between 1 and 5_000),
  location text not null check (char_length(location) between 1 and 200),
  occurred_on date not null,
  image_path text check (image_path is null or image_path like 'found-lost/%'),
  contact_method text not null check (char_length(contact_method) between 1 and 500),
  author_id uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.masters (
  id uuid primary key default gen_random_uuid(),
  category text not null check (char_length(category) between 1 and 100),
  name text not null check (char_length(name) between 1 and 200),
  description text check (description is null or char_length(description) <= 5_000),
  contact_details text check (contact_details is null or char_length(contact_details) <= 500),
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.master_recommendations (
  id uuid primary key default gen_random_uuid(),
  master_id uuid not null references public.masters(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text check (comment is null or char_length(comment) <= 2_000),
  contact_details text check (contact_details is null or char_length(contact_details) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (master_id, author_id)
);

create table if not exists public.help_posts (
  id uuid primary key default gen_random_uuid(),
  type public.help_post_type not null,
  title text not null check (char_length(title) between 1 and 200),
  description text not null check (char_length(description) between 1 and 5_000),
  location text check (location is null or char_length(location) <= 200),
  contact_details text check (contact_details is null or char_length(contact_details) <= 500),
  author_id uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 200),
  description text not null check (char_length(description) between 1 and 5_000),
  starts_at timestamptz not null,
  location text not null check (char_length(location) between 1 and 200),
  organizer_id uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_attendees (
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

create index announcements_visible_idx on public.announcements (published_at desc, expires_at);
create index issues_status_idx on public.issues (status, created_at desc);
create index poll_votes_poll_idx on public.poll_votes (poll_id);
create index found_lost_posts_created_idx on public.found_lost_posts (created_at desc);
create index master_recommendations_master_idx on public.master_recommendations (master_id);
create index help_posts_created_idx on public.help_posts (created_at desc);
create index events_starts_idx on public.events (starts_at);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, telegram_id, first_name, last_name, username, photo_url)
  values (
    new.id,
    (new.raw_user_meta_data ->> 'telegram_id')::bigint,
    coalesce(new.raw_user_meta_data ->> 'first_name', 'Мешканець'),
    nullif(new.raw_user_meta_data ->> 'last_name', ''),
    nullif(new.raw_user_meta_data ->> 'username', ''),
    nullif(new.raw_user_meta_data ->> 'photo_url', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and is_admin);
$$;

create function public.update_my_profile(
  new_entrance text,
  new_apartment text,
  new_notifications_enabled boolean
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_profile public.profiles;
begin
  update public.profiles
  set entrance = new_entrance,
      apartment = new_apartment,
      notifications_enabled = new_notifications_enabled
  where id = auth.uid()
  returning * into updated_profile;

  if updated_profile is null then
    raise exception 'Profile not found';
  end if;
  return updated_profile;
end;
$$;

create function public.validate_poll_vote()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if not exists (select 1 from public.poll_options where id = new.option_id and poll_id = new.poll_id) then
    raise exception 'The selected option does not belong to this poll';
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create trigger profiles_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();
create trigger announcements_updated_at before update on public.announcements for each row execute procedure public.set_updated_at();
create trigger issues_updated_at before update on public.issues for each row execute procedure public.set_updated_at();
create trigger polls_updated_at before update on public.polls for each row execute procedure public.set_updated_at();
create trigger found_lost_posts_updated_at before update on public.found_lost_posts for each row execute procedure public.set_updated_at();
create trigger masters_updated_at before update on public.masters for each row execute procedure public.set_updated_at();
create trigger master_recommendations_updated_at before update on public.master_recommendations for each row execute procedure public.set_updated_at();
create trigger help_posts_updated_at before update on public.help_posts for each row execute procedure public.set_updated_at();
create trigger validate_poll_vote_before_insert before insert or update on public.poll_votes for each row execute procedure public.validate_poll_vote();

alter table public.profiles enable row level security;
alter table public.announcements enable row level security;
alter table public.issues enable row level security;
alter table public.polls enable row level security;
alter table public.poll_options enable row level security;
alter table public.poll_votes enable row level security;
alter table public.found_lost_posts enable row level security;
alter table public.masters enable row level security;
alter table public.master_recommendations enable row level security;
alter table public.help_posts enable row level security;
alter table public.events enable row level security;
alter table public.event_attendees enable row level security;

create policy "profiles are visible to their owner or admins" on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
create policy "announcements are visible to residents" on public.announcements for select to authenticated using (published_at <= now() and (expires_at is null or expires_at > now()) or public.is_admin());
create policy "admins manage announcements" on public.announcements for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "issues are visible to residents" on public.issues for select to authenticated using (true);
create policy "residents report their own issues" on public.issues for insert to authenticated with check (reporter_id = auth.uid() and status = 'new' and resolved_at is null);
create policy "admins update issues" on public.issues for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins delete issues" on public.issues for delete to authenticated using (public.is_admin());
create policy "polls are visible to residents" on public.polls for select to authenticated using (true);
create policy "admins manage polls" on public.polls for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "poll options are visible to residents" on public.poll_options for select to authenticated using (true);
create policy "admins manage poll options" on public.poll_options for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "votes are visible to residents" on public.poll_votes for select to authenticated using (true);
create policy "residents cast one own active vote" on public.poll_votes for insert to authenticated with check (
  voter_id = auth.uid() and exists (select 1 from public.polls where id = poll_id and not is_closed and (closes_at is null or closes_at > now()))
);
create policy "admins manage poll votes" on public.poll_votes for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "found lost posts are visible to residents" on public.found_lost_posts for select to authenticated using (true);
create policy "residents create found lost posts" on public.found_lost_posts for insert to authenticated with check (author_id = auth.uid());
create policy "authors or admins update found lost posts" on public.found_lost_posts for update to authenticated using (author_id = auth.uid() or public.is_admin()) with check (author_id = auth.uid() or public.is_admin());
create policy "authors or admins delete found lost posts" on public.found_lost_posts for delete to authenticated using (author_id = auth.uid() or public.is_admin());
create policy "masters are visible to residents" on public.masters for select to authenticated using (true);
create policy "admins manage masters" on public.masters for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "recommendations are visible to residents" on public.master_recommendations for select to authenticated using (true);
create policy "residents create own recommendations" on public.master_recommendations for insert to authenticated with check (author_id = auth.uid());
create policy "authors or admins update recommendations" on public.master_recommendations for update to authenticated using (author_id = auth.uid() or public.is_admin()) with check (author_id = auth.uid() or public.is_admin());
create policy "authors or admins delete recommendations" on public.master_recommendations for delete to authenticated using (author_id = auth.uid() or public.is_admin());
create policy "help posts are visible to residents" on public.help_posts for select to authenticated using (true);
create policy "residents create help posts" on public.help_posts for insert to authenticated with check (author_id = auth.uid());
create policy "authors or admins update help posts" on public.help_posts for update to authenticated using (author_id = auth.uid() or public.is_admin()) with check (author_id = auth.uid() or public.is_admin());
create policy "authors or admins delete help posts" on public.help_posts for delete to authenticated using (author_id = auth.uid() or public.is_admin());
create policy "events are visible to residents" on public.events for select to authenticated using (true);
create policy "admins manage events" on public.events for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "attendance is visible to residents" on public.event_attendees for select to authenticated using (true);
create policy "residents manage own attendance" on public.event_attendees for insert to authenticated with check (user_id = auth.uid());
create policy "residents remove own attendance" on public.event_attendees for delete to authenticated using (user_id = auth.uid() or public.is_admin());

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;
revoke all on function public.update_my_profile(text, text, boolean) from public;
grant execute on function public.update_my_profile(text, text, boolean) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('issue-images', 'issue-images', false, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('announcement-images', 'announcement-images', false, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('found-lost-images', 'found-lost-images', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "residents upload own issue images" on storage.objects for insert to authenticated with check (
  bucket_id = 'issue-images' and owner_id = auth.uid() and (storage.foldername(name))[1] = auth.uid()::text
);
create policy "residents view issue images" on storage.objects for select to authenticated using (bucket_id = 'issue-images');
create policy "owners remove own issue images" on storage.objects for delete to authenticated using (bucket_id = 'issue-images' and owner_id = auth.uid());
create policy "admins upload announcement images" on storage.objects for insert to authenticated with check (bucket_id = 'announcement-images' and public.is_admin());
create policy "residents view announcement images" on storage.objects for select to authenticated using (bucket_id = 'announcement-images');
create policy "admins manage announcement images" on storage.objects for delete to authenticated using (bucket_id = 'announcement-images' and public.is_admin());
create policy "residents upload own found lost images" on storage.objects for insert to authenticated with check (
  bucket_id = 'found-lost-images' and owner_id = auth.uid() and (storage.foldername(name))[1] = auth.uid()::text
);
create policy "residents view found lost images" on storage.objects for select to authenticated using (bucket_id = 'found-lost-images');
create policy "owners remove own found lost images" on storage.objects for delete to authenticated using (bucket_id = 'found-lost-images' and owner_id = auth.uid());
