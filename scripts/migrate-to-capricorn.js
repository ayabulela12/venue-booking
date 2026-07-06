// Migrate to Capricorn District Data
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function migrateToCapricorn() {
  try {
    console.log('🌍 MIGRATING TO CAPRICORN DISTRICT DATA\n')
    
    // Step 1: Insert municipality reference data
    console.log('1. Inserting municipality reference data...')
    
    const municipalities = [
      { id: 'polokwane', name: 'Polokwane', type: 'City', population: 130000, main_town: 'Polokwane', description: 'Main city and administrative center of Capricorn District' },
      { id: 'blouberg', name: 'Blouberg', type: 'Local Municipality', population: 35000, main_town: 'Senwabarwana', description: 'Rural municipality with agricultural focus' },
      { id: 'molemole', name: 'Molemole', type: 'Local Municipality', population: 45000, main_town: 'Mokopane', description: 'Mixed urban-rural municipality' },
      { id: 'lepel', name: 'Lepelle-Nkumpi', type: 'Local Municipality', population: 28000, main_town: 'Lebowakgomo', description: 'Rural municipality with mining communities' }
    ]
    
    for (const municipality of municipalities) {
      const { error } = await supabase
        .from('municipalities')
        .upsert(municipality, { onConflict: 'id' })
      
      if (error) {
        console.error(`❌ Failed to insert ${municipality.name}:`, error.message)
      } else {
        console.log(`✅ Inserted ${municipality.name}`)
      }
    }
    
    // Step 2: Insert Capricorn District venues
    console.log('\n2. Inserting Capricorn District venues...')
    
    const venues = [
      // Polokwane venues (12 venues)
      { id: 'v_pol_001', name: 'Polokwane City Hall', type: 'indoor', max_population: 500, owner_name: 'Municipal Services', owner_contact: 'info@polokwane.gov', address: 'Civic Centre, Polokwane', about_venue: 'Main municipal venue for official events', municipality: 'polokwane' },
      { id: 'v_pol_002', name: 'Peter Mokaba Stadium', type: 'outdoor', max_population: 45000, owner_name: 'Sports & Recreation', owner_contact: 'sports@polokwane.gov', address: 'Stadium Road, Polokwane', about_venue: 'Multi-purpose sports stadium', municipality: 'polokwane' },
      { id: 'v_pol_003', name: 'Polokwane Library Auditorium', type: 'indoor', max_population: 200, owner_name: 'Library Services', owner_contact: 'library@polokwane.gov', address: 'Library Complex, Polokwane', about_venue: 'Conference and cultural events venue', municipality: 'polokwane' },
      { id: 'v_pol_004', name: 'Ivanhoe Farm', type: 'outdoor', max_population: 2000, owner_name: 'Private Events', owner_contact: 'events@ivanhoe.co.za', address: 'Ivanhoe Road, Polokwane', about_venue: 'Outdoor events and festivals venue', municipality: 'polokwane' },
      { id: 'v_pol_005', name: 'Mogol Mall Events Area', type: 'indoor', max_population: 300, owner_name: 'Mall Management', owner_contact: 'events@mogolmall.co.za', address: 'Mogol Mall, Polokwane', about_venue: 'Shopping mall events venue', municipality: 'polokwane' },
      { id: 'v_pol_006', name: 'Polokwane Showgrounds', type: 'outdoor', max_population: 5000, owner_name: 'Agricultural Society', owner_contact: 'info@showgrounds.co.za', address: 'Showgrounds, Polokwane', about_venue: 'Annual agricultural shows and exhibitions', municipality: 'polokwane' },
      { id: 'v_pol_007', name: 'Savannah Mall Conference Center', type: 'indoor', max_population: 150, owner_name: 'Savannah Mall', owner_contact: 'conferences@savannah.co.za', address: 'Savannah Mall, Polokwane', about_venue: 'Business conferences and meetings', municipality: 'polokwane' },
      { id: 'v_pol_008', name: 'Northern Academy Sports Grounds', type: 'outdoor', max_population: 3000, owner_name: 'Northern Academy', owner_contact: 'sports@northern.ac.za', address: 'Northern Academy, Polokwane', about_venue: 'Educational institution sports facilities', municipality: 'polokwane' },
      { id: 'v_pol_009', name: 'Polokwane Art Gallery', type: 'indoor', max_population: 100, owner_name: 'Arts & Culture', owner_contact: 'art@polokwane.gov', address: 'Gallery Complex, Polokwane', about_venue: 'Art exhibitions and cultural events', municipality: 'polokwane' },
      { id: 'v_pol_010', name: 'Thaba Ya Batswana', type: 'outdoor', max_population: 1000, owner_name: 'Cultural Village', owner_contact: 'culture@thaba.co.za', address: 'Cultural Village, Polokwane', about_venue: 'Traditional cultural events venue', municipality: 'polokwane' },
      { id: 'v_pol_011', name: 'Polokwane Cricket Club', type: 'outdoor', max_population: 800, owner_name: 'Cricket Club', owner_contact: 'cricket@polokwane.org', address: 'Cricket Grounds, Polokwane', about_venue: 'Cricket matches and sports events', municipality: 'polokwane' },
      { id: 'v_pol_012', name: 'Meropa Casino Events', type: 'indoor', max_population: 400, owner_name: 'Meropa Casino', owner_contact: 'events@meropa.co.za', address: 'Meropa Casino, Polokwane', about_venue: 'Entertainment and corporate events', municipality: 'polokwane' },
      
      // Blouberg venues (6 venues)
      { id: 'v_blou_001', name: 'Senwabarwana Community Hall', type: 'indoor', max_population: 150, owner_name: 'Municipal Services', owner_contact: 'info@blouberg.gov', address: 'Senwabarwana Town', about_venue: 'Community meetings and events', municipality: 'blouberg' },
      { id: 'v_blou_002', name: 'Alldays Community Center', type: 'indoor', max_population: 100, owner_name: 'Municipal Services', owner_contact: 'info@blouberg.gov', address: 'Alldays Village', about_venue: 'Community services venue', municipality: 'blouberg' },
      { id: 'v_blou_003', name: 'Vivo Sports Grounds', type: 'outdoor', max_population: 500, owner_name: 'Sports & Recreation', owner_contact: 'sports@blouberg.gov', address: 'Vivo Village', about_venue: 'Sports events and tournaments', municipality: 'blouberg' },
      { id: 'v_blou_004', name: 'Marepipane Farm', type: 'outdoor', max_population: 800, owner_name: 'Private Events', owner_contact: 'events@marepipane.co.za', address: 'Marepipane Farm', about_venue: 'Agricultural events venue', municipality: 'blouberg' },
      { id: 'v_blou_005', name: 'Blouberg Municipal Offices', type: 'indoor', max_population: 80, owner_name: 'Municipal Services', owner_contact: 'info@blouberg.gov', address: 'Municipal Complex', about_venue: 'Official municipal events', municipality: 'blouberg' },
      { id: 'v_blou_006', name: 'Tshipise Community Hall', type: 'indoor', max_population: 120, owner_name: 'Municipal Services', owner_contact: 'info@blouberg.gov', address: 'Tshipise Village', about_venue: 'Community events venue', municipality: 'blouberg' },
      
      // Molemole venues (8 venues)
      { id: 'v_mol_001', name: 'Mokopane Community Hall', type: 'indoor', max_population: 200, owner_name: 'Municipal Services', owner_contact: 'info@molemole.gov', address: 'Mokopane Town', about_venue: 'Main community events venue', municipality: 'molemole' },
      { id: 'v_mol_002', name: 'Mogol Sports Club', type: 'outdoor', max_population: 1500, owner_name: 'Sports & Recreation', owner_contact: 'sports@molemole.gov', address: 'Mogol Club, Mokopane', about_venue: 'Sports tournaments and events', municipality: 'molemole' },
      { id: 'v_mol_003', name: 'Potgietersrus Library Hall', type: 'indoor', max_population: 100, owner_name: 'Library Services', owner_contact: 'library@molemole.gov', address: 'Potgietersrus', about_venue: 'Educational and cultural events', municipality: 'molemole' },
      { id: 'v_mol_004', name: 'Thabazimbi Community Center', type: 'indoor', max_population: 150, owner_name: 'Municipal Services', owner_contact: 'info@molemole.gov', address: 'Thabazimbi Town', about_venue: 'Community meetings and events', municipality: 'molemole' },
      { id: 'v_mol_005', name: 'Mogol Wapad Park', type: 'outdoor', max_population: 2000, owner_name: 'Parks & Recreation', owner_contact: 'parks@molemole.gov', address: 'Mogol Wapad', about_venue: 'Outdoor festivals and concerts', municipality: 'molemole' },
      { id: 'v_mol_006', name: 'Mokopane Mall Events', type: 'indoor', max_population: 250, owner_name: 'Mall Management', owner_contact: 'events@mokopanemall.co.za', address: 'Mokopane Mall', about_venue: 'Shopping mall events venue', municipality: 'molemole' },
      { id: 'v_mol_007', name: 'Thabazimbi Mine Recreation', type: 'outdoor', max_population: 800, owner_name: 'Mining Company', owner_contact: 'recreation@mining.co.za', address: 'Thabazimbi Mine', about_venue: 'Employee and community events', municipality: 'molemole' },
      { id: 'v_mol_008', name: 'Swartruggens Community Hall', type: 'indoor', max_population: 80, owner_name: 'Municipal Services', owner_contact: 'info@molemole.gov', address: 'Swartruggens', about_venue: 'Rural community events', municipality: 'molemole' },
      
      // Lepelle-Nkumpi venues (5 venues)
      { id: 'v_lep_001', name: 'Lebowakgomo Community Hall', type: 'indoor', max_population: 180, owner_name: 'Municipal Services', owner_contact: 'info@lepel.gov', address: 'Lebowakgomo Town', about_venue: 'Main community events venue', municipality: 'lepel' },
      { id: 'v_lep_002', name: 'Lebowakgomo Sports Grounds', type: 'outdoor', max_population: 1200, owner_name: 'Sports & Recreation', owner_contact: 'sports@lepel.gov', address: 'Lebowakgomo', about_venue: 'Sports tournaments and events', municipality: 'lepel' },
      { id: 'v_lep_003', name: 'Mokgolobong Community Center', type: 'indoor', max_population: 120, owner_name: 'Municipal Services', owner_contact: 'info@lepel.gov', address: 'Mokgolobong Village', about_venue: 'Community meetings and events', municipality: 'lepel' },
      { id: 'v_lep_004', name: 'Sekhukhune Community Hall', type: 'indoor', max_population: 100, owner_name: 'Municipal Services', owner_contact: 'info@lepel.gov', address: 'Sekhukhune', about_venue: 'Rural community events venue', municipality: 'lepel' },
      { id: 'v_lep_005', name: 'Tafelkop Sports Field', type: 'outdoor', max_population: 600, owner_name: 'Sports & Recreation', owner_contact: 'sports@lepel.gov', address: 'Tafelkop Village', about_venue: 'Sports events and tournaments', municipality: 'lepel' }
    ]
    
    for (const venue of venues) {
      const { error } = await supabase
        .from('venues')
        .upsert(venue, { onConflict: 'id' })
      
      if (error) {
        console.error(`❌ Failed to insert ${venue.name}:`, error.message)
      } else {
        console.log(`✅ Inserted ${venue.name} (${venue.municipality})`)
      }
    }
    
    // Step 3: Create user profiles for Capricorn District
    console.log('\n3. Creating user profiles for Capricorn District...')
    
    const users = [
      { email: 'thabo.mokoena@capricorn.gov', full_name: 'Thabo Mokoena', role: 'district_manager', municipality: 'polokwane' },
      { email: 'sarah.dlamini@polokwane.gov', full_name: 'Sarah Dlamini', role: 'local_admin', municipality: 'polokwane' },
      { email: 'peter.potgieter@blouberg.gov', full_name: 'Peter Potgieter', role: 'local_admin', municipality: 'blouberg' },
      { email: 'maria.molefe@molemole.gov', full_name: 'Maria Molefe', role: 'local_admin', municipality: 'molemole' },
      { email: 'jacob.sekukuni@lepel.gov', full_name: 'Jacob Sekukuni', role: 'local_admin', municipality: 'lepel' },
      { email: 'operations@capricorn.gov', full_name: 'Operations Team', role: 'operations', municipality: 'polokwane' }
    ]
    
    for (const user of users) {
      const { error } = await supabase
        .from('profiles')
        .upsert(user, { onConflict: 'email' })
      
      if (error) {
        console.error(`❌ Failed to create profile for ${user.email}:`, error.message)
      } else {
        console.log(`✅ Created profile for ${user.full_name} (${user.municipality})`)
      }
    }
    
    // Step 4: Generate sample bookings for Capricorn District
    console.log('\n4. Generating sample bookings for Capricorn District...')
    
    const bookings = [
      // Polokwane bookings
      { id: 'b_pol_001', venue_id: 'v_pol_001', title: 'City Council Meeting', description: 'Monthly council meeting', date: '2025-05-15', start_time: '09:00', end_time: '12:00', expected_attendance: 50, organizer: 'Thabo Mokoena', risk_level: 'low', status: 'confirmed', municipality: 'polokwane' },
      { id: 'b_pol_002', venue_id: 'v_pol_002', title: 'School Sports Tournament', description: 'Inter-school athletics competition', date: '2025-05-20', start_time: '08:00', end_time: '17:00', expected_attendance: 2000, organizer: 'Sarah Dlamini', risk_level: 'medium', status: 'pending', municipality: 'polokwane' },
      { id: 'b_pol_003', venue_id: 'v_pol_004', title: 'Music Festival', description: 'Annual outdoor music festival', date: '2025-05-25', start_time: '14:00', end_time: '23:00', expected_attendance: 1500, organizer: 'Events Company', risk_level: 'high', status: 'pending', municipality: 'polokwane' },
      
      // Blouberg bookings
      { id: 'b_blou_001', venue_id: 'v_blou_001', title: 'Community Meeting', description: 'Municipal community engagement', date: '2025-05-18', start_time: '10:00', end_time: '14:00', expected_attendance: 80, organizer: 'Peter Potgieter', risk_level: 'low', status: 'confirmed', municipality: 'blouberg' },
      { id: 'b_blou_002', venue_id: 'v_blou_003', title: 'Sports Tournament', description: 'Regional soccer tournament', date: '2025-05-22', start_time: '09:00', end_time: '18:00', expected_attendance: 300, organizer: 'Sports Club', risk_level: 'medium', status: 'pending', municipality: 'blouberg' },
      
      // Molemole bookings
      { id: 'b_mol_001', venue_id: 'v_mol_001', title: 'Town Hall Meeting', description: 'Monthly town hall meeting', date: '2025-05-16', start_time: '14:00', end_time: '16:00', expected_attendance: 100, organizer: 'Maria Molefe', risk_level: 'low', status: 'confirmed', municipality: 'molemole' },
      { id: 'b_mol_002', venue_id: 'v_mol_002', title: 'Sports Day', description: 'Community sports day', date: '2025-05-24', start_time: '08:00', end_time: '17:00', expected_attendance: 800, organizer: 'Sports Committee', risk_level: 'medium', status: 'pending', municipality: 'molemole' },
      
      // Lepelle-Nkumpi bookings
      { id: 'b_lep_001', venue_id: 'v_lep_001', title: 'Community Event', description: 'Community development meeting', date: '2025-05-19', start_time: '11:00', end_time: '15:00', expected_attendance: 120, organizer: 'Jacob Sekukuni', risk_level: 'low', status: 'confirmed', municipality: 'lepel' },
      { id: 'b_lep_002', venue_id: 'v_lep_002', title: 'Sports Competition', description: 'Inter-village sports competition', date: '2025-05-26', start_time: '09:00', end_time: '16:00', expected_attendance: 400, organizer: 'Sports Association', risk_level: 'medium', status: 'pending', municipality: 'lepel' }
    ]
    
    for (const booking of bookings) {
      const { error } = await supabase
        .from('bookings')
        .upsert(booking, { onConflict: 'id' })
      
      if (error) {
        console.error(`❌ Failed to create booking ${booking.title}:`, error.message)
      } else {
        console.log(`✅ Created booking: ${booking.title} (${booking.municipality})`)
      }
    }
    
    // Step 5: Verify migration
    console.log('\n5. Verifying migration...')
    
    const { data: venueCount } = await supabase
      .from('venues')
      .select('municipality')
      .then(res => ({ data: res.data?.length || 0 }))
    
    const { data: userCount } = await supabase
      .from('profiles')
      .select('municipality')
      .not('municipality', 'is', null)
      .then(res => ({ data: res.data?.length || 0 }))
    
    const { data: bookingCount } = await supabase
      .from('bookings')
      .select('municipality')
      .then(res => ({ data: res.data?.length || 0 }))
    
    console.log('\n📊 MIGRATION SUMMARY:')
    console.log(`   Total venues: ${venueCount}`)
    console.log(`   Total users: ${userCount}`)
    console.log(`   Total bookings: ${bookingCount}`)
    
    // Verify municipality breakdown
    const { data: venueBreakdown } = await supabase
      .from('venues')
      .select('municipality')
      .then(res => {
        const counts = {}
        res.data?.forEach(v => {
          counts[v.municipality] = (counts[v.municipality] || 0) + 1
        })
        return counts
      })
    
    console.log('\n🏛️ MUNICIPALITY BREAKDOWN:')
    console.log(`   Polokwane: ${venueBreakdown?.polokwane || 0} venues`)
    console.log(`   Blouberg: ${venueBreakdown?.blouberg || 0} venues`)
    console.log(`   Molemole: ${venueBreakdown?.molemole || 0} venues`)
    console.log(`   Lepelle-Nkumpi: ${venueBreakdown?.lepel || 0} venues`)
    
    console.log('\n✅ CAPRICORN DISTRICT MIGRATION COMPLETE!')
    console.log('🎉 System is now focused on Capricorn District!')
    console.log('\n📋 NEXT STEPS:')
    console.log('1. Update dashboard components to use municipality data')
    console.log('2. Add municipality filtering to user management')
    console.log('3. Update system admin dashboard with municipality overview')
    console.log('4. Test all dashboards with new data')
    
  } catch (error) {
    console.error('❌ Migration script failed:', error)
  }
}

// Run migration
migrateToCapricorn()
