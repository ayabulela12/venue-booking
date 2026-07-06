// Data transformation utilities for Supabase to frontend mapping
import type { Venue, Booking, ParkingArea, Road, TriggerLog, OverrideLog } from './types'

// Transform snake_case to camelCase for venues
export function transformVenue(venue: any): Venue {
  return {
    id: venue.id,
    name: venue.name,
    type: venue.type,
    maxPopulation: venue.max_population,
    ownerName: venue.owner_name,
    ownerContact: venue.owner_contact,
    address: venue.address,
    aboutVenue: venue.about_venue,
    features: venue.features || [],
    activities: venue.activities || [],
    image: venue.image,
    municipality: venue.municipality,
    createdAt: venue.created_at
  }
}

// Transform multiple venues
export function transformVenues(venues: any[]): Venue[] {
  return venues.map(transformVenue)
}

// Transform snake_case to camelCase for bookings
export function transformBooking(booking: any): Booking {
  return {
    id: booking.id,
    venueId: booking.venue_id,
    title: booking.title,
    description: booking.description,
    date: booking.date,
    startTime: booking.start_time,
    endTime: booking.end_time,
    expectedAttendance: booking.expected_attendance,
    riskLevel: booking.risk_level,
    amplifiedNoise: booking.amplified_noise,
    liquorLicense: booking.liquor_license,
    organizer: booking.organizer,
    status: booking.status,
    conflicts: booking.conflicts || [],
    overrideReason: booking.override_reason,
    overriddenBy: booking.overridden_by,
    overriddenAt: booking.overridden_at,
    createdBy: booking.created_by,
    createdAt: booking.created_at,
    municipality: booking.municipality,
  }
}

// Transform multiple bookings
export function transformBookings(bookings: any[]): Booking[] {
  return bookings.map(transformBooking)
}

// Transform snake_case to camelCase for parking areas
export function transformParkingArea(parkingArea: any): ParkingArea {
  return {
    id: parkingArea.id,
    name: parkingArea.name,
    totalSpaces: parkingArea.total_spaces,
    allocatedSpaces: parkingArea.allocated_spaces,
    location: parkingArea.location,
    linkedVenueIds: parkingArea.linked_venue_ids
  }
}

export function transformParkingAreas(parkingAreas: any[]): ParkingArea[] {
  return parkingAreas.map(transformParkingArea)
}

// Transform snake_case to camelCase for roads
export function transformRoad(road: any): Road {
  return {
    id: road.id,
    name: road.name,
    status: road.status,
    closureReason: road.closure_reason,
    closureStart: road.closure_start,
    closureEnd: road.closure_end,
    linkedVenueIds: road.linked_venue_ids
  }
}

export function transformRoads(roads: any[]): Road[] {
  return roads.map(transformRoad)
}

// Transform snake_case to camelCase for trigger logs
export function transformTriggerLog(log: any): TriggerLog {
  return {
    id: log.id,
    bookingId: log.booking_id,
    type: log.trigger_type,
    severity: log.severity,
    message: log.message,
    timestamp: log.created_at,
    resolved: log.resolved || false
  }
}

export function transformTriggerLogs(logs: any[]): TriggerLog[] {
  return logs.map(transformTriggerLog)
}

// Transform snake_case to camelCase for override logs
export function transformOverrideLog(log: any): OverrideLog {
  return {
    id: log.id,
    bookingId: log.booking_id,
    operatorName: log.operator_name || log.overridden_by,
    reason: log.reason,
    conflicts: log.conflicts || [],
    timestamp: log.created_at
  }
}

export function transformOverrideLogs(logs: any[]): OverrideLog[] {
  return logs.map(transformOverrideLog)
}
