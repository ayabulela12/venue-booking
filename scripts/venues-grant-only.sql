-- Fix "permission denied for table venues" (42501) when RLS policies exist but
-- role `authenticated` lacks table-level privileges. Safe to run multiple times.

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.venues TO authenticated;
GRANT SELECT ON TABLE public.venues TO anon;
