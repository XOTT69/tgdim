-- ============================================
-- Наш будинок — Supabase Schema
-- ============================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================
-- USERS
-- ============================================
create table if not exists users (
  telegram_id bigint primary key,
  first_name text not null,
  last_name text,
  username text,
  photo_url text,
  apartment text,
  entrance text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- ISSUES
-- ============================================
create table if not exists issues (
  id uuid primary key default uuid_generate_v4(),
  category text not null check (category in ('lighting','water','waste','cleaning','doors','parking','yard','other')),
  location text not null,
  description text not null,
  photo_url text,
  status text not null default 'new' check (status in ('new','in_progress','resolved')),
  created_by bigint references users(telegram_id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- ANNOUNCEMENTS
-- ============================================
create table if not exists announcements (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  body text not null,
  image_url text,
  expires_at timestamptz,
  published_at timestamptz default now(),
  created_by bigint references users(telegram_id),
  created_at timestamptz default now()
);

-- ============================================
-- POLLS
-- ============================================
create table if not exists polls (
  id uuid primary key default uuid_generate_v4(),
  question text not null,
  is_multiple boolean default false,
  closes_at timestamptz,
  created_by bigint references users(telegram_id),
  created_at timestamptz default now()
);

create table if not exists poll_options (
  id uuid primary key default uuid_generate_v4(),
  poll_id uuid not null references polls(id) on delete cascade,
  text text not null,
  votes_count integer default 0
);

create table if not exists poll_votes (
  id uuid primary key default uuid_generate_v4(),
  poll_id uuid not null references polls(id) on delete cascade,
  option_id uuid not null references poll_options(id) on delete cascade,
  user_id bigint not null references users(telegram_id),
  created_at timestamptz default now(),
  unique (poll_id, option_id, user_id)
);

-- Function to increment vote count
create or replace function increment_vote_count(option_id_input uuid)
returns void as $$
begin
  update poll_options
  set votes_count = votes_count + 1
  where id = option_id_input;
end;
$$ language plpgsql security definer;

-- Function to increment master rating
create or replace function increment_master_rating(master_id_input uuid, rating_input integer)
returns void as $$
begin
  update masters
  set rating_sum = rating_sum + rating_input,
      rating_count = rating_count + 1
  where id = master_id_input;
end;
$$ language plpgsql security definer;

-- ============================================
-- FOUND / LOST
-- ============================================
create table if not exists found_lost (
  id uuid primary key default uuid_generate_v4(),
  type text not null check (type in ('found','lost')),
  title text not null,
  description text,
  location text,
  photo_url text,
  contact_method text,
  is_resolved boolean default false,
  created_by bigint references users(telegram_id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- MASTERS (service providers)
-- ============================================
create table if not exists masters (
  id uuid primary key default uuid_generate_v4(),
  category text not null check (category in ('plumber','electrician','appliance','cleaning','locksmith','other')),
  name text not null,
  description text,
  contact text,
  rating_sum integer default 0,
  rating_count integer default 0,
  created_by bigint references users(telegram_id),
  created_at timestamptz default now()
);

create table if not exists master_reviews (
  id uuid primary key default uuid_generate_v4(),
  master_id uuid not null references masters(id) on delete cascade,
  user_id bigint not null references users(telegram_id),
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz default now(),
  unique (master_id, user_id)
);

-- ============================================
-- HELP
-- ============================================
create table if not exists help_posts (
  id uuid primary key default uuid_generate_v4(),
  type text not null check (type in ('need_help','offer_help')),
  title text not null,
  description text,
  location text,
  contact text,
  is_resolved boolean default false,
  created_by bigint references users(telegram_id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- EVENTS
-- ============================================
create table if not exists events (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  event_date timestamptz not null,
  location text,
  organizer_id bigint references users(telegram_id),
  created_at timestamptz default now()
);

create table if not exists event_participants (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references events(id) on delete cascade,
  user_id bigint not null references users(telegram_id),
  created_at timestamptz default now(),
  unique (event_id, user_id)
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
alter table users enable row level security;
alter table issues enable row level security;
alter table announcements enable row level security;
alter table polls enable row level security;
alter table poll_options enable row level security;
alter table poll_votes enable row level security;
alter table found_lost enable row level security;
alter table masters enable row level security;
alter table master_reviews enable row level security;
alter table help_posts enable row level security;
alter table events enable row level security;
alter table event_participants enable row level security;

-- Since we use service_role key on the server, RLS policies mainly protect direct client access.
-- The server bypasses RLS with the service_role key.
-- For anon key (if used from client), we allow read access to public data.

-- Users: only service role can write; anon can read basic info
create policy "Users are viewable by everyone" on users for select using (true);
create policy "Service role manages users" on users for all using (true);

-- Issues: anyone can read; authenticated inserts handled via service role
create policy "Issues are viewable by everyone" on issues for select using (true);

-- Announcements: anyone can read
create policy "Announcements are viewable by everyone" on announcements for select using (true);

-- Polls: anyone can read
create policy "Polls are viewable by everyone" on polls for select using (true);
create policy "Poll options are viewable by everyone" on poll_options for select using (true);
create policy "Poll votes are viewable by everyone" on poll_votes for select using (true);

-- Found/Lost: anyone can read
create policy "Found/Lost are viewable by everyone" on found_lost for select using (true);

-- Masters: anyone can read
create policy "Masters are viewable by everyone" on masters for select using (true);
create policy "Master reviews are viewable by everyone" on master_reviews for select using (true);

-- Help: anyone can read
create policy "Help posts are viewable by everyone" on help_posts for select using (true);

-- Events: anyone can read
create policy "Events are viewable by everyone" on events for select using (true);
create policy "Event participants are viewable by everyone" on event_participants for select using (true);

-- ============================================
-- INDEXES
-- ============================================
create index if not exists idx_issues_status on issues(status);
create index if not exists idx_issues_created_at on issues(created_at desc);
create index if not exists idx_announcements_published_at on announcements(published_at desc);
create index if not exists idx_polls_created_at on polls(created_at desc);
create index if not exists idx_poll_votes_user on poll_votes(user_id);
create index if not exists idx_found_lost_type on found_lost(type);
create index if not exists idx_help_posts_type on help_posts(type);
create index if not exists idx_events_date on events(event_date);

-- ============================================
-- STORAGE BUCKET (run via Supabase dashboard or CLI)
-- ============================================
-- insert into storage.buckets (id, name, public) values ('issue-photos', 'issue-photos', true);
