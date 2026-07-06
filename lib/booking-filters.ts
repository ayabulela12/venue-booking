import type { Booking, Venue, UserRole } from "./types"

export type BookingFilterOptions = {
  role: UserRole
  /** Signed-in user id — local admins only see bookings they created. */
  userId?: string
  municipality?: string
}

/** Active bookings visible in calendar/list UIs (excludes cancelled and denied). */
export function filterActiveBookings(bookings: Booking[]): Booking[] {
  return bookings.filter(
    (b) => b.status !== "cancelled" && b.status !== "denied"
  )
}

/**
 * Role-scoped bookings for calendar and bookings pages.
 * - System admin / district manager: all active bookings
 * - Local admin: only bookings created by the signed-in user
 */
export function filterBookingsForUser(
  bookings: Booking[],
  _venues: Venue[],
  options: BookingFilterOptions
): Booking[] {
  const { role, userId } = options
  const active = filterActiveBookings(bookings)

  if (role === "system_admin" || role === "district_manager") {
    return active
  }

  if (role === "local_admin") {
    if (!userId) return []
    return active.filter((b) => b.createdBy === userId)
  }

  // Legacy demo operator accounts
  return active.filter((b) => b.organizer === "Test Operator")
}
