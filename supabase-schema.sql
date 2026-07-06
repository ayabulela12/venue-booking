-- Supabase Database Schema for Venue Booking System

-- Enable UUID extension for user references
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Venues table
CREATE TABLE IF NOT EXISTS venues (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('indoor', 'outdoor', 'hybrid')),
  max_population INTEGER NOT NULL CHECK (max_population > 0),
  owner_name TEXT NOT NULL,
  owner_contact TEXT NOT NULL,
  address TEXT NOT NULL,
  municipality TEXT,
  about_venue TEXT,
  features TEXT[] DEFAULT '{}',
  activities TEXT[] DEFAULT '{}',
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings table with user relationships
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  venue_id TEXT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  date TEXT NOT NULL, -- Format: YYYY-MM-dd
  start_time TEXT NOT NULL, -- Format: HH:mm
  end_time TEXT NOT NULL, -- Format: HH:mm
  expected_attendance INTEGER NOT NULL CHECK (expected_attendance > 0),
  organizer TEXT NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
  amplified_noise BOOLEAN DEFAULT FALSE,
  liquor_license BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'override')),
  override_reason TEXT,
  overridden_by TEXT,
  overridden_at TIMESTAMP WITH TIME ZONE,
  conflicts JSONB DEFAULT '[]',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger logs for conflict detection
CREATE TABLE IF NOT EXISTS trigger_logs (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('venue_conflict', 'amplified_noise', 'risk_overlap', 'liquor_overlap', 'capacity_exceeded')),
  severity TEXT NOT NULL CHECK (severity IN ('warning', 'critical')),
  message TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE
);

-- Override logs for admin actions
CREATE TABLE IF NOT EXISTS override_logs (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  operator_name TEXT NOT NULL,
  reason TEXT NOT NULL,
  conflicts JSONB DEFAULT '[]',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Parking areas table
CREATE TABLE IF NOT EXISTS parking_areas (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  total_spaces INTEGER NOT NULL CHECK (total_spaces > 0),
  allocated_spaces INTEGER DEFAULT 0 CHECK (allocated_spaces >= 0),
  location TEXT NOT NULL,
  linked_venue_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Roads table
CREATE TABLE IF NOT EXISTS roads (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'restricted')),
  closure_reason TEXT,
  closure_start TIMESTAMP WITH TIME ZONE,
  closure_end TIMESTAMP WITH TIME ZONE,
  linked_venue_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE trigger_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE override_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE parking_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE roads ENABLE ROW LEVEL SECURITY;

-- JWT helpers for RLS: app role and municipality live in user_metadata (not jwt->>'role',
-- which is the Postgres role "authenticated" in Supabase).
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

-- Venues: public read; writes for system_admin (and legacy admin metadata) or scoped district_manager
CREATE POLICY "Venues are viewable by everyone" ON venues FOR SELECT USING (true);

CREATE POLICY "venues_insert_system_admin" ON venues FOR INSERT TO authenticated
  WITH CHECK (public.jwt_app_role() IN ('system_admin', 'admin'));

CREATE POLICY "venues_update_system_admin" ON venues FOR UPDATE TO authenticated
  USING (public.jwt_app_role() IN ('system_admin', 'admin'))
  WITH CHECK (public.jwt_app_role() IN ('system_admin', 'admin'));

CREATE POLICY "venues_delete_system_admin" ON venues FOR DELETE TO authenticated
  USING (public.jwt_app_role() IN ('system_admin', 'admin'));

CREATE POLICY "venues_insert_district_manager" ON venues FOR INSERT TO authenticated
  WITH CHECK (
    public.jwt_app_role() = 'district_manager'
    AND public.jwt_user_municipality() IS NOT NULL
    AND municipality IS NOT DISTINCT FROM public.jwt_user_municipality()
  );

CREATE POLICY "venues_update_district_manager" ON venues FOR UPDATE TO authenticated
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

CREATE POLICY "venues_delete_district_manager" ON venues FOR DELETE TO authenticated
  USING (
    public.jwt_app_role() = 'district_manager'
    AND public.jwt_user_municipality() IS NOT NULL
    AND municipality IS NOT DISTINCT FROM public.jwt_user_municipality()
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.venues TO authenticated;
GRANT SELECT ON TABLE public.venues TO anon;

-- Bookings: Everyone can read, authenticated users can create, admins can update
CREATE POLICY "Bookings are viewable by everyone" ON bookings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create bookings" ON bookings FOR INSERT WITH CHECK (
  auth.role() = 'authenticated'
);
CREATE POLICY "Admins can update all bookings" ON bookings FOR UPDATE USING (
  auth.jwt() ->> 'role' = 'admin'
);
CREATE POLICY "Users can update their own bookings" ON bookings FOR UPDATE USING (
  created_by = auth.uid()
);

-- Trigger logs: Everyone can read, system can write
CREATE POLICY "Trigger logs are viewable by everyone" ON trigger_logs FOR SELECT USING (true);
CREATE POLICY "System can create trigger logs" ON trigger_logs FOR INSERT WITH CHECK (
  auth.role() = 'authenticated'
);

-- Override logs: Everyone can read, admins can create
CREATE POLICY "Override logs are viewable by everyone" ON override_logs FOR SELECT USING (true);
CREATE POLICY "Admins can create override logs" ON override_logs FOR INSERT WITH CHECK (
  auth.jwt() ->> 'role' = 'admin'
);

-- Parking and Roads: Everyone can read, only admins can write
CREATE POLICY "Parking areas are viewable by everyone" ON parking_areas FOR SELECT USING (true);
CREATE POLICY "Admins can manage parking areas" ON parking_areas FOR ALL USING (
  auth.jwt() ->> 'role' = 'admin'
);

CREATE POLICY "Roads are viewable by everyone" ON roads FOR SELECT USING (true);
CREATE POLICY "Admins can manage roads" ON roads FOR ALL USING (
  auth.jwt() ->> 'role' = 'admin'
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_venue_id ON bookings(venue_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_by ON bookings(created_by);
CREATE INDEX IF NOT EXISTS idx_trigger_logs_booking_id ON trigger_logs(booking_id);
CREATE INDEX IF NOT EXISTS idx_override_logs_booking_id ON override_logs(booking_id);

-- Function to get user role from JWT user_metadata (matches app session metadata)
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    NULLIF(auth.jwt() -> 'user_metadata' ->> 'role', ''),
    NULLIF(auth.jwt() -> 'app_metadata' ->> 'role', ''),
    'local_admin'
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path = public;

-- Update user role in JWT when they sign in
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- The role is already in the user metadata from signup
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to handle new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
