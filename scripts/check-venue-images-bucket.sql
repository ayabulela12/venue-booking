-- Run in Supabase SQL Editor to compare your venue-images setup with the app.
-- The app expects: bucket id "venue-images", public reads, uploads under venues/* path.

-- 1) Bucket exists and is public (required for getPublicUrl in the app)
SELECT
  id,
  name,
  public AS is_public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE id = 'venue-images';

-- If no rows: create bucket in Dashboard (name: venue-images, Public: ON)
-- Or uncomment and run:
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('venue-images', 'venue-images', true)
-- ON CONFLICT (id) DO UPDATE SET public = true;

-- 2) Current storage policies on storage.objects for this bucket
SELECT
  policyname,
  cmd,
  roles,
  qual AS using_expression,
  with_check
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND (
    policyname ILIKE '%venue%'
    OR qual::text ILIKE '%venue-images%'
    OR with_check::text ILIKE '%venue-images%'
  )
ORDER BY cmd, policyname;

-- Expected after venue-images-storage-rls.sql:
--   venue_images_select  (SELECT, bucket_id = venue-images)
--   venue_images_insert  (INSERT, jwt_app_role in system_admin, admin, district_manager)
--   venue_images_update  (UPDATE, same roles)
--   venue_images_delete  (DELETE, same roles)

-- 3) jwt_app_role() helper (required for new insert/update policies)
SELECT
  proname,
  prosecdef AS security_definer
FROM pg_proc
WHERE proname = 'jwt_app_role'
  AND pronamespace = 'public'::regnamespace;

-- 4) Sample objects (folder layout — app uploads to venues/<filename>)
SELECT
  name,
  created_at,
  metadata->>'mimetype' AS mimetype
FROM storage.objects
WHERE bucket_id = 'venue-images'
ORDER BY created_at DESC
LIMIT 10;
