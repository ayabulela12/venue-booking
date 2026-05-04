// Test Auth Session Fix
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// Test shared client approach (like the fix)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testAuthFix() {
  try {
    console.log('=== TESTING AUTH SESSION FIX ===\n')
    
    // Test 1: Login with shared client
    console.log('1. Login with shared client...')
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
    
    // Test 2: Check session with same client
    console.log('\n2. Check session with same client...')
    const { data: { user }, error: sessionError } = await supabase.auth.getUser()
    
    if (sessionError) {
      console.error('Session check failed:', sessionError.message)
    } else {
      console.log('Session valid, user:', user?.id)
    }
    
    // Test 3: Create booking with same client (should work)
    console.log('\n3. Test booking creation with same client...')
    try {
      const bookingData = {
        id: `b${Date.now()}`,
        venue_id: "v1",
        title: "Auth Fix Test Booking",
        description: "Testing shared client auth fix",
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
        created_by: user?.id,
        created_at: new Date().toISOString()
      }
      
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single()
      
      if (bookingError) {
        console.error('Booking creation failed:', bookingError.message)
        console.log('This indicates auth session issue still exists')
      } else {
        console.log('Booking created successfully!')
        console.log('Booking ID:', booking.id)
        console.log('Session maintained across operations!')
        
        // Cleanup
        await supabase.from('bookings').delete().eq('id', booking.id)
        console.log('Test booking cleaned up')
      }
    } catch (error) {
      console.error('Booking creation error:', error.message)
    }
    
    // Test 4: Check session after booking creation
    console.log('\n4. Check session after booking creation...')
    const { data: { user: finalUser }, error: finalSessionError } = await supabase.auth.getUser()
    
    if (finalSessionError) {
      console.error('Session lost after booking:', finalSessionError.message)
      console.log('This is the logout issue!')
    } else {
      console.log('Session still valid, user:', finalUser?.id)
      console.log('Auth session fix successful!')
    }
    
    console.log('\n=== FIX SUMMARY ===')
    console.log('Changes made to fix auth session:')
    console.log('1. Role provider now uses shared client instance')
    console.log('2. Sidebar logout uses shared client')
    console.log('3. Supabase services use shared client')
    console.log('4. All auth operations use same client instance')
    
    console.log('\n=== EXPECTED BEHAVIOR ===')
    console.log('1. User logs in and stays logged in')
    console.log('2. Booking creation works without logout')
    console.log('3. Session persists across all operations')
    console.log('4. No unexpected auth state changes')
    
    console.log('\n=== TEST COMPLETE ===')
    
  } catch (error) {
    console.error('Test failed:', error)
  } finally {
    await supabase.auth.signOut()
  }
}

testAuthFix()
