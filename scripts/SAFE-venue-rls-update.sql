-- This file previously added policies using auth.jwt() ->> 'role', which on Supabase is the
-- Postgres role ("authenticated"), not your app role in user_metadata. Do not run the old steps.
--
-- Run once: scripts/venues-rls-jwt-metadata.sql (Supabase SQL Editor).

SELECT 'Current venue policies (before/after comparison):' AS info;
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'venues'
  AND schemaname = 'public'
ORDER BY policyname;
