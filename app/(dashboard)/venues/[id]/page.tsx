"use client"

import { use } from "react"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { format, parseISO } from "date-fns"
import {
  ArrowLeft,
  MapPin,
  Users,
  Mail,
  Building2,
  Ticket,
  Pencil,
  Trash2,
  Car,
  Route,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useStore } from "@/lib/store"
import { useRole } from "@/components/role-provider"
import { VenueFormDialog } from "@/components/venue-form"
import { VenueBookingForm } from "@/components/venue-booking-form"
import { VenueAvailability } from "@/components/venue-availability"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { CalendarPlus } from "lucide-react"
import { fetchVenueById } from "@/lib/supabase-services"
import type { Venue } from "@/lib/types"

export default function VenueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { state, getBookingsByVenue, deleteVenue, syncVenue } = useStore()
  const { isSystemAdmin, isDistrictManager, isLocalAdmin, userId } = useRole()
  const [editOpen, setEditOpen] = useState(false)
  const [bookingFormOpen, setBookingFormOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [leavingAfterDelete, setLeavingAfterDelete] = useState(false)
  const router = useRouter()

  const venueFromStore = state.venues.find((v) => v.id === id)
  const [fetchedVenue, setFetchedVenue] = useState<Venue | null>(null)
  const [fetchingVenue, setFetchingVenue] = useState(!venueFromStore)
  const [venueNotFound, setVenueNotFound] = useState(false)

  const venue = venueFromStore ?? fetchedVenue

  useEffect(() => {
    if (venueFromStore) {
      setFetchingVenue(false)
      setVenueNotFound(false)
      return
    }

    let cancelled = false
    setFetchingVenue(true)
    setVenueNotFound(false)

    fetchVenueById(id)
      .then((loaded) => {
        if (cancelled) return
        if (loaded) {
          setFetchedVenue(loaded)
          syncVenue(loaded)
        } else {
          setVenueNotFound(true)
        }
      })
      .catch((error) => {
        if (cancelled) return
        console.error("Error loading venue:", error)
        setVenueNotFound(true)
      })
      .finally(() => {
        if (!cancelled) setFetchingVenue(false)
      })

    return () => {
      cancelled = true
    }
  }, [id, venueFromStore, syncVenue])

  if (!venue && fetchingVenue) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="rounded-md border p-6 text-sm text-muted-foreground">
          Loading venue details...
        </div>
      </div>
    )
  }

  // After delete, store removes the venue before navigation finishes — do not call notFound().
  if (!venue && leavingAfterDelete) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="rounded-md border p-6 text-sm text-muted-foreground">
          Redirecting to venues...
        </div>
      </div>
    )
  }

  if (!venue && venueNotFound) {
    notFound()
  }

  if (!venue) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="rounded-md border p-6 text-sm text-muted-foreground">
          Loading venue details...
        </div>
      </div>
    )
  }

  const venueBookings = getBookingsByVenue(venue!.id).filter(
    (b) => b.status !== "cancelled"
  )

  const isTemporaryFixBooking = (title: string) =>
    /\b(fix|debug)\b/i.test(title) || /auth\s+fix/i.test(title)

  const visibleVenueBookings = venueBookings
    .filter((b) => !isTemporaryFixBooking(b.title))
    .filter((b) =>
      isLocalAdmin && userId ? b.createdBy === userId : true
    )

  const linkedParking = state.parkingAreas.filter((p) =>
    p.linkedVenueIds.includes(venue!.id)
  )
  const linkedRoads = state.roads.filter((r) =>
    r.linkedVenueIds.includes(venue!.id)
  )

  async function handleDelete() {
    const venueName = venue!.name
    const venueId = venue!.id
    setIsDeleting(true)
    try {
      setLeavingAfterDelete(true)
      await deleteVenue(venueId)
      setDeleteConfirmOpen(false)
      toast.success(`"${venueName}" has been removed`)
      router.replace("/venues")
    } catch (error) {
      setLeavingAfterDelete(false)
      console.error(
        "Error deleting venue:",
        error instanceof Error ? error.message : error
      )
      const message =
        error instanceof Error ? error.message : "Unknown error"
      toast.error(
        `Failed to delete "${venue!.name}". ${message || "You may not have permission to delete venues."}`
      )
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Back nav */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/venues">
            <ArrowLeft className="h-4 w-4 mr-1" />
            All Venues
          </Link>
        </Button>
      </div>

      {/* Hero section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 relative aspect-[16/9] overflow-hidden rounded-lg border bg-muted">
          {venue.image ? (
            <Image
              src={venue.image}
              alt={venue.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 66vw"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Building2 className="h-16 w-16 text-muted-foreground/30" />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="capitalize">
                {venue.type}
              </Badge>
            </div>
            {(isSystemAdmin || isDistrictManager) && (
              <div className="mt-3 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditOpen(true)}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit venue
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteConfirmOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            )}
            <h1 className="text-2xl font-semibold tracking-tight text-balance">
              {venue.name}
            </h1>
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span>{venue.address}</span>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1 rounded-md border p-3">
              <span className="text-xs text-muted-foreground">Max Capacity</span>
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-primary" />
                <span className="text-lg font-semibold">
                  {venue.maxPopulation?.toLocaleString() || 'N/A'}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-1 rounded-md border p-3">
              <span className="text-xs text-muted-foreground">Active Bookings</span>
              <div className="flex items-center gap-1.5">
                <Ticket className="h-3.5 w-3.5 text-primary" />
                <span className="text-lg font-semibold">
                  {venueBookings.length}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex flex-col gap-2">
            <h4 className="text-sm font-medium">Owner Details</h4>
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{venue.ownerName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">{venue.ownerContact}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* About this venue — main column */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">About this venue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {venue.aboutVenue || "No description available"}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Features</p>
              {venue.features.length === 0 ? (
                <p className="text-xs text-muted-foreground">No features listed.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {venue.features.map((f) => (
                    <Badge key={f} variant="outline">
                      {f}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Activities</p>
              {venue.activities.length === 0 ? (
                <p className="text-xs text-muted-foreground">No activities listed.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {venue.activities.map((a) => (
                    <Badge key={a} variant="outline">
                      {a}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          <VenueAvailability venue={venue!} />

          {(isSystemAdmin || isDistrictManager || isLocalAdmin) && (
            <Button
              type="button"
              onClick={() => setBookingFormOpen(true)}
              className="w-full"
            >
              <CalendarPlus className="h-4 w-4 mr-2" />
              Book this venue
            </Button>
          )}

          {/* Bookings for this venue */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  {isSystemAdmin || isDistrictManager
                    ? "Bookings for this Venue"
                    : "Upcoming Bookings"}
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {visibleVenueBookings.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {visibleVenueBookings.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  {isSystemAdmin || isDistrictManager
                    ? "You haven't booked this venue yet."
                    : "No active bookings for this venue."}
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {visibleVenueBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center gap-3 rounded-md border p-3"
                    >
                      <Ticket className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-sm font-medium truncate">
                          {booking.title}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {booking.date && booking.startTime
                            ? format(
                                parseISO(`${booking.date} ${booking.startTime}`),
                                "HH:mm"
                              )
                            : "Time not set"}{" "}
                          -{" "}
                          {booking.date && booking.endTime
                            ? format(
                                parseISO(`${booking.date} ${booking.endTime}`),
                                "HH:mm"
                              )
                            : "Time not set"}{" "}
                          | {booking.expectedAttendance || 0} attendees
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] px-1.5 py-0 shrink-0 capitalize",
                          booking.status === "confirmed"
                            ? "border-emerald-500/20 text-emerald-600"
                            : booking.status === "override"
                              ? "border-red-500/20 text-red-600"
                              : "border-amber-500/20 text-amber-600"
                        )}
                      >
                        {booking.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Infrastructure */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Car className="h-4 w-4 text-muted-foreground" />
                Linked Parking
              </CardTitle>
            </CardHeader>
            <CardContent>
              {linkedParking.length === 0 ? (
                <p className="text-xs text-muted-foreground">No linked parking areas.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {linkedParking.map((p) => (
                    <div key={p.id} className="flex flex-col gap-0.5 rounded-md border p-2.5">
                      <span className="text-sm font-medium">{p.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {p.allocatedSpaces.toLocaleString()} / {p.totalSpaces.toLocaleString()} spaces allocated
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Route className="h-4 w-4 text-muted-foreground" />
                Linked Roads
              </CardTitle>
            </CardHeader>
            <CardContent>
              {linkedRoads.length === 0 ? (
                <p className="text-xs text-muted-foreground">No linked roads.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {linkedRoads.map((r) => (
                    <div key={r.id} className="flex items-center justify-between gap-2 rounded-md border p-2.5">
                      <span className="text-sm font-medium truncate">{r.name}</span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] px-1.5 py-0 shrink-0 capitalize",
                          r.status === "open"
                            ? "border-emerald-500/20 text-emerald-600"
                            : r.status === "closed"
                              ? "border-red-500/20 text-red-600"
                              : "border-amber-500/20 text-amber-600"
                        )}
                      >
                        {r.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="text-xs text-muted-foreground/60">
            {venue.createdAt ? format(parseISO(venue.createdAt), 'MMM dd, yyyy') : 'Date not available'}
          </div>
        </div>
      </div>

      {(isSystemAdmin || isDistrictManager) && (
        <VenueFormDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          venue={venue}
        />
      )}

      <VenueBookingForm 
        open={bookingFormOpen}
        onOpenChange={setBookingFormOpen}
        venue={venue!}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={(open) => {
          if (isDeleting && !open) return
          setDeleteConfirmOpen(open)
        }}
        title="Delete venue"
        description={`Are you sure you want to delete "${venue.name}"? This action cannot be undone and will remove the venue from the system.`}
        confirmText="Delete venue"
        cancelText="Cancel"
        type="delete"
        isLoading={isDeleting}
        onConfirm={() => void handleDelete()}
      />
    </div>
  )
}
