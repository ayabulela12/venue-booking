export type RiskLevel = "low" | "medium" | "high"
export type BookingStatus = "confirmed" | "pending" | "cancelled" | "override" | "denied"
export type VenueType = "indoor" | "outdoor" | "hybrid"
export type UserRole = "system_admin" | "district_manager" | "local_admin" | "operations"

export interface Venue {
  id: string
  name: string
  type: VenueType
  maxPopulation: number
  ownerName: string
  ownerContact: string
  address: string
  aboutVenue?: string
  features: string[]
  activities: string[]
  image?: string
  createdAt: string
  municipality?: string
}

export interface Booking {
  id: string
  venueId: string
  title: string
  description?: string
  date: string // YYYY-MM-DD
  startTime: string // HH:mm
  endTime: string // HH:mm
  expectedAttendance: number
  riskLevel: RiskLevel
  amplifiedNoise: boolean
  liquorLicense: boolean
  organizer: string
  status: BookingStatus
  overrideReason?: string
  overriddenBy?: string
  overriddenAt?: string
  conflicts: ConflictResult[]
  createdAt: string
  createdBy?: string
  municipality?: string
}

export interface ParkingArea {
  id: string
  name: string
  totalSpaces: number
  allocatedSpaces: number
  location: string
  linkedVenueIds: string[]
}

export interface Road {
  id: string
  name: string
  status: "open" | "closed" | "restricted"
  closureReason?: string
  closureStart?: string
  closureEnd?: string
  linkedVenueIds: string[]
}

export type TriggerType =
  | "venue_conflict"
  | "amplified_noise"
  | "risk_overlap"
  | "liquor_overlap"
  | "capacity_exceeded"

export interface ConflictResult {
  type: TriggerType
  severity: "warning" | "critical"
  message: string
  suggestion: string
  relatedBookingId?: string
}

export interface TriggerLog {
  id: string
  bookingId: string
  type: TriggerType
  severity: "warning" | "critical"
  message: string
  timestamp: string
  resolved: boolean
}

export interface OverrideLog {
  id: string
  bookingId: string
  operatorName: string
  reason: string
  conflicts: ConflictResult[]
  timestamp: string
}

export interface AppState {
  venues: Venue[]
  bookings: Booking[]
  parkingAreas: ParkingArea[]
  roads: Road[]
  triggerLogs: TriggerLog[]
  overrideLogs: OverrideLog[]
}
