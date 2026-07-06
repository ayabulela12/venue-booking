// Clean Demo Data for Production
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function cleanupDemoData() {
  try {
    console.log('🧹 CLEANING UP DEMO DATA FOR PRODUCTION\n')
    
    // Step 1: Delete demo auth accounts
    console.log('1. Removing demo auth accounts...')
    
    const { data: { users } } = await supabase.auth.admin.listUsers()
    
    if (users && users.length > 0) {
      const demoUsers = users.filter(user => 
        user.email === 'admin@test.com' || 
        user.email === 'oparator@test.com'
      )
      
      for (const demoUser of demoUsers) {
        try {
          const { error } = await supabase.auth.admin.deleteUser(demoUser.id)
          if (error) {
            console.error(`❌ Failed to delete demo user ${demoUser.email}:`, error.message)
          } else {
            console.log(`✅ Deleted demo user: ${demoUser.email}`)
          }
        } catch (deleteError) {
          console.error(`❌ Error deleting demo user ${demoUser.email}:`, deleteError.message)
        }
      }
    } else {
      console.log('ℹ️  No demo users found to delete')
    }
    
    // Step 2: Clean demo profiles
    console.log('\n2. Cleaning demo profiles...')
    
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .delete()
      .in('email', ['admin@test.com', 'oparator@test.com'])
    
    if (profileError) {
      console.error('❌ Failed to delete demo profiles:', profileError.message)
    } else {
      console.log(`✅ Deleted ${profiles?.length || 0} demo profiles`)
    }
    
    // Step 3: Clean demo venues
    console.log('\n3. Cleaning demo venues...')
    
    const { data: venues, error: venuesError } = await supabase
      .from('venues')
      .delete()
      .like('id', 'v%')  // Only delete seeded venues
      .lt('created_at', '2025-12-31') // Only delete old demo data
    
    if (venuesError) {
      console.error('❌ Failed to delete demo venues:', venuesError.message)
    } else {
      console.log(`✅ Deleted ${venues?.length || 0} demo venues`)
    }
    
    // Step 4: Clean demo bookings
    console.log('\n4. Cleaning demo bookings...')
    
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .delete()
      .like('id', 'b%')  // Only delete seeded bookings
      .lt('created_at', '2025-12-31') // Only delete old demo data
    
    if (bookingsError) {
      console.error('❌ Failed to delete demo bookings:', bookingsError.message)
    } else {
      console.log(`✅ Deleted ${bookings?.length || 0} demo bookings`)
    }
    
    // Step 5: Clean demo parking areas
    console.log('\n5. Cleaning demo parking areas...')
    
    const { data: parkingAreas, error: parkingError } = await supabase
      .from('parking_areas')
      .delete()
      .like('id', 'p%')  // Only delete seeded parking areas
      .lt('created_at', '2025-12-31') // Only delete old demo data
    
    if (parkingError) {
      console.error('❌ Failed to delete demo parking areas:', parkingError.message)
    } else {
      console.log(`✅ Deleted ${parkingAreas?.length || 0} demo parking areas`)
    }
    
    // Step 6: Clean demo roads
    console.log('\n6. Cleaning demo roads...')
    
    const { data: roads, error: roadsError } = await supabase
      .from('roads')
      .delete()
      .like('id', 'r%')  // Only delete seeded roads
      .lt('created_at', '2025-12-31') // Only delete old demo data
    
    if (roadsError) {
      console.error('❌ Failed to delete demo roads:', roadsError.message)
    } else {
      console.log(`✅ Deleted ${roads?.length || 0} demo roads`)
    }
    
    // Step 7: Verify cleanup
    console.log('\n7. Verifying cleanup...')
    
    // Check if any demo data remains
    const { data: remainingVenues } = await supabase
      .from('venues')
      .select('id, name, created_at')
      .like('id', 'v%')
    
    const { data: remainingBookings } = await supabase
      .from('bookings')
      .select('id, title, created_at')
      .like('id', 'b%')
    
    console.log(`\n📊 CLEANUP SUMMARY:`)
    console.log(`   Remaining demo venues: ${remainingVenues?.length || 0}`)
    console.log(`   Remaining demo bookings: ${remainingBookings?.length || 0}`)
    
    if ((remainingVenues?.length || 0) === 0 && (remainingBookings?.length || 0) === 0) {
      console.log('\n✅ DEMO DATA CLEANUP COMPLETE!')
      console.log('🎉 System is ready for production!')
      console.log('\n📋 NEXT STEPS:')
      console.log('1. Create real admin and operator accounts')
      console.log('2. Test with real credentials')
      console.log('3. Remove development test files')
      console.log('4. Deploy to production')
    } else {
      console.log('\n⚠️  SOME DEMO DATA REMAINS!')
      console.log('🔍 Please review the remaining data manually')
      console.log('   - Check for any non-seeded demo data')
      console.log('   - Verify date filters in cleanup script')
      console.log('   - Run cleanup script again if needed')
    }
    
  } catch (error) {
    console.error('❌ Cleanup script failed:', error)
  }
}

// Run the cleanup
cleanupDemoData()
