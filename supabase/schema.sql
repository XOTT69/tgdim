-- Run in the Supabase SQL editor. Enable RLS before exposing tables to clients.
create table if not exists public.users (
  telegram_id bigint primary key, first_name text not null, last_name text, username text,
  photo_url text, entrance text, apartment text, notifications_enabled boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists public.issues (
  id uuid primary key default gen_random_uuid(), category text not null check (category in ('lighting','water','waste','cleaning','doors','parking','yard','other')),
  location text not null, description text not null, photo_url text, status text not null default 'new' check (status in ('new','in_progress','resolved')),
  created_by bigint references public.users(telegram_id), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(), title text not null, body text not null, image_url text,
  created_by bigint references public.users(telegram_id), published_at timestamptz not null default now(), expires_at timestamptz
);
alter table public.users enable row level security;
alter table public.issues enable row level security;
alter table public.announcements enable row level security;
-- The app uses a server-only service-role client after Telegram signature verification.
-- Do not add permissive anon policies. Create storage bucket `issue-photos` as private if public URLs are not desired.
