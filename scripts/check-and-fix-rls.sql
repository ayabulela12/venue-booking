-- Inspect venue RLS policies, then apply the JWT user_metadata migration manually.
-- Supabase SQL Editor cannot include other files; run scripts/venues-rls-jwt-metadata.sql
-- after reviewing the output below, then re-run the SELECT to confirm.

SELECT 'Current venue policies:' AS info;
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'venues'
  AND schemaname = 'public'
ORDER BY cmd, policyname;

SELECT 'Next: run scripts/venues-rls-jwt-metadata.sql in this project SQL editor, then re-run the query above.' AS note;
