import { createClient } from "@supabase/supabase-js"
import { 
  transformVenues, 
  transformBookings, 
  transformParkingAreas, 
  transformRoads, 
  transformTriggerLogs, 
  transformOverrideLogs,
  transformVenue,
  transformBooking
} from "./data-transform"
import type { 
  Venue, 
  Booking, 
  TriggerLog, 
  OverrideLog, 
  ParkingArea, 
  Road,
  AppState 
} from "./types"

// Use shared client to maintain auth session
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Supabase service functions for database operations

// Venue operations
export async function fetchVenues(): Promise<Venue[]> {
  const { data, error } = await supabase
    .from('venues')
    .select('*')
    .order('name')

  if (error) throw error
  return transformVenues(data || [])
}

export async function createVenue(venue: Omit<Venue, 'id' | 'createdAt'>): Promise<Venue> {
  const { data, error } = await supabase
    .from('venues')
    .insert({
      id: `v${Date.now()}`,
      name: venue.name,
      type: venue.type,
      max_population: venue.maxPopulation,
      owner_name: venue.ownerName,
      owner_contact: venue.ownerContact,
      address: venue.address,
      image: venue.image,
      created_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  return transformVenue(data)
}

export async function updateVenue(venue: Venue): Promise<Venue> {
  const { data, error } = await supabase
    .from('venues')
    .update(venue)
    .eq('id', venue.id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteVenue(id: string): Promise<void> {
  const { error } = await supabase
    .from('venues')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Booking operations
export async function fetchBookings(): Promise<Booking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      venues:venue_id (
        id,
        name
      )
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  
  // Transform the data to match our types
  return transformBookings(data || [])
}

export async function createBooking(booking: Omit<Booking, 'id' | 'createdAt'>): Promise<Booking> {
  const { data: { user } } = await supabase.auth.getUser()
  
  // Check for existing confirmed bookings at the same venue and time
  const { data: existingBookings } = await supabase
    .from('bookings')
    .select('*')
    .eq('venue_id', booking.venueId)
    .eq('date', booking.date)
    .eq('status', 'confirmed')
    .or(`start_time.lte.${booking.endTime},end_time.gte.${booking.startTime}`)

  if (existingBookings && existingBookings.length > 0) {
    throw new Error('This venue is already booked for the selected time. Please choose a different time or venue.')
  }
  
  // Force status to "pending" regardless of input
  const bookingData = {
    id: `b${Date.now()}`,
    venue_id: booking.venueId,
    title: booking.title,
    description: booking.description,
    date: booking.date,
    start_time: booking.startTime,
    end_time: booking.endTime,
    expected_attendance: booking.expectedAttendance,
    organizer: booking.organizer,
    risk_level: booking.riskLevel,
    amplified_noise: booking.amplifiedNoise,
    liquor_license: booking.liquorLicense,
    status: "pending", // Always create as pending
    override_reason: booking.overrideReason,
    overridden_by: booking.overriddenBy,
    overridden_at: booking.overriddenAt,
    conflicts: booking.conflicts,
    created_by: user?.id || null,
    created_at: new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('bookings')
    .insert(bookingData)
    .select()
    .single()

  if (error) throw error
  
  return transformBooking(data)
}

export async function updateBooking(booking: Booking): Promise<Booking> {
  const bookingData = {
    venue_id: booking.venueId,
    title: booking.title,
    description: booking.description,
    date: booking.date,
    start_time: booking.startTime,
    end_time: booking.endTime,
    expected_attendance: booking.expectedAttendance,
    organizer: booking.organizer,
    risk_level: booking.riskLevel,
    amplified_noise: booking.amplifiedNoise,
    liquor_license: booking.liquorLicense,
    status: booking.status,
    override_reason: booking.overrideReason,
    overridden_by: booking.overriddenBy,
    overridden_at: booking.overriddenAt,
    conflicts: booking.conflicts,
  }

  const { data, error } = await supabase
    .from('bookings')
    .update(bookingData)
    .eq('id', booking.id)
    .select()
    .single()

  if (error) throw error
  
  return transformBooking(data)
}

export async function deleteBooking(id: string): Promise<void> {
  const { error } = await supabase
    .from('bookings')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Trigger log operations
export async function createTriggerLog(log: Omit<TriggerLog, 'id' | 'timestamp'>): Promise<TriggerLog> {
  const { data, error } = await supabase
    .from('trigger_logs')
    .insert({
      ...log,
      id: `tl${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function fetchTriggerLogs(): Promise<TriggerLog[]> {
  const { data, error } = await supabase
    .from('trigger_logs')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return transformTriggerLogs(data || [])
}

// Override log operations
export async function createOverrideLog(log: Omit<OverrideLog, 'id' | 'timestamp'>): Promise<OverrideLog> {
  const { data, error } = await supabase
    .from('override_logs')
    .insert({
      ...log,
      id: `ol${Date.now()}`,
      timestamp: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function fetchOverrideLogs(): Promise<OverrideLog[]> {
  const { data, error } = await supabase
    .from('override_logs')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return transformOverrideLogs(data || [])
}

// Parking area operations
export async function fetchParkingAreas(): Promise<ParkingArea[]> {
  const { data, error } = await supabase
    .from('parking_areas')
    .select('*')
    .order('name')

  if (error) throw error
  return transformParkingAreas(data || [])
}

// Road operations
export async function fetchRoads(): Promise<Road[]> {
  const { data, error } = await supabase
    .from('roads')
    .select('*')
    .order('name')

  if (error) throw error
  return transformRoads(data || [])
}

// Admin booking status actions
export async function confirmBooking(bookingId: string): Promise<Booking> {
  console.log("CONFIRM DEBUG: Attempting to confirm booking", { bookingId })
  
  // First get the booking to check conflicts
  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .single()
    
  if (fetchError) {
    console.error("CONFIRM FETCH ERROR:", fetchError)
    throw new Error(`Failed to fetch booking: ${fetchError.message}`)
  }
  
  // Check for existing confirmed bookings at the same venue and time
  const { data: existingBookings } = await supabase
    .from('bookings')
    .select('*')
    .eq('venue_id', booking.venue_id)
    .eq('date', booking.date)
    .eq('status', 'confirmed')
    .neq('id', bookingId)
    .or(`start_time.lte.${booking.end_time},end_time.gte.${booking.start_time}`)

  if (existingBookings && existingBookings.length > 0) {
    console.error("CONFIRM CONFLICT:", existingBookings)
    throw new Error('Cannot confirm: This venue already has a confirmed booking for the selected time.')
  }
  
  // Update the booking
  const { data, error } = await supabase
    .from('bookings')
    .update({ status: 'confirmed' })
    .eq('id', bookingId)
    .select()

  console.log("CONFIRM RESULT:", { data, error })

  if (error) {
    console.error("CONFIRM ERROR:", error)
    throw new Error(`Failed to confirm booking: ${error.message}`)
  }
  
  if (!data || data.length === 0) {
    console.error("CONFIRM FAILED: No rows updated - likely RLS blocking")
    throw new Error("Confirm failed: Booking not found or you don't have permission to confirm this booking")
  }
  
  console.log("CONFIRM SUCCESS:", data[0])
  return transformBooking(data[0])
}

export async function denyBooking(bookingId: string, reason: string): Promise<Booking> {
  console.log("DENY DEBUG: Attempting to deny booking", { bookingId, reason })
  
  const { data, error } = await supabase
    .from('bookings')
    .update({ 
      status: 'denied',
      denial_reason: reason
    })
    .eq('id', bookingId)
    .select()

  console.log("DENY RESULT:", { data, error })

  if (error) {
    console.error("DENY ERROR:", error)
    throw new Error(`Failed to deny booking: ${error.message}`)
  }
  
  if (!data || data.length === 0) {
    console.error("DENY FAILED: No rows updated - likely RLS blocking")
    throw new Error("Deny failed: Booking not found or you don't have permission to deny this booking")
  }
  
  console.log("DENY SUCCESS:", data[0])
  return transformBooking(data[0])
}

// Operator can cancel their own bookings
export async function cancelBooking(bookingId: string, userId?: string): Promise<Booking> {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) throw new Error("Unauthenticated")
  
  console.log("CANCEL DEBUG: Attempting to cancel booking", { bookingId, userId: user.id })

  const { data, error } = await supabase
    .from('bookings')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
    })
    .eq('id', bookingId)
    .eq('created_by', user.id) // Use created_by instead of operator_id
    .select()

  console.log("CANCEL RESULT:", { data, error })

  if (error) throw new Error(error.message)

  // 🚨 THIS IS THE FIX - Expose silent failures
  if (!data || data.length === 0) {
    throw new Error("Cancel failed: booking not found or not allowed by RLS")
  }

  return transformBooking(data[0])
}

// Real-time subscription functions
export function subscribeToBookings(callback: (booking: Booking) => void) {
  return supabase
    .channel('bookings')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'bookings' 
      }, 
      (payload: any) => {
        if (payload.new) {
          callback(transformBooking(payload.new))
        }
      }
    )
    .subscribe()
}

export function subscribeToVenues(callback: (venue: Venue) => void) {
  return supabase
    .channel('venues')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'venues' 
      }, 
      (payload: any) => {
        if (payload.new) {
          callback(transformVenue(payload.new))
        }
      }
    )
    .subscribe()
}

export function subscribeToTriggerLogs(callback: (log: TriggerLog) => void) {
  return supabase
    .channel('trigger_logs')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'trigger_logs' 
      }, 
      (payload: any) => {
        if (payload.new) {
          const transformedLog = transformTriggerLogs([payload.new])
          if (transformedLog.length > 0) {
            callback(transformedLog[0])
          }
        }
      }
    )
    .subscribe()
}

export function subscribeToOverrideLogs(callback: (log: OverrideLog) => void) {
  return supabase
    .channel('override_logs')
    .on('postgres_changes', 
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'override_logs' 
      }, 
      (payload: any) => {
        if (payload.new) {
          const transformedLog = transformOverrideLogs([payload.new])
          if (transformedLog.length > 0) {
            callback(transformedLog[0])
          }
        }
      }
    )
    .subscribe()
}

// Initial data fetch function
export async function fetchInitialData(): Promise<AppState> {
  try {
    // Fetch core data first (venues and bookings)
    const [venues, bookings] = await Promise.all([
      fetchVenues(),
      fetchBookings()
    ])

    // Try to fetch optional data, but don't fail if permissions are blocked
    let parkingAreas = []
    let roads = []
    let triggerLogs = []
    let overrideLogs = []

    try {
      parkingAreas = await fetchParkingAreas()
    } catch (error) {
      console.warn('Parking areas not accessible:', error.message)
    }

    try {
      roads = await fetchRoads()
    } catch (error) {
      console.warn('Roads not accessible:', error.message)
    }

    try {
      triggerLogs = await fetchTriggerLogs()
    } catch (error) {
      console.warn('Trigger logs not accessible:', error.message)
    }

    try {
      overrideLogs = await fetchOverrideLogs()
    } catch (error) {
      console.warn('Override logs not accessible:', error.message)
    }

    return {
      venues,
      bookings,
      parkingAreas,
      roads,
      triggerLogs,
      overrideLogs
    }
  } catch (error) {
    console.error('Error fetching initial data:', error)
    // Return empty state as fallback
    return {
      venues: [],
      bookings: [],
      parkingAreas: [],
      roads: [],
      triggerLogs: [],
      overrideLogs: []
    }
  }
}
