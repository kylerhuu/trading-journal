-- Example Storage policies for bucket `trade-screenshots`
-- Adjust bucket id/name and paths for your project conventions.

-- Allow authenticated uploads under `${auth.uid()}/**`
create policy "Users upload own screenshots"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'trade-screenshots'
  and name like auth.uid()::text || '/%'
);

-- Allow authenticated reads for own objects (use signed URLs instead if you prefer zero public reads)
create policy "Users read own screenshots"
on storage.objects for select to authenticated
using (
  bucket_id = 'trade-screenshots'
  and name like auth.uid()::text || '/%'
);

-- Allow authenticated deletes for own objects
create policy "Users delete own screenshots"
on storage.objects for delete to authenticated
using (
  bucket_id = 'trade-screenshots'
  and name like auth.uid()::text || '/%'
);
