"use client"

import { useState, useEffect, useMemo } from "react"
import { format } from "date-fns"
import { CalendarIcon, CalendarPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { useStore } from "@/lib/store"
import { detectConflicts } from "@/lib/conflict-engine"
import { ConflictAlertPanel } from "@/components/conflict-alert-panel"
import { cn } from "@/lib/utils"
import type { Venue, RiskLevel, ConflictResult } from "@/lib/types"
import { toast } from "sonner"
import { getSupabaseClient } from "@/lib/supabase-client"
import { useRole } from "@/components/role-provider"

interface VenueBookingFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  venue?: Venue // Make venue optional to handle undefined case
}

function defaultOrganizerFromSession(): string {
  return "Local Admin"
}

export function VenueBookingForm({ open, onOpenChange, venue }: VenueBookingFormProps) {
  const { state, addBooking } = useStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [defaultOrganizer, setDefaultOrganizer] = useState(defaultOrganizerFromSession)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    venueId: venue?.id || "",
    date: undefined as Date | undefined,
    startTime: "09:00",
    endTime: "17:00",
    expectedAttendance: 100,
    organizer: defaultOrganizerFromSession(),
    riskLevel: "low" as RiskLevel,
    amplifiedNoise: false,
    liquorLicense: false,
  })

  useEffect(() => {
    if (!open) return
    void getSupabaseClient()
      .auth.getUser()
      .then(({ data: { user } }) => {
        const name =
          (typeof user?.user_metadata?.full_name === "string" &&
            user.user_metadata.full_name) ||
          (typeof user?.user_metadata?.name === "string" &&
            user.user_metadata.name) ||
          user?.email?.split("@")[0] ||
          defaultOrganizerFromSession()
        setDefaultOrganizer(name)
        setFormData((prev) =>
          prev.organizer === defaultOrganizerFromSession() ||
          prev.organizer === "Test Operator"
            ? { ...prev, organizer: name }
            : prev
        )
      })
  }, [open])

  const todayStart = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  useEffect(() => {
    if (venue?.id) {
      setFormData((prev) => ({ ...prev, venueId: venue.id }))
    }
  }, [venue?.id])

  useEffect(() => {
    if (formData.date && formData.date < todayStart) {
      setFormData((prev) => ({ ...prev, date: todayStart }))
    }
  }, [formData.date, todayStart])

  // Automatic risk assessment based on booking parameters
  const calculatedRiskLevel = useMemo(() => {
    let riskScore = 0
    
    // Amplified noise adds significant risk
    if (formData.amplifiedNoise) riskScore += 3
    
    // Liquor license adds risk
    if (formData.liquorLicense) riskScore += 2
    
    // Attendance-based risk
    if (formData.expectedAttendance >= 1000) riskScore += 2
    else if (formData.expectedAttendance >= 500) riskScore += 1
    
    // Venue type risk
    if (venue?.type === 'outdoor') riskScore += 1
    else if (venue?.type === 'hybrid') riskScore += 0.5
    
    // Determine risk level
    if (riskScore >= 5) return 'high'
    if (riskScore >= 3) return 'medium'
    return 'low'
  }, [formData.amplifiedNoise, formData.liquorLicense, formData.expectedAttendance, venue?.type])

  const conflicts = useMemo(() => {
    if (!formData.date || !formData.startTime || !formData.endTime || !formData.venueId) return []
    
    return detectConflicts(
      {
        venueId: formData.venueId,
        date: format(formData.date, "yyyy-MM-dd"),
        startTime: formData.startTime,
        endTime: formData.endTime,
        expectedAttendance: formData.expectedAttendance,
        riskLevel: calculatedRiskLevel,
        amplifiedNoise: formData.amplifiedNoise,
        liquorLicense: formData.liquorLicense,
      },
      state.bookings,
      state.venues
    )
  }, [formData.date, formData.startTime, formData.endTime, formData.expectedAttendance, formData.amplifiedNoise, formData.liquorLicense, formData.venueId, calculatedRiskLevel, state.bookings, state.venues])

  async function handleSubmit() {
    if (isSubmitting || conflicts.length > 0 || !formData.venueId || !formData.date || !formData.organizer.trim()) {
      if (!formData.venueId) {
        toast.error("Please select a venue")
        return
      }
      if (!formData.organizer.trim()) {
        toast.error("Please enter an organizer name")
        return
      }
      return
    }
    
    setIsSubmitting(true)
    try {
      await addBooking({
        ...formData,
        date: format(formData.date, "yyyy-MM-dd"),
        status: "pending",
        conflicts: [],
        riskLevel: calculatedRiskLevel, // Use calculated risk level
      })
      
      toast.success(`Booking created for ${venue?.name || "Venue"}`)
      onOpenChange(false)
      // Reset form
      setFormData({
        title: "",
        description: "",
        venueId: venue?.id || "",
        date: undefined,
        startTime: "09:00",
        endTime: "17:00",
        expectedAttendance: 100,
        organizer: defaultOrganizer,
        riskLevel: "low",
        amplifiedNoise: false,
        liquorLicense: false,
      })
    } catch (error: any) {
      console.error("Booking error:", error)
      
      // Show more specific error messages
      if (error?.message?.includes('permission') || error?.message?.includes('42501')) {
        toast.error("Permission denied. You may not have rights to create bookings.")
      } else if (error?.message?.includes('duplicate') || error?.message?.includes('23505')) {
        toast.error("This booking already exists or conflicts with another booking.")
      } else if (error?.message?.includes('null') || error?.message?.includes('23502')) {
        toast.error("Please fill in all required fields.")
      } else if (error?.message?.includes('foreign key') || error?.message?.includes('23503')) {
        toast.error("Invalid venue selected.")
      } else {
        toast.error(`Failed to create booking: ${error?.message || 'Unknown error'}`)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book {venue?.name || "Venue"}</DialogTitle>
          <DialogDescription>
            Schedule an event at this venue. Conflicts will be automatically detected.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Event Details */}
          <div className="grid gap-4">
            <h3 className="text-lg font-medium">Event Details</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Annual Company Meeting"
                />
              </div>
              <div>
                <Label htmlFor="organizer">Organizer</Label>
                <Input
                  id="organizer"
                  value={formData.organizer}
                  onChange={(e) => setFormData(prev => ({ ...prev, organizer: e.target.value }))}
                  placeholder="Your Name/Department"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Event details and requirements..."
                rows={3}
              />
            </div>
          </div>

          {/* Schedule */}
          <div className="grid gap-4">
            <h3 className="text-lg font-medium">Schedule</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? format(formData.date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) => {
                        if (!date) return
                        if (date < todayStart) return
                        setFormData((prev) => ({ ...prev, date }))
                      }}
                      disabled={(date) => date < todayStart}
                      required
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="attendance">Expected Attendance</Label>
                <Input
                  id="attendance"
                  type="number"
                  value={formData.expectedAttendance}
                  onChange={(e) => setFormData(prev => ({ ...prev, expectedAttendance: parseInt(e.target.value) || 1 }))}
                  min="1"
                  max={venue?.maxPopulation || 1000}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Max capacity: {venue?.maxPopulation || "Unknown"}
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="grid gap-4">
            <h3 className="text-lg font-medium">Risk Assessment</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Calculated Risk Level</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "px-3 py-1 text-sm font-medium",
                      calculatedRiskLevel === "high"
                        ? "border-red-500/20 text-red-600 bg-red-50"
                        : calculatedRiskLevel === "medium"
                          ? "border-amber-500/20 text-amber-600 bg-amber-50"
                          : "border-emerald-500/20 text-emerald-600 bg-emerald-50"
                    )}
                  >
                    {calculatedRiskLevel === "high" ? "High Risk" : 
                     calculatedRiskLevel === "medium" ? "Medium Risk" : "Low Risk"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Automatically calculated based on event parameters
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="amplifiedNoise"
                    checked={formData.amplifiedNoise}
                    onCheckedChange={(checked) => setFormData(prev => ({ 
                      ...prev, 
                      amplifiedNoise: checked 
                    }))}
                  />
                  <Label htmlFor="amplifiedNoise">Amplified Noise</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="liquorLicense"
                    checked={formData.liquorLicense}
                    onCheckedChange={(checked) => setFormData(prev => ({ 
                      ...prev, 
                      liquorLicense: checked 
                    }))}
                  />
                  <Label htmlFor="liquorLicense">Liquor License</Label>
                </div>
              </div>
            </div>
          </div>

          {/* Conflict Detection */}
          {conflicts.length > 0 && (
            <div className="grid gap-4">
              <h3 className="text-lg font-medium text-red-600">⚠️ Scheduling Conflicts</h3>
              <ConflictAlertPanel conflicts={conflicts} />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || conflicts.length > 0 || !formData.venueId || !formData.date}
          >
            {isSubmitting ? "Creating..." : "Book Venue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
