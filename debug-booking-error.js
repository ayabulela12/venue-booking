// Debug Booking Creation Error
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function debugBookingError() {
  try {
    console.log('=== DEBUGGING BOOKING CREATION ERROR ===\n')
    
    // Test 1: Login as operator
    console.log('1. Testing operator login...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: "oparator@test.com",
      password: "Test1234"
    })
    
    if (authError) {
      console.error('Login failed:', authError.message)
      return
    }
    
    console.log('Login successful!')
    console.log('User ID:', authData.user?.id)
    
    // Test 2: Get venues
    console.log('\n2. Getting venues...')
    const { data: venues, error: venuesError } = await supabase
      .from('venues')
      .select('*')
      .limit(1)
      
    if (venuesError) {
      console.error('Venues fetch error:', venuesError.message)
      return
    }
    
    const venue = venues?.[0]
    if (!venue) {
      console.error('No venues found')
      return
    }
    
    console.log('Using venue:', venue.name, '(ID:', venue.id, ')')
    
    // Test 3: Create booking data like the form does
    console.log('\n3. Testing booking creation with form data...')
    const bookingData = {
      venueId: venue.id,
      title: "Debug Test Booking",
      description: "Testing booking creation error",
      date: new Date().toISOString().split('T')[0],
      startTime: "10:00",
      endTime: "14:00",
      expectedAttendance: 50,
      organizer: "Test Operator",
      riskLevel: "low",
      amplifiedNoise: false,
      liquorLicense: false,
      conflicts: [],
      createdBy: authData.user?.id
    }
    
    console.log('Booking data:', JSON.stringify(bookingData, null, 2))
    
    // Test 4: Try to create booking using the same process as the app
    console.log('\n4. Testing createBooking function simulation...')
    try {
      // Simulate the createBooking function from supabase-services.ts
      const bookingDataForDB = {
        id: `b${Date.now()}`,
        venue_id: bookingData.venueId,
        title: bookingData.title,
        description: bookingData.description,
        date: bookingData.date,
        start_time: bookingData.startTime,
        end_time: bookingData.endTime,
        expected_attendance: bookingData.expectedAttendance,
        organizer: bookingData.organizer,
        risk_level: bookingData.riskLevel,
        amplified_noise: bookingData.amplifiedNoise,
        liquor_license: bookingData.liquorLicense,
        status: "pending",
        conflicts: bookingData.conflicts,
        created_by: authData.user?.id,
        created_at: new Date().toISOString()
      }
      
      console.log('Final booking data for DB:', JSON.stringify(bookingDataForDB, null, 2))
      
      // Check for existing confirmed bookings at the same venue and time
      console.log('\n5. Checking for existing bookings...')
      const { data: existingBookings, error: existingError } = await supabase
        .from('bookings')
        .select('*')
        .eq('venue_id', bookingDataForDB.venue_id)
        .eq('date', bookingDataForDB.date)
        .eq('status', 'confirmed')
        .or(`start_time.lte.${bookingDataForDB.end_time},end_time.gte.${bookingDataForDB.start_time}`)
      
      if (existingError) {
        console.error('Error checking existing bookings:', existingError.message)
      } else {
        console.log('Existing bookings found:', existingBookings?.length || 0)
        if (existingBookings && existingBookings.length > 0) {
          console.log('Conflict detected! Existing bookings:')
          existingBookings.forEach(booking => {
            console.log(`  - ${booking.title} (${booking.start_time} - ${booking.end_time})`)
          })
          console.log('This might be causing the booking to fail!')
        }
      }
      
      // Try to insert the booking
      console.log('\n6. Attempting to insert booking...')
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert(bookingDataForDB)
        .select()
        .single()
      
      if (bookingError) {
        console.error('Booking creation failed:', bookingError.message)
        console.error('Error details:', bookingError.details)
        console.error('Error hint:', bookingError.hint)
        console.error('Error code:', bookingError.code)
        
        // Common issues and solutions
        console.log('\n=== POSSIBLE ISSUES & SOLUTIONS ===')
        
        if (bookingError.code === '42501') {
          console.log('ISSUE: RLS policy permission denied')
          console.log('SOLUTION: Check RLS policies on bookings table')
        }
        
        if (bookingError.code === '23505') {
          console.log('ISSUE: Duplicate key constraint violation')
          console.log('SOLUTION: Check for duplicate booking ID or unique constraints')
        }
        
        if (bookingError.code === '23502') {
          console.log('ISSUE: Not-null constraint violation')
          console.log('SOLUTION: Check required fields are not null')
        }
        
        if (bookingError.code === '23503') {
          console.log('ISSUE: Foreign key constraint violation')
          console.log('SOLUTION: Check venue_id exists in venues table')
        }
        
        if (bookingError.message.includes('permission')) {
          console.log('ISSUE: Permission denied')
          console.log('SOLUTION: Check user has insert permissions on bookings table')
        }
        
      } else {
        console.log('Booking created successfully!')
        console.log('Booking ID:', booking.id)
        console.log('Booking status:', booking.status)
        
        // Cleanup
        await supabase.from('bookings').delete().eq('id', booking.id)
        console.log('Test booking cleaned up')
      }
    } catch (error) {
      console.error('Unexpected error:', error)
    }
    
    console.log('\n=== DEBUG COMPLETE ===')
    
  } catch (error) {
    console.error('Debug failed:', error)
  } finally {
    await supabase.auth.signOut()
  }
}

debugBookingError()
