"use client"

import { useState, useMemo, useEffect } from "react"
import { format } from "date-fns"
import { CalendarIcon, CalendarDays } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import type { Venue } from "@/lib/types"

interface VenueAvailabilityProps {
  venue: Venue
}

export function VenueAvailability({ venue }: VenueAvailabilityProps) {
  const { state } = useStore()
  const [selectedDate, setSelectedDate] = useState(new Date())

  const todayStart = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  useEffect(() => {
    if (selectedDate < todayStart) setSelectedDate(todayStart)
  }, [selectedDate, todayStart])
  
  const venueBookings = useMemo(() => 
    state.bookings.filter(b => 
      b.venueId === venue.id && 
      (b.status === 'confirmed' || b.status === 'override')
    ), [state.bookings, venue.id]
  )

  const dayBookings = useMemo(() => 
    venueBookings.filter(b => 
      b.date === format(selectedDate, 'yyyy-MM-dd')
    ), [venueBookings, selectedDate]
  )

  const isAvailable = dayBookings.length === 0

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-blue-600" />
          Venue Availability
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-900">
              {isAvailable ? "Available" : "Partially Available"}
            </p>
            <p className="text-xs text-blue-700">
              {dayBookings.length} booking{dayBookings.length !== 1 ? 's' : ''} on {format(selectedDate, 'MMM d, yyyy')}
            </p>
          </div>
          <Badge variant={isAvailable ? "default" : "secondary"}>
            {isAvailable ? "Open" : "Limited"}
          </Badge>
        </div>

        <div>
          <Label className="text-xs text-blue-700">Check availability</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="w-full mt-1">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(selectedDate, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (!date) return
                  if (date < todayStart) return
                  setSelectedDate(date)
                }}
                disabled={(date) => date < todayStart}
                required
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {dayBookings.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-blue-900">Existing bookings:</p>
            {dayBookings.map(booking => (
              <div key={booking.id} className="text-xs bg-white p-2 rounded border">
                <div className="font-medium">{booking.title}</div>
                <div className="text-muted-foreground">
                  {booking.startTime} - {booking.endTime} • {booking.organizer}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
