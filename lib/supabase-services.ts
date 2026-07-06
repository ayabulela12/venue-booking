import { getSupabaseClient } from "./supabase-client"
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

function messageFromPostgrestError(error: {
  message?: string
  code?: string
  details?: string | null
  hint?: string | null
}): string {
  const parts = [error.message, error.hint ?? undefined, error.details ?? undefined].filter(
    (s): s is string => typeof s === "string" && s.length > 0
  )
  return parts.join(" — ") || "Database request failed"
}

// Supabase service functions for database operations

const VENUE_IMAGE_BUCKET = "venue-images"

function authMetadataString(
  user: { user_metadata?: Record<string, unknown>; app_metadata?: Record<string, unknown> } | null,
  key: string
): string | undefined {
  if (!user) return undefined
  const fromUser = user.user_metadata?.[key]
  if (typeof fromUser === "string" && fromUser.length > 0) return fromUser
  const fromApp = user.app_metadata?.[key]
  if (typeof fromApp === "string" && fromApp.length > 0) return fromApp
  return undefined
}

/** Upload a venue image using the signed-in user's session (required for storage RLS). */
export async function uploadVenueImage(file: File): Promise<string> {
  const supabase = getSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    throw new Error("You must be signed in to upload venue images.")
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Please select a valid image file.")
  }

  const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg"
  const filePath = `venues/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from(VENUE_IMAGE_BUCKET)
    .upload(filePath, file, {
      upsert: false,
      contentType: file.type,
    })

  if (uploadError) {
    if (
      uploadError.message?.includes("policy") ||
      uploadError.message?.includes("row-level security")
    ) {
      throw new Error(
        "Storage permissions not configured. Run scripts/venue-images-storage-rls.sql in Supabase."
      )
    }
    if (uploadError.message?.includes("bucket") || uploadError.message?.includes("not found")) {
      throw new Error(
        'Storage bucket "venue-images" not found. Create a public bucket with that name in Supabase Storage.'
      )
    }
    throw uploadError
  }

  const { data: publicUrlData } = supabase.storage.from(VENUE_IMAGE_BUCKET).getPublicUrl(filePath)
  return publicUrlData.publicUrl
}

// Venue operations
export async function fetchVenues(): Promise<Venue[]> {
  const { data, error } = await getSupabaseClient()
    .from('venues')
    .select('*')
    .order('name')

  if (error) throw error
  return transformVenues(data || [])
}

export async function fetchVenueById(id: string): Promise<Venue | null> {
  const { data, error } = await getSupabaseClient()
    .from('venues')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data ? transformVenue(data) : null
}

export async function createVenue(venue: Omit<Venue, "createdAt"> & { id?: string }): Promise<Venue> {
  const supabase = getSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("You must be signed in to create a venue.")
  }

  const municipality =
    venue.municipality ?? authMetadataString(user, "municipality") ?? undefined

  const venueData: Record<string, unknown> = {
    id: venue.id?.trim() ? venue.id.trim() : `v${Date.now()}`,
    name: venue.name,
    type: venue.type,
    max_population: venue.maxPopulation,
    owner_name: venue.ownerName,
    owner_contact: venue.ownerContact,
    address: venue.address,
    image: venue.image ?? null,
    features: venue.features ?? [],
    activities: venue.activities ?? [],
    created_at: new Date().toISOString(),
  }

  if (municipality) {
    venueData.municipality = municipality
  }
  if (venue.aboutVenue !== undefined) {
    venueData.about_venue = venue.aboutVenue
  }

  const { data, error } = await supabase
    .from('venues')
    .insert(venueData)
    .select()
    .single()

  if (error) {
    // Provide better error messages for RLS policy issues
    if (error.message?.includes('permission denied') || error.code === '42501') {
      throw new Error('Database permissions not configured. Please contact administrator to set up RLS policies for venues table.')
    } else if (error.message?.includes('row-level security')) {
      throw new Error('Row Level Security policy violation. Please check database policies for venues table.')
    } else {
      throw error
    }
  }
  
  return transformVenue(data)
}

export async function updateVenue(venue: Venue): Promise<Venue> {
  // Build update payload, only including fields that exist in database
  const updatePayload: Record<string, unknown> = {
    name: venue.name,
    type: venue.type,
    max_population: venue.maxPopulation,
    owner_name: venue.ownerName,
    owner_contact: venue.ownerContact,
    address: venue.address,
    image: venue.image ?? null,
    features: venue.features ?? [],
    activities: venue.activities ?? [],
  }

  if (venue.aboutVenue !== undefined) {
    updatePayload.about_venue = venue.aboutVenue
  }
  if (venue.municipality !== undefined) {
    updatePayload.municipality = venue.municipality
  }

  const { data, error } = await getSupabaseClient()
    .from('venues')
    .update(updatePayload)
    .eq('id', venue.id)
    .select()
    .single()

  if (error) {
    // Provide better error messages for RLS policy issues
    if (error.message?.includes('permission denied') || error.code === '42501') {
      throw new Error('Database permissions not configured. Please contact administrator to set up RLS policies for venues table.')
    } else if (error.message?.includes('row-level security')) {
      throw new Error('Row Level Security policy violation. Please check database policies for venues table.')
    } else {
      throw error
    }
  }
  
  return transformVenue(data)
}

export async function deleteVenue(id: string): Promise<void> {
  const { error } = await getSupabaseClient()
    .from("venues")
    .delete()
    .eq("id", id)

  if (error) {
    const text = messageFromPostgrestError(error)
    if (error.code === "42501" || error.message?.includes("permission denied")) {
      throw new Error(
        `Could not delete venue: ${text}. If policies are already correct, run GRANT on public.venues for role authenticated (see scripts/venues-rls-jwt-metadata.sql). Otherwise sign in again or fix RLS.`
      )
    }
    if (error.message?.toLowerCase().includes("row-level security")) {
      throw new Error(`Could not delete venue (RLS): ${text}`)
    }
    throw new Error(`Could not delete venue: ${text}`)
  }
}

// Booking operations
export async function fetchBookings(): Promise<Booking[]> {
  const { data, error } = await getSupabaseClient()
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
  const { data: { user }, error: authError } = await getSupabaseClient().auth.getUser()
  const venueId = booking.venueId?.trim()

  if (!venueId) {
    throw new Error("Venue selection is required before creating a booking.")
  }

  if (authError) {
    console.error("createBooking auth error:", {
      code: authError.code,
      message: authError.message,
      status: authError.status
    })
  }
  
  // Check for existing confirmed bookings at the same venue and time
  const { data: existingBookings } = await getSupabaseClient()
    .from('bookings')
    .select('*')
    .eq('venue_id', venueId)
    .eq('date', booking.date)
    .eq('status', 'confirmed')
    .or(`start_time.lte.${booking.endTime},end_time.gte.${booking.startTime}`)

  if (existingBookings && existingBookings.length > 0) {
    throw new Error('This venue is already booked for the selected time. Please choose a different time or venue.')
  }
  
  const { data: venueRow } = await getSupabaseClient()
    .from("venues")
    .select("municipality")
    .eq("id", venueId)
    .maybeSingle()

  const municipality =
    (venueRow?.municipality as string | undefined) ??
    authMetadataString(user, "municipality")

  // Force status to "pending" regardless of input
  const bookingData: Record<string, unknown> = {
    id: `b${Date.now()}`,
    venue_id: venueId,
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
    created_at: new Date().toISOString(),
  }

  if (municipality) {
    bookingData.municipality = municipality
  }

  const { data, error } = await getSupabaseClient()
    .from('bookings')
    .insert(bookingData)
    .select()
    .single()

  if (error) {
    // Provide better error messages for RLS policy issues
    if (error.message?.includes('permission denied') || error.code === '42501') {
      throw new Error('Database permissions not configured. Please contact administrator to set up RLS policies for bookings table.')
    } else if (error.message?.includes('row-level security')) {
      throw new Error('Row Level Security policy violation. Please check database policies for bookings table.')
    } else if (error.message?.includes('duplicate key') || error.code === '23505') {
      throw new Error('This booking already exists. Please choose a different time or venue.')
    } else if (error.message?.includes('foreign key') || error.code === '23503') {
      throw new Error('Selected venue not found. Please select a valid venue.')
    } else {
      throw error
    }
  }
  
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

  const { data, error } = await getSupabaseClient()
    .from('bookings')
    .update(bookingData)
    .eq('id', booking.id)
    .select()
    .single()

  if (error) throw error
  
  return transformBooking(data)
}

export async function deleteBooking(id: string): Promise<void> {
  const { error } = await getSupabaseClient()
    .from('bookings')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Trigger log operations
export async function createTriggerLog(log: Omit<TriggerLog, 'id' | 'timestamp'>): Promise<TriggerLog> {
  const { data, error } = await getSupabaseClient()
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
  const { data, error } = await getSupabaseClient()
    .from('trigger_logs')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return transformTriggerLogs(data || [])
}

// Override log operations
export async function createOverrideLog(log: Omit<OverrideLog, 'id' | 'timestamp'>): Promise<OverrideLog> {
  const { data, error } = await getSupabaseClient()
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
  const { data, error } = await getSupabaseClient()
    .from('override_logs')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return transformOverrideLogs(data || [])
}

// Parking area operations
export async function fetchParkingAreas(): Promise<ParkingArea[]> {
  const { data, error } = await getSupabaseClient()
    .from('parking_areas')
    .select('*')
    .order('name')

  if (error) throw error
  return transformParkingAreas(data || [])
}

// Road operations
export async function fetchRoads(): Promise<Road[]> {
  const { data, error } = await getSupabaseClient()
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
  const { data: booking, error: fetchError } = await getSupabaseClient()
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .single()
    
  if (fetchError) {
    console.error("CONFIRM FETCH ERROR:", fetchError)
    throw new Error(`Failed to fetch booking: ${fetchError.message}`)
  }
  
  // Check for existing confirmed bookings at the same venue and time
  const { data: existingBookings } = await getSupabaseClient()
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
  const { data, error } = await getSupabaseClient()
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
  
  const { data, error } = await getSupabaseClient()
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
  const { data: { user }, error: authError } = await getSupabaseClient().auth.getUser()
  
  if (authError || !user) throw new Error("Unauthenticated")
  
  console.log("CANCEL DEBUG: Attempting to cancel booking", { bookingId, userId: user.id })

  const { data, error } = await getSupabaseClient()
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
  return getSupabaseClient()
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
  return getSupabaseClient()
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
  return getSupabaseClient()
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
  return getSupabaseClient()
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
