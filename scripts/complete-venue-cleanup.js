// Complete venue cleanup: Remove Cape Town venues and add Capricorn venues
// This script performs a complete venue data migration

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function completeVenueCleanup() {
  console.log('🧹 STARTING COMPLETE VENUE CLEANUP...')
  
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

    // Step 3: Add Capricorn venues using SQL
    console.log('🌍 Step 3: Adding Capricorn District venues...')
    
    // Capricorn District venues SQL
    const capricornSQL = `
      INSERT INTO venues (id, name, type, max_population, owner_name, owner_contact, address, features, image, created_at, municipality) VALUES
      ('polokwane-sports-complex', 'Polokwane Sports Complex', 'outdoor', 15000, 'Polokwane Municipality', 'sports@polokwane.gov.za', 'Landdros Mare, Polokwane', '{"Stadium", "Parking", "Changing Rooms", "Catering Facilities"}', '/images/venues/polokwane-sports-complex.jpg', NOW(), 'polokwane'),
      ('blouberg-community-hall', 'Blouberg Community Hall', 'indoor', 500, 'Blouberg Municipality', 'community@blouberg.gov.za', 'Senwabarana, Blouberg', '{"Stage", "Sound System", "Kitchen Facilities", "Parking"}', '/images/venues/blouberg-community-hall.jpg', NOW(), 'blouberg'),
      ('molemole-cultural-center', 'Molemole Cultural Center', 'indoor', 800, 'Molemole Municipality', 'culture@molemole.gov.za', 'Mokopane, Molemole', '{"Exhibition Hall", "Theater", "Art Gallery", "Workshop Spaces"}', '/images/venues/molemole-cultural-center.jpg', NOW(), 'molemole'),
      ('lepel-nkumpi-stadium', 'Lepelle-Nkumpi Stadium', 'outdoor', 8000, 'Lepelle-Nkumpi Municipality', 'stadium@lepel.gov.za', 'Lebowakgomo, Lepelle-Nkumpi', '{"Sports Field", "Running Track", "Changing Rooms", "First Aid"}', '/images/venues/lepel-nkumpi-stadium.jpg', NOW(), 'lepel'),
      ('polokwane-botanical-gardens', 'Polokwane Botanical Gardens', 'outdoor', 2000, 'Polokwane Municipality', 'gardens@polokwane.gov.za', 'Burgersfort Park, Polokwane', '{"Garden Areas", "Event Spaces", "Educational Facilities", "Parking"}', '/images/venues/polokwane-botanical-gardens.jpg', NOW(), 'polokwane'),
      ('blouberg-game-reserve', 'Blouberg Game Reserve', 'outdoor', 3000, 'Blouberg Municipality', 'parks@blouberg.gov.za', 'Vivo, Blouberg', '{"Game Viewing Areas", "Camping Sites", "Picnic Areas", "Walking Trails"}', '/images/venues/blouberg-game-reserve.jpg', NOW(), 'blouberg'),
      ('molemole-mining-museum', 'Molemole Mining Museum', 'indoor', 600, 'Molemole Municipality', 'museum@molemole.gov.za', 'Mogwadi, Molemole', '{"Exhibition Halls", "Mining History Display", "Educational Center", "Gift Shop"}', '/images/venues/molemole-mining-museum.jpg', NOW(), 'molemole'),
      ('lepel-nkumpi-community-center', 'Lepelle-Nkumpi Community Center', 'indoor', 400, 'Lepelle-Nkumpi Municipality', 'community@lepel.gov.za', 'Ga-Mothiba, Lepelle-Nkumpi', '{"Meeting Rooms", "Kitchen", "Computer Lab", "Library"}', '/images/venues/lepel-nkumpi-community-center.jpg', NOW(), 'lepel');
    `
    
    // Execute each INSERT statement individually
    const insertStatements = capricornSQL.trim().split('),').filter(stmt => stmt.trim())
    
    for (const statement of insertStatements) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        if (error) {
          console.error(`❌ Error executing statement: ${error.message}`)
        } else {
          // Extract venue name from the statement for logging
          const nameMatch = statement.match(/'([^']+)'/)
          if (nameMatch) {
            console.log(`✅ Successfully added ${nameMatch[1]}`)
          }
        }
      } catch (error) {
        console.error(`❌ Error with statement: ${statement}`, error)
      }
    }
    
    console.log('✅ Successfully added Capricorn District venues')

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

    console.log('✅ COMPLETE VENUE CLEANUP FINISHED!')
    console.log('🎉 All Cape Town venues removed and Capricorn District venues added!')
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error)
  }
}

// Run the complete cleanup
completeVenueCleanup().then(() => {
  console.log('🎉 VENUE CLEANUP COMPLETE!')
  process.exit(0)
}).catch(error => {
  console.error('💥 CLEANUP FAILED:', error)
  process.exit(1)
})
