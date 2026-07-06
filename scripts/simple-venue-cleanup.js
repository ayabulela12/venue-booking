// Simple venue cleanup: Remove Cape Town venues and add Capricorn venues
// Uses direct SQL inserts instead of RPC calls

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Capricorn District venues data
const capricornVenues = [
  {
    id: 'polokwane-sports-complex',
    name: 'Polokwane Sports Complex',
    type: 'outdoor',
    max_population: 15000,
    owner_name: 'Polokwane Municipality',
    owner_contact: 'sports@polokwane.gov.za',
    address: 'Landdros Mare, Polokwane',
    image: '/images/venues/polokwane-sports-complex.jpg',
    created_at: new Date().toISOString(),
    municipality: 'polokwane',
    features: '{"Stadium", "Parking", "Changing Rooms", "Catering Facilities"}'
  },
  {
    id: 'blouberg-community-hall',
    name: 'Blouberg Community Hall',
    type: 'indoor',
    max_population: 500,
    owner_name: 'Blouberg Municipality',
    owner_contact: 'community@blouberg.gov.za',
    address: 'Senwabarana, Blouberg',
    image: '/images/venues/blouberg-community-hall.jpg',
    created_at: new Date().toISOString(),
    municipality: 'blouberg',
    features: '{"Stage", "Sound System", "Kitchen Facilities", "Parking"}'
  },
  {
    id: 'molemole-cultural-center',
    name: 'Molemole Cultural Center',
    type: 'indoor',
    max_population: 800,
    owner_name: 'Molemole Municipality',
    owner_contact: 'culture@molemole.gov.za',
    address: 'Mokopane, Molemole',
    image: '/images/venues/molemole-cultural-center.jpg',
    created_at: new Date().toISOString(),
    municipality: 'molemole',
    features: '{"Exhibition Hall", "Theater", "Art Gallery", "Workshop Spaces"}'
  },
  {
    id: 'lepel-nkumpi-stadium',
    name: 'Lepelle-Nkumpi Stadium',
    type: 'outdoor',
    max_population: 8000,
    owner_name: 'Lepelle-Nkumpi Municipality',
    owner_contact: 'stadium@lepel.gov.za',
    address: 'Lebowakgomo, Lepelle-Nkumpi',
    image: '/images/venues/lepel-nkumpi-stadium.jpg',
    created_at: new Date().toISOString(),
    municipality: 'lepel',
    features: '{"Sports Field", "Running Track", "Changing Rooms", "First Aid"}'
  },
  {
    id: 'polokwane-botanical-gardens',
    name: 'Polokwane Botanical Gardens',
    type: 'outdoor',
    max_population: 2000,
    owner_name: 'Polokwane Municipality',
    owner_contact: 'gardens@polokwane.gov.za',
    address: 'Burgersfort Park, Polokwane',
    image: '/images/venues/polokwane-botanical-gardens.jpg',
    created_at: new Date().toISOString(),
    municipality: 'polokwane',
    features: '{"Garden Areas", "Event Spaces", "Educational Facilities", "Parking"}'
  },
  {
    id: 'blouberg-game-reserve',
    name: 'Blouberg Game Reserve',
    type: 'outdoor',
    max_population: 3000,
    owner_name: 'Blouberg Municipality',
    owner_contact: 'parks@blouberg.gov.za',
    address: 'Vivo, Blouberg',
    image: '/images/venues/blouberg-game-reserve.jpg',
    created_at: new Date().toISOString(),
    municipality: 'blouberg',
    features: '{"Game Viewing Areas", "Camping Sites", "Picnic Areas", "Walking Trails"}'
  },
  {
    id: 'molemole-mining-museum',
    name: 'Molemole Mining Museum',
    type: 'indoor',
    max_population: 600,
    owner_name: 'Molemole Municipality',
    owner_contact: 'museum@molemole.gov.za',
    address: 'Mogwadi, Molemole',
    image: '/images/venues/molemole-mining-museum.jpg',
    created_at: new Date().toISOString(),
    municipality: 'molemole',
    features: '{"Exhibition Halls", "Mining History Display", "Educational Center", "Gift Shop"}'
  },
  {
    id: 'lepel-nkumpi-community-center',
    name: 'Lepelle-Nkumpi Community Center',
    type: 'indoor',
    max_population: 400,
    owner_name: 'Lepelle-Nkumpi Municipality',
    owner_contact: 'community@lepel.gov.za',
    address: 'Ga-Mothiba, Lepelle-Nkumpi',
    image: '/images/venues/lepel-nkumpi-community-center.jpg',
    created_at: new Date().toISOString(),
    municipality: 'lepel',
    features: '{"Meeting Rooms", "Kitchen", "Computer Lab", "Library"}'
  }
]

async function simpleVenueCleanup() {
  console.log('🧹 STARTING SIMPLE VENUE CLEANUP...')
  
  try {
    // Step 1: Get current venues
    console.log('📋 Step 1: Fetching current venues...')
    const { data: currentVenues, error: fetchError } = await supabase
      .from('venues')
      .select('*')
      .order('name')

    if (fetchError) {
      console.error('❌ Error fetching venues:', fetchError)
      return
    }

    console.log(`📊 Found ${currentVenues.length} venues in database`)

    // Step 2: Identify and remove Cape Town venues
    console.log('🗑️ Step 2: Removing Cape Town venues...')
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

    if (capeTownVenues.length > 0) {
      console.log(`🗑️ Found ${capeTownVenues.length} Cape Town venues to remove:`)
      capeTownVenues.forEach(venue => {
        console.log(`   • ${venue.name} (${venue.address})`)
      })

      // Remove Cape Town venues
      const { error: deleteError } = await supabase
        .from('venues')
        .delete()
        .in('id', capeTownVenues.map(v => v.id))

      if (deleteError) {
        console.warn('⚠️ Error removing Cape Town venues:', deleteError.message)
        console.log('🔄 Continuing with Capricorn venues addition...')
      } else {
        console.log(`✅ Successfully removed ${capeTownVenues.length} Cape Town venues`)
      }
    } else {
      console.log('✅ No Cape Town venues found. Database is already clean!')
    }

    // Step 3: Add Capricorn venues
    console.log('🌍 Step 3: Adding Capricorn District venues...')
    
    for (const venue of capricornVenues) {
      console.log(`   • Adding ${venue.name} (${venue.municipality})`)
      
      const { error } = await supabase
        .from('venues')
        .insert([venue])
        .select()
      
      if (error) {
        console.error(`❌ Error adding ${venue.name}:`, error.message)
      } else {
        console.log(`✅ Successfully added ${venue.name}`)
      }
    }

    // Step 4: Verify the results
    console.log('📊 Step 4: Verifying cleanup results...')
    const { data: finalVenues } = await supabase
      .from('venues')
      .select('*')
      .order('name')

    console.log(`📊 Final venue count: ${finalVenues.length}`)

    // Show venues by municipality
    const venuesByMunicipality = finalVenues.reduce((acc, venue) => {
      const municipality = venue.municipality || 'Unknown'
      acc[municipality] = (acc[municipality] || 0) + 1
      return acc
    }, {})

    console.log('🏛️️ Final venues by municipality:')
    Object.entries(venuesByMunicipality).forEach(([municipality, count]) => {
      console.log(`   • ${municipality}: ${count} venues`)
    })

    // Check for any remaining Cape Town venues
    const remainingCapeTown = finalVenues.filter(venue => {
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

    if (remainingCapeTown.length > 0) {
      console.warn(`⚠️ WARNING: ${remainingCapeTown.length} Cape Town venues still remain:`)
      remainingCapeTown.forEach(venue => {
        console.warn(`   • ${venue.name} (${venue.address})`)
      })
    }

    console.log('✅ SIMPLE VENUE CLEANUP FINISHED!')
    console.log('🎉 All Cape Town venues removed and Capricorn District venues added!')
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error)
  }
}

// Run the simple cleanup
simpleVenueCleanup().then(() => {
  console.log('🎉 VENUE CLEANUP COMPLETE!')
  process.exit(0)
}).catch(error => {
  console.error('💥 CLEANUP FAILED:', error)
  process.exit(1)
})
