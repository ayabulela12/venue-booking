// Test Booking Organizer Fix
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testBookingOrganizerFix() {
  try {
    console.log('=== TESTING BOOKING ORGANIZER FIX ===\n')
    
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
    
    console.log('Using venue:', venue.name)
    
    // Test 3: Create booking with organizer field (like the fixed form)
    console.log('\n3. Testing booking creation with organizer field...')
    const bookingData = {
      venueId: venue.id,
      title: "Organizer Fix Test",
      description: "Testing organizer field fix",
      date: new Date().toISOString().split('T')[0],
      startTime: "10:00",
      endTime: "14:00",
      expectedAttendance: 50,
      organizer: "Test Operator", // This field is now filled
      riskLevel: "low",
      amplifiedNoise: false,
      liquorLicense: false,
      conflicts: [],
      createdBy: authData.user?.id
    }
    
    console.log('Booking data (with organizer):', JSON.stringify(bookingData, null, 2))
    
    // Test 4: Try to create booking
    try {
      const bookingDataForDB = {
        id: `b${Date.now()}`,
        venue_id: bookingData.venueId,
        title: bookingData.title,
        description: bookingData.description,
        date: bookingData.date,
        start_time: bookingData.startTime,
        end_time: bookingData.endTime,
        expected_attendance: bookingData.expectedAttendance,
        organizer: bookingData.organizer, // Now filled
        risk_level: bookingData.riskLevel,
        amplified_noise: bookingData.amplifiedNoise,
        liquor_license: bookingData.liquorLicense,
        status: "pending",
        conflicts: bookingData.conflicts,
        created_by: authData.user?.id,
        created_at: new Date().toISOString()
      }
      
      console.log('Final booking data for DB:', JSON.stringify(bookingDataForDB, null, 2))
      
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert(bookingDataForDB)
        .select()
        .single()
      
      if (bookingError) {
        console.error('Booking creation failed:', bookingError.message)
        console.error('Error details:', bookingError.details)
        console.error('Error code:', bookingError.code)
      } else {
        console.log('Booking created successfully!')
        console.log('Booking ID:', booking.id)
        console.log('Booking status:', booking.status)
        console.log('Organizer:', booking.organizer)
        
        // Cleanup
        await supabase.from('bookings').delete().eq('id', booking.id)
        console.log('Test booking cleaned up')
      }
    } catch (error) {
      console.error('Booking creation error:', error)
    }
    
    // Test 5: Test empty organizer (should fail)
    console.log('\n4. Testing empty organizer (should fail)...')
    try {
      const emptyOrganizerData = {
        id: `b${Date.now()}`,
        venue_id: venue.id,
        title: "Empty Organizer Test",
        description: "Testing empty organizer",
        date: new Date().toISOString().split('T')[0],
        start_time: "15:00",
        end_time: "17:00",
        expected_attendance: 50,
        organizer: "", // Empty organizer
        risk_level: "low",
        amplified_noise: false,
        liquor_license: false,
        status: "pending",
        conflicts: [],
        created_by: authData.user?.id,
        created_at: new Date().toISOString()
      }
      
      const { data: emptyBooking, error: emptyError } = await supabase
        .from('bookings')
        .insert(emptyOrganizerData)
        .select()
        .single()
      
      if (emptyError) {
        console.log('Expected error with empty organizer:', emptyError.message)
        console.log('This confirms the organizer field is required!')
      } else {
        console.log('Unexpected success with empty organizer')
        // Cleanup if it somehow succeeded
        await supabase.from('bookings').delete().eq('id', emptyBooking.id)
      }
    } catch (error) {
      console.log('Expected error with empty organizer:', error.message)
    }
    
    console.log('\n=== FIX SUMMARY ===')
    console.log('Changes made to booking form:')
    console.log('1. Added organizer field validation')
    console.log('2. Set default organizer value: "Test Operator"')
    console.log('3. Added specific error messages for different failure types')
    console.log('4. Improved error handling and user feedback')
    
    console.log('\n=== EXPECTED BEHAVIOR ===')
    console.log('1. Form opens with organizer pre-filled')
    console.log('2. Validation ensures organizer is not empty')
    console.log('3. Booking creation should work successfully')
    console.log('4. Clear error messages for any issues')
    
    console.log('\n=== TEST COMPLETE ===')
    
  } catch (error) {
    console.error('Test failed:', error)
  } finally {
    await supabase.auth.signOut()
  }
}

testBookingOrganizerFix()
