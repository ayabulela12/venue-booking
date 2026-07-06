// Migrate to Capricorn District Data - Fixed Version
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function migrateToCapricornFixed() {
  try {
    console.log('🌍 MIGRATING TO CAPRICORN DISTRICT DATA (FIXED)\n')
    
    // Step 1: Clean existing data first
    console.log('1. Cleaning existing data...')
    
    const { data: existingVenues } = await supabase
      .from('venues')
      .select('id, name')
      .like('id', 'v_%')
    
    if (existingVenues && existingVenues.length > 0) {
      console.log(`Found ${existingVenues.length} existing venues to clean...`)
      
      for (const venue of existingVenues) {
        const { error } = await supabase
          .from('venues')
          .delete()
          .eq('id', venue.id)
        
        if (error) {
          console.error(`❌ Failed to delete ${venue.name}:`, error.message)
        } else {
          console.log(`✅ Deleted ${venue.name}`)
        }
      }
    }
    
    // Step 2: Insert Capricorn District venues
    console.log('\n2. Inserting Capricorn District venues...')
    
    const venues = [
      // Polokwane venues (12 venues)
      { id: 'v_pol_001', name: 'Polokwane City Hall', type: 'indoor', max_population: 500, owner_name: 'Municipal Services', owner_contact: 'info@polokwane.gov', address: 'Civic Centre, Polokwane', municipality: 'polokwane' },
      { id: 'v_pol_002', name: 'Peter Mokaba Stadium', type: 'outdoor', max_population: 45000, owner_name: 'Sports & Recreation', owner_contact: 'sports@polokwane.gov', address: 'Stadium Road, Polokwane', municipality: 'polokwane' },
      { id: 'v_pol_003', name: 'Polokwane Library Auditorium', type: 'indoor', max_population: 200, owner_name: 'Library Services', owner_contact: 'library@polokwane.gov', address: 'Library Complex, Polokwane', municipality: 'polokwane' },
      { id: 'v_pol_004', name: 'Ivanhoe Farm', type: 'outdoor', max_population: 2000, owner_name: 'Private Events', owner_contact: 'events@ivanhoe.co.za', address: 'Ivanhoe Road, Polokwane', municipality: 'polokwane' },
      { id: 'v_pol_005', name: 'Mogol Mall Events Area', type: 'indoor', max_population: 300, owner_name: 'Mall Management', owner_contact: 'events@mogolmall.co.za', address: 'Mogol Mall, Polokwane', municipality: 'polokwane' },
      { id: 'v_pol_006', name: 'Polokwane Showgrounds', type: 'outdoor', max_population: 5000, owner_name: 'Agricultural Society', owner_contact: 'info@showgrounds.co.za', address: 'Showgrounds, Polokwane', municipality: 'polokwane' },
      { id: 'v_pol_007', name: 'Savannah Mall Conference Center', type: 'indoor', max_population: 150, owner_name: 'Savannah Mall', owner_contact: 'conferences@savannah.co.za', address: 'Savannah Mall, Polokwane', municipality: 'polokwane' },
      { id: 'v_pol_008', name: 'Northern Academy Sports Grounds', type: 'outdoor', max_population: 3000, owner_name: 'Northern Academy', owner_contact: 'sports@northern.ac.za', address: 'Northern Academy, Polokwane', municipality: 'polokwane' },
      { id: 'v_pol_009', name: 'Polokwane Art Gallery', type: 'indoor', max_population: 100, owner_name: 'Arts & Culture', owner_contact: 'art@polokwane.gov', address: 'Gallery Complex, Polokwane', municipality: 'polokwane' },
      { id: 'v_pol_010', name: 'Thaba Ya Batswana', type: 'outdoor', max_population: 1000, owner_name: 'Cultural Village', owner_contact: 'culture@thaba.co.za', address: 'Cultural Village, Polokwane', municipality: 'polokwane' },
      { id: 'v_pol_011', name: 'Polokwane Cricket Club', type: 'outdoor', max_population: 800, owner_name: 'Cricket Club', owner_contact: 'cricket@polokwane.org', address: 'Cricket Grounds, Polokwane', municipality: 'polokwane' },
      { id: 'v_pol_012', name: 'Meropa Casino Events', type: 'indoor', max_population: 400, owner_name: 'Meropa Casino', owner_contact: 'events@meropa.co.za', address: 'Meropa Casino, Polokwane', municipality: 'polokwane' },
      
      // Blouberg venues (6 venues)
      { id: 'v_blou_001', name: 'Senwabarwana Community Hall', type: 'indoor', max_population: 150, owner_name: 'Municipal Services', owner_contact: 'info@blouberg.gov', address: 'Senwabarwana Town', municipality: 'blouberg' },
      { id: 'v_blou_002', name: 'Alldays Community Center', type: 'indoor', max_population: 100, owner_name: 'Municipal Services', owner_contact: 'info@blouberg.gov', address: 'Alldays Village', municipality: 'blouberg' },
      { id: 'v_blou_003', name: 'Vivo Sports Grounds', type: 'outdoor', max_population: 500, owner_name: 'Sports & Recreation', owner_contact: 'sports@blouberg.gov', address: 'Vivo Village', municipality: 'blouberg' },
      { id: 'v_blou_004', name: 'Marepipane Farm', type: 'outdoor', max_population: 800, owner_name: 'Private Events', owner_contact: 'events@marepipane.co.za', address: 'Marepipane Farm', municipality: 'blouberg' },
      { id: 'v_blou_005', name: 'Blouberg Municipal Offices', type: 'indoor', max_population: 80, owner_name: 'Municipal Services', owner_contact: 'info@blouberg.gov', address: 'Municipal Complex', municipality: 'blouberg' },
      { id: 'v_blou_006', name: 'Tshipise Community Hall', type: 'indoor', max_population: 120, owner_name: 'Municipal Services', owner_contact: 'info@blouberg.gov', address: 'Tshipise Village', municipality: 'blouberg' },
      
      // Molemole venues (8 venues)
      { id: 'v_mol_001', name: 'Mokopane Community Hall', type: 'indoor', max_population: 200, owner_name: 'Municipal Services', owner_contact: 'info@molemole.gov', address: 'Mokopane Town', municipality: 'molemole' },
      { id: 'v_mol_002', name: 'Mogol Sports Club', type: 'outdoor', max_population: 1500, owner_name: 'Sports & Recreation', owner_contact: 'sports@molemole.gov', address: 'Mogol Club, Mokopane', municipality: 'molemole' },
      { id: 'v_mol_003', name: 'Potgietersrus Library Hall', type: 'indoor', max_population: 100, owner_name: 'Library Services', owner_contact: 'library@molemole.gov', address: 'Potgietersrus', municipality: 'molemole' },
      { id: 'v_mol_004', name: 'Thabazimbi Community Center', type: 'indoor', max_population: 150, owner_name: 'Municipal Services', owner_contact: 'info@molemole.gov', address: 'Thabazimbi Town', municipality: 'molemole' },
      { id: 'v_mol_005', name: 'Mogol Wapad Park', type: 'outdoor', max_population: 2000, owner_name: 'Parks & Recreation', owner_contact: 'parks@molemole.gov', address: 'Mogol Wapad', municipality: 'molemole' },
      { id: 'v_mol_006', name: 'Mokopane Mall Events', type: 'indoor', max_population: 250, owner_name: 'Mall Management', owner_contact: 'events@mokopanemall.co.za', address: 'Mokopane Mall', municipality: 'molemole' },
      { id: 'v_mol_007', name: 'Thabazimbi Mine Recreation', type: 'outdoor', max_population: 800, owner_name: 'Mining Company', owner_contact: 'recreation@mining.co.za', address: 'Thabazimbi Mine', municipality: 'molemole' },
      { id: 'v_mol_008', name: 'Swartruggens Community Hall', type: 'indoor', max_population: 80, owner_name: 'Municipal Services', owner_contact: 'info@molemole.gov', address: 'Swartruggens', municipality: 'molemole' },
      
      // Lepelle-Nkumpi venues (5 venues)
      { id: 'v_lep_001', name: 'Lebowakgomo Community Hall', type: 'indoor', max_population: 180, owner_name: 'Municipal Services', owner_contact: 'info@lepel.gov', address: 'Lebowakgomo Town', municipality: 'lepel' },
      { id: 'v_lep_002', name: 'Lebowakgomo Sports Grounds', type: 'outdoor', max_population: 1200, owner_name: 'Sports & Recreation', owner_contact: 'sports@lepel.gov', address: 'Lebowakgomo', municipality: 'lepel' },
      { id: 'v_lep_003', name: 'Mokgolobong Community Center', type: 'indoor', max_population: 120, owner_name: 'Municipal Services', owner_contact: 'info@lepel.gov', address: 'Mokgolobong Village', municipality: 'lepel' },
      { id: 'v_lep_004', name: 'Sekhukhune Community Hall', type: 'indoor', max_population: 100, owner_name: 'Municipal Services', owner_contact: 'info@lepel.gov', address: 'Sekhukhune', municipality: 'lepel' },
      { id: 'v_lep_005', name: 'Tafelkop Sports Field', type: 'outdoor', max_population: 600, owner_name: 'Sports & Recreation', owner_contact: 'sports@lepel.gov', address: 'Tafelkop Village', municipality: 'lepel' }
    ]
    
    for (const venue of venues) {
      const { error } = await supabase
        .from('venues')
        .insert(venue)
      
      if (error) {
        console.error(`❌ Failed to insert ${venue.name}:`, error.message)
      } else {
        console.log(`✅ Inserted ${venue.name} (${venue.municipality})`)
      }
    }
    
    // Step 3: Generate sample bookings for Capricorn District
    console.log('\n3. Generating sample bookings for Capricorn District...')
    
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
        .insert(booking)
      
      if (error) {
        console.error(`❌ Failed to create booking ${booking.title}:`, error.message)
      } else {
        console.log(`✅ Created booking: ${booking.title} (${booking.municipality})`)
      }
    }
    
    // Step 4: Verify migration
    console.log('\n4. Verifying migration...')
    
    const { data: venueCount } = await supabase
      .from('venues')
      .select('municipality')
      .then(res => ({ data: res.data?.length || 0 }))
    
    const { data: bookingCount } = await supabase
      .from('bookings')
      .select('municipality')
      .then(res => ({ data: res.data?.length || 0 }))
    
    console.log('\n📊 MIGRATION SUMMARY:')
    console.log(`   Total venues: ${venueCount}`)
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
    
    // Verify booking breakdown
    const { data: bookingBreakdown } = await supabase
      .from('bookings')
      .select('municipality, status')
      .then(res => {
        const counts = {}
        res.data?.forEach(b => {
          if (!counts[b.municipality]) counts[b.municipality] = { total: 0, confirmed: 0, pending: 0 }
          counts[b.municipality].total++
          if (b.status === 'confirmed') counts[b.municipality].confirmed++
          if (b.status === 'pending') counts[b.municipality].pending++
        })
        return counts
      })
    
    console.log('\n📅 BOOKING BREAKDOWN:')
    Object.entries(bookingBreakdown || {}).forEach(([municipality, data]) => {
      console.log(`   ${municipality}: ${data.total} bookings (${data.confirmed} confirmed, ${data.pending} pending)`)
    })
    
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
migrateToCapricornFixed()
