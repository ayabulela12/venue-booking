// Add Capricorn District venues to replace Cape Town venues
// This script adds proper Capricorn District venues with all 4 municipalities

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
    features: ['Stadium', 'Parking', 'Changing Rooms', 'Catering Facilities']
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
    features: ['Stage', 'Sound System', 'Kitchen Facilities', 'Parking']
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
    features: ['Exhibition Hall', 'Theater', 'Art Gallery', 'Workshop Spaces']
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
    features: ['Sports Field', 'Running Track', 'Changing Rooms', 'First Aid']
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
    features: ['Garden Areas', 'Event Spaces', 'Educational Facilities', 'Parking']
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
    features: ['Game Viewing Areas', 'Camping Sites', 'Picnic Areas', 'Walking Trails']
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
    features: ['Exhibition Halls', 'Mining History Display', 'Educational Center', 'Gift Shop']
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
    features: ['Meeting Rooms', 'Kitchen', 'Computer Lab', 'Library']
  }
]

async function addCapricornVenues() {
  console.log('🌍 ADDING CAPRICORN DISTRICT VENUES...')
  
  try {
    // Add all Capricorn District venues
    console.log(`📊 Adding ${capricornVenues.length} Capricorn District venues...`)
    
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

    // Verify the venues were added
    const { data: allVenues } = await supabase
      .from('venues')
      .select('*')
      .order('name')

    console.log(`📊 Total venues in database: ${allVenues.length}`)
    
    // Show Capricorn venues by municipality
    const venuesByMunicipality = allVenues.reduce((acc, venue) => {
      const municipality = venue.municipality || 'Unknown'
      acc[municipality] = (acc[municipality] || 0) + 1
      return acc
    }, {})

    console.log('🏛️️ Venues by municipality:')
    Object.entries(venuesByMunicipality).forEach(([municipality, count]) => {
      console.log(`   • ${municipality}: ${count} venues`)
    })

    console.log('✅ Capricorn District venues addition completed!')
    
  } catch (error) {
    console.error('❌ Error adding Capricorn venues:', error)
  }
}

// Run the venue addition
addCapricornVenues().then(() => {
  console.log('🎉 CAPRICORN DISTRICT VENUES ADDITION COMPLETE!')
  process.exit(0)
}).catch(error => {
  console.error('💥 VENUE ADDITION FAILED:', error)
  process.exit(1)
})
