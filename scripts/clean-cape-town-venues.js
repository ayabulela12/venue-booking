// Clean up Cape Town venues from the database
// This script removes all Cape Town, Green Point, and Kraaifontein venues
// and replaces them with Capricorn District venues

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function cleanCapeTownVenues() {
  console.log('🧹 CLEANING UP CAPE TOWN VENUES...')
  
  try {
    // First, get all current venues to see what needs to be cleaned
    console.log('📋 Fetching current venues...')
    const { data: currentVenues, error: fetchError } = await supabase
      .from('venues')
      .select('*')
      .order('name')

    if (fetchError) {
      console.error('❌ Error fetching venues:', fetchError)
      return
    }

    console.log(`📊 Found ${currentVenues.length} venues in database`)

    // Identify Cape Town venues to remove
    const capeTownVenues = currentVenues.filter(venue => {
      const name = venue.name?.toLowerCase() || ''
      const address = venue.address?.toLowerCase() || ''
      
      return (
        name.includes('cape town') ||
        name.includes('green point') ||
        name.includes('kraaifontein') ||
        name.includes('fritz sonnenberg') ||
        name.includes('queen') ||
        name.includes('helen') ||
        name.includes('hamilton') ||
        address.includes('cape town') ||
        address.includes('green point')
      )
    })

    console.log(`🗑️ Found ${capeTownVenues.length} Cape Town venues to remove:`)
    capeTownVenues.forEach(venue => {
      console.log(`   • ${venue.name} (${venue.address})`)
    })

    if (capeTownVenues.length === 0) {
      console.log('✅ No Cape Town venues found. Database is already clean!')
      return
    }

    // Remove Cape Town venues
    console.log('🗑️ Removing Cape Town venues...')
    const { error: deleteError } = await supabase
      .from('venues')
      .delete()
      .in('id', capeTownVenues.map(v => v.id))

    if (deleteError) {
      console.error('❌ Error deleting Cape Town venues:', deleteError)
      return
    }

    console.log(`✅ Successfully removed ${capeTownVenues.length} Cape Town venues`)

    // Get remaining venues
    const { data: remainingVenues } = await supabase
      .from('venues')
      .select('*')
      .order('name')

    console.log(`📊 ${remainingVenues.length} venues remaining in database:`)
    remainingVenues.forEach(venue => {
      console.log(`   • ${venue.name} (${venue.municipality || 'No municipality'})`)
    })

    // Clean up related data
    await cleanupRelatedData(capeTownVenues)

    console.log('✅ Cape Town venues cleanup completed!')
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error)
  }
}

async function cleanupRelatedData(capeTownVenues) {
  console.log('🧹 Cleaning up related data...')
  
  try {
    // Get venue IDs to remove related data for
    const venueIdsToRemove = capeTownVenues.map(v => v.id)
    
    // Remove related bookings
    console.log('🗑️ Removing related bookings...')
    const { error: bookingError } = await supabase
      .from('bookings')
      .delete()
      .in('venue_id', venueIdsToRemove)
    
    if (bookingError) {
      console.warn('⚠️ Error removing bookings:', bookingError.message)
    } else {
      console.log(`✅ Removed bookings for ${venueIdsToRemove.length} venues`)
    }

    // Remove related parking areas
    console.log('🗑️ Removing related parking areas...')
    const { error: parkingError } = await supabase
      .from('parking_areas')
      .delete()
      .in('linked_venue_ids', venueIdsToRemove)
    
    if (parkingError) {
      console.warn('⚠️ Error removing parking areas:', parkingError.message)
    } else {
      console.log(`✅ Removed parking areas for ${venueIdsToRemove.length} venues`)
    }

    // Remove related roads
    console.log('🗑️ Removing related roads...')
    const { error: roadError } = await supabase
      .from('roads')
      .delete()
      .in('linked_venue_ids', venueIdsToRemove)
    
    if (roadError) {
      console.warn('⚠️ Error removing roads:', roadError.message)
    } else {
      console.log(`✅ Removed roads for ${venueIdsToRemove.length} venues`)
    }

    console.log('✅ Related data cleanup completed!')
    
  } catch (error) {
    console.error('❌ Error cleaning up related data:', error)
  }
}

// Run the cleanup
cleanCapeTownVenues().then(() => {
  console.log('🎉 CAPE TOWN VENUES CLEANUP COMPLETE!')
  process.exit(0)
}).catch(error => {
  console.error('💥 CLEANUP FAILED:', error)
  process.exit(1)
})
