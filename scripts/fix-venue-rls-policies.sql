-- Alias of venues-rls-jwt-metadata.sql for backwards compatibility (same SQL; safe to re-run).
-- Venue RLS: use JWT user_metadata (matches session.user.user_metadata in the app).
-- Run in Supabase SQL Editor. Top-level auth.jwt() ->> 'role' is the Postgres role
-- ('authenticated'), not your app role — policies must read user_metadata instead.

-- ---------------------------------------------------------------------------
-- Helpers (STABLE + SECURITY INVOKER so auth.jwt() reflects the current request)
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

CREATE OR REPLACE FUNCTION public.jwt_user_municipality()
RETURNS text
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT COALESCE(
    NULLIF(auth.jwt() -> 'user_metadata' ->> 'municipality', ''),
    NULLIF(auth.jwt() -> 'app_metadata' ->> 'municipality', '')
  );
$$;

GRANT EXECUTE ON FUNCTION public.jwt_app_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.jwt_user_municipality() TO authenticated;

-- ---------------------------------------------------------------------------
-- Drop legacy / overlapping venue policies (names used across repo migrations)
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Venues are viewable by everyone" ON public.venues;
DROP POLICY IF EXISTS "Admins can manage venues" ON public.venues;
DROP POLICY IF EXISTS "System admins can manage venues" ON public.venues;
DROP POLICY IF EXISTS "District managers can manage venues" ON public.venues;
DROP POLICY IF EXISTS "venues_select" ON public.venues;
DROP POLICY IF EXISTS "venues_insert" ON public.venues;
DROP POLICY IF EXISTS "venues_update" ON public.venues;
DROP POLICY IF EXISTS "venues_delete" ON public.venues;
DROP POLICY IF EXISTS "Anyone can delete venues" ON public.venues;
DROP POLICY IF EXISTS "Authenticated users can delete venues" ON public.venues;
DROP POLICY IF EXISTS "Enable all access for testing" ON public.venues;
DROP POLICY IF EXISTS "Anyone can insert venues" ON public.venues;
DROP POLICY IF EXISTS "Anyone can update venues" ON public.venues;
DROP POLICY IF EXISTS "Anyone can view venues" ON public.venues;
DROP POLICY IF EXISTS "Authenticated users can insert venues" ON public.venues;
DROP POLICY IF EXISTS "Authenticated users can update venues" ON public.venues;
DROP POLICY IF EXISTS "Authenticated users can view venues" ON public.venues;

DROP POLICY IF EXISTS "venues_insert_system_admin" ON public.venues;
DROP POLICY IF EXISTS "venues_update_system_admin" ON public.venues;
DROP POLICY IF EXISTS "venues_delete_system_admin" ON public.venues;
DROP POLICY IF EXISTS "venues_insert_district_manager" ON public.venues;
DROP POLICY IF EXISTS "venues_update_district_manager" ON public.venues;
DROP POLICY IF EXISTS "venues_delete_district_manager" ON public.venues;

ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS municipality TEXT;

ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;

-- Read: keep previous behaviour (public + authenticated can list venues)
CREATE POLICY "Venues are viewable by everyone"
ON public.venues
FOR SELECT
USING (true);

-- Writes: system_admin (and legacy admin JWT metadata) — full access
CREATE POLICY "venues_insert_system_admin"
ON public.venues
FOR INSERT
TO authenticated
WITH CHECK (public.jwt_app_role() IN ('system_admin', 'admin'));

CREATE POLICY "venues_update_system_admin"
ON public.venues
FOR UPDATE
TO authenticated
USING (public.jwt_app_role() IN ('system_admin', 'admin'))
WITH CHECK (public.jwt_app_role() IN ('system_admin', 'admin'));

CREATE POLICY "venues_delete_system_admin"
ON public.venues
FOR DELETE
TO authenticated
USING (public.jwt_app_role() IN ('system_admin', 'admin'));

-- Writes: district_manager — same municipality as JWT user_metadata
CREATE POLICY "venues_insert_district_manager"
ON public.venues
FOR INSERT
TO authenticated
WITH CHECK (
  public.jwt_app_role() = 'district_manager'
  AND public.jwt_user_municipality() IS NOT NULL
  AND municipality IS NOT DISTINCT FROM public.jwt_user_municipality()
);

CREATE POLICY "venues_update_district_manager"
ON public.venues
FOR UPDATE
TO authenticated
USING (
  public.jwt_app_role() = 'district_manager'
  AND public.jwt_user_municipality() IS NOT NULL
  AND municipality IS NOT DISTINCT FROM public.jwt_user_municipality()
)
WITH CHECK (
  public.jwt_app_role() = 'district_manager'
  AND public.jwt_user_municipality() IS NOT NULL
  AND municipality IS NOT DISTINCT FROM public.jwt_user_municipality()
);

CREATE POLICY "venues_delete_district_manager"
ON public.venues
FOR DELETE
TO authenticated
USING (
  public.jwt_app_role() = 'district_manager'
  AND public.jwt_user_municipality() IS NOT NULL
  AND municipality IS NOT DISTINCT FROM public.jwt_user_municipality()
);

-- Table privileges: RLS does not replace GRANT. Without these, Postgres returns
-- "permission denied for table venues" (42501) even when policies exist.
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.venues TO authenticated;
GRANT SELECT ON TABLE public.venues TO anon;

-- Optional: verify
-- SELECT policyname, cmd, qual, with_check FROM pg_policies WHERE tablename = 'venues' ORDER BY cmd, policyname;
