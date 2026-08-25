-- Storage owner_id is uuid in some Supabase projects and text in others.
-- Compare canonical text values so the policy works with either representation.
-- The drops make this safe to apply after an interrupted initial migration.

drop policy if exists "residents upload own issue images" on storage.objects;
create policy "residents upload own issue images" on storage.objects for insert to authenticated with check (
  bucket_id = 'issue-images'
  and owner_id::text = auth.uid()::text
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "residents view issue images" on storage.objects;
create policy "residents view issue images" on storage.objects for select to authenticated using (
  bucket_id = 'issue-images'
);

drop policy if exists "owners remove own issue images" on storage.objects;
create policy "owners remove own issue images" on storage.objects for delete to authenticated using (
  bucket_id = 'issue-images' and owner_id::text = auth.uid()::text
);

drop policy if exists "admins upload announcement images" on storage.objects;
create policy "admins upload announcement images" on storage.objects for insert to authenticated with check (
  bucket_id = 'announcement-images' and public.is_admin()
);

drop policy if exists "residents view announcement images" on storage.objects;
create policy "residents view announcement images" on storage.objects for select to authenticated using (
  bucket_id = 'announcement-images'
);

drop policy if exists "admins manage announcement images" on storage.objects;
create policy "admins manage announcement images" on storage.objects for delete to authenticated using (
  bucket_id = 'announcement-images' and public.is_admin()
);

drop policy if exists "residents upload own found lost images" on storage.objects;
create policy "residents upload own found lost images" on storage.objects for insert to authenticated with check (
  bucket_id = 'found-lost-images'
  and owner_id::text = auth.uid()::text
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "residents view found lost images" on storage.objects;
create policy "residents view found lost images" on storage.objects for select to authenticated using (
  bucket_id = 'found-lost-images'
);

drop policy if exists "owners remove own found lost images" on storage.objects;
create policy "owners remove own found lost images" on storage.objects for delete to authenticated using (
  bucket_id = 'found-lost-images' and owner_id::text = auth.uid()::text
);
