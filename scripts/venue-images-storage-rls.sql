-- Storage RLS for venue-images bucket
-- Run in Supabase SQL Editor after creating a PUBLIC bucket named "venue-images".
-- Requires public.jwt_app_role() from scripts/venues-rls-jwt-metadata.sql

-- Ensure bucket exists (dashboard: Storage → New bucket → venue-images, Public: ON)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('venue-images', 'venue-images', true)
-- ON CONFLICT (id) DO UPDATE SET public = true;

-- ---------------------------------------------------------------------------
-- Helpers (skip if already created by venues-rls-jwt-metadata.sql)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.jwt_app_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT COALESCE(
    NULLIF(auth.jwt() -> 'user_metadata' ->> 'role', ''),
    NULLIF(auth.jwt() -> 'app_metadata' ->> 'role', '')
  );
$$;

GRANT EXECUTE ON FUNCTION public.jwt_app_role() TO authenticated;

-- ---------------------------------------------------------------------------
-- Drop legacy storage policies for this bucket
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Allow authenticated users to upload venue images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to venue images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update own venue images" ON storage.objects;
DROP POLICY IF EXISTS "venue_images_insert" ON storage.objects;
DROP POLICY IF EXISTS "venue_images_select" ON storage.objects;
DROP POLICY IF EXISTS "venue_images_update" ON storage.objects;
DROP POLICY IF EXISTS "venue_images_delete" ON storage.objects;

-- ---------------------------------------------------------------------------
-- Policies: system_admin, admin, district_manager can upload; anyone can read
-- ---------------------------------------------------------------------------

CREATE POLICY "venue_images_select"
ON storage.objects
FOR SELECT
USING (bucket_id = 'venue-images');

CREATE POLICY "venue_images_insert"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'venue-images'
  AND public.jwt_app_role() IN ('system_admin', 'admin', 'district_manager')
);

CREATE POLICY "venue_images_update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'venue-images'
  AND public.jwt_app_role() IN ('system_admin', 'admin', 'district_manager')
)
WITH CHECK (
  bucket_id = 'venue-images'
  AND public.jwt_app_role() IN ('system_admin', 'admin', 'district_manager')
);

CREATE POLICY "venue_images_delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'venue-images'
  AND public.jwt_app_role() IN ('system_admin', 'admin', 'district_manager')
);
