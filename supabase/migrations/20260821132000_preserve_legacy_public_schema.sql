-- Upgrade guard for databases that previously used the legacy tgdim schema.
--
-- The legacy tables use Telegram bigint IDs and permissive RLS. The current
-- schema uses Supabase Auth UUIDs and has new RLS rules, so altering those
-- tables in place would be unsafe. Rename them first to retain the data for
-- export/reference, then let the secure MVP migration create fresh tables.
-- This is intentionally non-destructive: no table or row is dropped.

do $$
declare
  table_name text;
  legacy_name text;
begin
  foreach table_name in array array[
    'announcements',
    'issues',
    'polls',
    'poll_options',
    'poll_votes',
    'masters',
    'help_posts',
    'events'
  ]
  loop
    legacy_name := 'legacy_' || table_name;

    if to_regclass('public.' || table_name) is not null then
      if to_regclass('public.' || legacy_name) is not null then
        raise exception
          'Cannot preserve %.%: %.% already exists. Inspect the two tables before retrying.',
          'public', table_name, 'public', legacy_name;
      end if;

      execute format('alter table public.%I rename to %I', table_name, legacy_name);
    end if;
  end loop;
end $$;

comment on schema public is
  'tgdim current schema. Legacy public tables are retained with the legacy_ prefix.';
