// Debug Authentication Session Issue
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function debugAuthSession() {
  try {
    console.log('=== DEBUGGING AUTH SESSION ISSUE ===\n')
    
    // Test 1: Login as operator with main client
    console.log('1. Login with main client...')
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
    console.log('Session expires at:', authData.session?.expires_at)
    
    // Test 2: Check session with main client
    console.log('\n2. Check session with main client...')
    const { data: { user }, error: sessionError } = await supabase.auth.getUser()
    
    if (sessionError) {
      console.error('Session check failed:', sessionError.message)
    } else {
      console.log('Session valid, user:', user?.id)
    }
    
    // Test 3: Simulate getSupabaseClient behavior (new client)
    console.log('\n3. Test with new client (like getSupabaseClient)...')
    const newClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    
    const { data: { user: newUser }, error: newSessionError } = await newClient.auth.getUser()
    
    if (newSessionError) {
      console.error('New client session check failed:', newSessionError.message)
      console.log('This is the issue! New client has no session.')
    } else {
      console.log('New client session valid, user:', newUser?.id)
    }
    
    // Test 4: Try booking with new client (should fail)
    console.log('\n4. Test booking creation with new client...')
    try {
      const bookingData = {
        id: `b${Date.now()}`,
        venue_id: "v1",
        title: "Auth Test Booking",
        description: "Testing auth session issue",
        date: new Date().toISOString().split('T')[0],
        start_time: "10:00",
        end_time: "14:00",
        expected_attendance: 50,
        organizer: "Test Operator",
        risk_level: "low",
        amplified_noise: false,
        liquor_license: false,
        status: "pending",
        conflicts: [],
        created_by: newUser?.id,
        created_at: new Date().toISOString()
      }
      
      const { data: booking, error: bookingError } = await newClient
        .from('bookings')
        .insert(bookingData)
        .select()
        .single()
      
      if (bookingError) {
        console.error('Booking with new client failed:', bookingError.message)
        if (bookingError.message.includes('permission')) {
          console.log('This confirms the auth session issue!')
        }
      } else {
        console.log('Booking with new client succeeded:', booking.id)
        // Cleanup
        await newClient.from('bookings').delete().eq('id', booking.id)
      }
    } catch (error) {
      console.error('Booking creation error:', error.message)
    }
    
    // Test 5: Try booking with main client (should work)
    console.log('\n5. Test booking creation with main client...')
    try {
      const bookingData2 = {
        id: `b${Date.now()}`,
        venue_id: "v1",
        title: "Auth Test Booking (Main Client)",
        description: "Testing with main client",
        date: new Date().toISOString().split('T')[0],
        start_time: "15:00",
        end_time: "17:00",
        expected_attendance: 50,
        organizer: "Test Operator",
        risk_level: "low",
        amplified_noise: false,
        liquor_license: false,
        status: "pending",
        conflicts: [],
        created_by: user?.id,
        created_at: new Date().toISOString()
      }
      
      const { data: booking2, error: bookingError2 } = await supabase
        .from('bookings')
        .insert(bookingData2)
        .select()
        .single()
      
      if (bookingError2) {
        console.error('Booking with main client failed:', bookingError2.message)
      } else {
        console.log('Booking with main client succeeded:', booking2.id)
        // Cleanup
        await supabase.from('bookings').delete().eq('id', booking2.id)
      }
    } catch (error) {
      console.error('Booking creation error:', error.message)
    }
    
    console.log('\n=== ISSUE IDENTIFIED ===')
    console.log('PROBLEM: getSupabaseClient() creates new client instance')
    console.log('ISSUE: New client has no authentication session')
    console.log('RESULT: Booking creation fails with permission error')
    console.log('SOLUTION: Use the same client instance for authentication')
    
    console.log('\n=== SOLUTION NEEDED ===')
    console.log('1. Use global client instance (like in auth context)')
    console.log('2. Pass authenticated client to booking functions')
    console.log('3. Ensure session persistence across client instances')
    
    console.log('\n=== DEBUG COMPLETE ===')
    
  } catch (error) {
    console.error('Debug failed:', error)
  } finally {
    await supabase.auth.signOut()
  }
}

debugAuthSession()
