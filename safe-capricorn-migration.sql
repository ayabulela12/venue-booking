-- SAFE Capricorn District Migration - Preserves Existing Data
-- Run this in your Supabase SQL Editor

-- Step 1: Update existing venues with proper municipality assignments
-- (Your existing venues are already polokwane, just ensuring proper municipality field)

UPDATE venues SET municipality = 'polokwane' WHERE municipality IS NULL OR municipality = '';

-- Step 2: Add NEW Capricorn District venues (without deleting existing ones)
-- These will be in addition to your current 7 venues

-- Additional Polokwane venues (5 more venues)
INSERT INTO venues (id, name, type, max_population, owner_name, owner_contact, address, municipality) VALUES
  ('v_pol_new_001', 'Polokwane City Hall', 'indoor', 500, 'Municipal Services', 'info@polokwane.gov', 'Civic Centre, Polokwane', 'polokwane'),
  ('v_pol_new_002', 'Peter Mokaba Stadium', 'outdoor', 45000, 'Sports & Recreation', 'sports@polokwane.gov', 'Stadium Road, Polokwane', 'polokwane'),
  ('v_pol_new_003', 'Polokwane Library Auditorium', 'indoor', 200, 'Library Services', 'library@polokwane.gov', 'Library Complex, Polokwane', 'polokwane'),
  ('v_pol_new_004', 'Ivanhoe Farm', 'outdoor', 2000, 'Private Events', 'events@ivanhoe.co.za', 'Ivanhoe Road, Polokwane', 'polokwane'),
  ('v_pol_new_005', 'Mogol Mall Events Area', 'indoor', 300, 'Mall Management', 'events@mogolmall.co.za', 'Mogol Mall, Polokwane', 'polokwane');

-- Blouberg venues (6 venues)
INSERT INTO venues (id, name, type, max_population, owner_name, owner_contact, address, municipality) VALUES
  ('v_blou_001', 'Senwabarwana Community Hall', 'indoor', 150, 'Municipal Services', 'info@blouberg.gov', 'Senwabarwana Town', 'blouberg'),
  ('v_blou_002', 'Alldays Community Center', 'indoor', 100, 'Municipal Services', 'info@blouberg.gov', 'Alldays Village', 'blouberg'),
  ('v_blou_003', 'Vivo Sports Grounds', 'outdoor', 500, 'Sports & Recreation', 'sports@blouberg.gov', 'Vivo Village', 'blouberg'),
  ('v_blou_004', 'Marepipane Farm', 'outdoor', 800, 'Private Events', 'events@marepipane.co.za', 'Marepipane Farm', 'blouberg'),
  ('v_blou_005', 'Blouberg Municipal Offices', 'indoor', 80, 'Municipal Services', 'info@blouberg.gov', 'Municipal Complex', 'blouberg'),
  ('v_blou_006', 'Tshipise Community Hall', 'indoor', 120, 'Municipal Services', 'info@blouberg.gov', 'Tshipise Village', 'blouberg');

-- Molemole venues (8 venues)
INSERT INTO venues (id, name, type, max_population, owner_name, owner_contact, address, municipality) VALUES
  ('v_mol_001', 'Mokopane Community Hall', 'indoor', 200, 'Municipal Services', 'info@molemole.gov', 'Mokopane Town', 'molemole'),
  ('v_mol_002', 'Mogol Sports Club', 'outdoor', 1500, 'Sports & Recreation', 'sports@molemole.gov', 'Mogol Club, Mokopane', 'molemole'),
  ('v_mol_003', 'Potgietersrus Library Hall', 'indoor', 100, 'Library Services', 'library@molemole.gov', 'Potgietersrus', 'molemole'),
  ('v_mol_004', 'Thabazimbi Community Center', 'indoor', 150, 'Municipal Services', 'info@molemole.gov', 'Thabazimbi Town', 'molemole'),
  ('v_mol_005', 'Mogol Wapad Park', 'outdoor', 2000, 'Parks & Recreation', 'parks@molemole.gov', 'Mogol Wapad', 'molemole'),
  ('v_mol_006', 'Mokopane Mall Events', 'indoor', 250, 'Mall Management', 'events@mokopanemall.co.za', 'Mokopane Mall', 'molemole'),
  ('v_mol_007', 'Thabazimbi Mine Recreation', 'outdoor', 800, 'Mining Company', 'recreation@mining.co.za', 'Thabazimbi Mine', 'molemole'),
  ('v_mol_008', 'Swartruggens Community Hall', 'indoor', 80, 'Municipal Services', 'info@molemole.gov', 'Swartruggens', 'molemole');

-- Lepelle-Nkumpi venues (5 venues)
INSERT INTO venues (id, name, type, max_population, owner_name, owner_contact, address, municipality) VALUES
  ('v_lep_001', 'Lebowakgomo Community Hall', 'indoor', 180, 'Municipal Services', 'info@lepel.gov', 'Lebowakgomo Town', 'lepel'),
  ('v_lep_002', 'Lebowakgomo Sports Grounds', 'outdoor', 1200, 'Sports & Recreation', 'sports@lepel.gov', 'Lebowakgomo', 'lepel'),
  ('v_lep_003', 'Mokgolobong Community Center', 'indoor', 120, 'Municipal Services', 'info@lepel.gov', 'Mokgolobong Village', 'lepel'),
  ('v_lep_004', 'Sekhukhune Community Hall', 'indoor', 100, 'Municipal Services', 'info@lepel.gov', 'Sekhukhune', 'lepel'),
  ('v_lep_005', 'Tafelkop Sports Field', 'outdoor', 600, 'Sports & Recreation', 'sports@lepel.gov', 'Tafelkop Village', 'lepel');

-- Step 3: Update existing bookings to ensure municipality field is set
UPDATE bookings SET municipality = 'polokwane' WHERE municipality IS NULL OR municipality = '';

-- Step 4: Add sample bookings for other municipalities (keeping existing ones)
-- These are additional bookings, not replacing your existing 22 bookings

-- Blouberg bookings
INSERT INTO bookings (id, venue_id, title, description, date, start_time, end_time, expected_attendance, organizer, risk_level, status, municipality) VALUES
  ('b_blou_001', 'v_blou_001', 'Community Meeting', 'Municipal community engagement', '2025-05-18', '10:00', '14:00', 80, 'Peter Potgieter', 'low', 'confirmed', 'blouberg'),
  ('b_blou_002', 'v_blou_003', 'Sports Tournament', 'Regional soccer tournament', '2025-05-22', '09:00', '18:00', 300, 'Sports Club', 'medium', 'pending', 'blouberg');

-- Molemole bookings
INSERT INTO bookings (id, venue_id, title, description, date, start_time, end_time, expected_attendance, organizer, risk_level, status, municipality) VALUES
  ('b_mol_001', 'v_mol_001', 'Town Hall Meeting', 'Monthly town hall meeting', '2025-05-16', '14:00', '16:00', 100, 'Maria Molefe', 'low', 'confirmed', 'molemole'),
  ('b_mol_002', 'v_mol_002', 'Sports Day', 'Community sports day', '2025-05-24', '08:00', '17:00', 800, 'Sports Committee', 'medium', 'pending', 'molemole');

-- Lepelle-Nkumpi bookings
INSERT INTO bookings (id, venue_id, title, description, date, start_time, end_time, expected_attendance, organizer, risk_level, status, municipality) VALUES
  ('b_lep_001', 'v_lep_001', 'Community Event', 'Community development meeting', '2025-05-19', '11:00', '15:00', 120, 'Jacob Sekukuni', 'low', 'confirmed', 'lepel'),
  ('b_lep_002', 'v_lep_002', 'Sports Competition', 'Inter-village sports competition', '2025-05-26', '09:00', '16:00', 400, 'Sports Association', 'medium', 'pending', 'lepel');

-- Step 5: Verify migration results
SELECT 'TOTAL VENUES BY MUNICIPALITY' as summary, municipality, COUNT(*) as count 
FROM venues 
GROUP BY municipality 
UNION ALL
SELECT 'TOTAL BOOKINGS BY MUNICIPALITY' as summary, municipality, COUNT(*) as count 
FROM bookings 
GROUP BY municipality 
ORDER BY summary, municipality;

-- Step 6: Show detailed breakdown
SELECT 
  municipality,
  COUNT(*) as venue_count,
  STRING_AGG(name, ', ' ORDER BY name) as venues
FROM venues 
GROUP BY municipality 
ORDER BY municipality;
