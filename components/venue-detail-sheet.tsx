"use client"

import { format, parseISO } from "date-fns"
import { Building2, MapPin, Users, Mail, Ticket } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useStore } from "@/lib/store"
import type { Venue } from "@/lib/types"
import { cn } from "@/lib/utils"

interface VenueDetailSheetProps {
  venue: Venue | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VenueDetailSheet({
  venue,
  open,
  onOpenChange,
}: VenueDetailSheetProps) {
  const { getBookingsByVenue } = useStore()

  if (!venue) return null

  const venueBookings = getBookingsByVenue(venue.id).filter(
    (b) => b.status !== "cancelled"
  )

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            {venue.name}
          </SheetTitle>
          <SheetDescription>{venue.address}</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 mt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1 rounded-md border p-3">
              <span className="text-xs text-muted-foreground">Type</span>
              <Badge variant="outline" className="w-fit capitalize">
                {venue.type}
              </Badge>
            </div>
            <div className="flex flex-col gap-1 rounded-md border p-3">
              <span className="text-xs text-muted-foreground">Capacity</span>
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {venue.max_population?.toLocaleString() || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-medium">Owner Details</h4>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{venue.owner_name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {venue.owner_contact}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">{venue.address}</span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">
                Upcoming Bookings
              </h4>
              <Badge variant="secondary" className="text-xs">
                {venueBookings.length}
              </Badge>
            </div>
            {venueBookings.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No active bookings for this venue.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {venueBookings.slice(0, 5).map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center gap-3 rounded-md border p-2.5"
                  >
                    <Ticket className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium truncate">
                        {booking.title}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {booking.date ? format(parseISO(booking.date), 'MMM dd, yyyy') : 'Date not set'} • {booking.date && booking.start_time ? format(parseISO(booking.date + ' ' + booking.start_time), 'HH:mm') : 'Time not set'} - {booking.date && booking.end_time ? format(parseISO(booking.date + ' ' + booking.end_time), 'HH:mm') : 'Time not set'}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] px-1.5 py-0 ml-auto shrink-0 capitalize",
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
          </div>

          <div className="text-xs text-muted-foreground/60 pt-2">
            Created on {venue.created_at ? format(parseISO(venue.created_at), 'MMM dd, yyyy') : 'Date not available'}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
