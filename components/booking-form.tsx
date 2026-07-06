"use client"

import { useState, useMemo, useEffect } from "react"
import { format } from "date-fns"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useStore } from "@/lib/store"
import { useRole } from "@/components/role-provider"
import { detectConflicts } from "@/lib/conflict-engine"
import { ConflictAlertPanel } from "@/components/conflict-alert-panel"
import { RISK_COLORS } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { Booking, RiskLevel, ConflictResult } from "@/lib/types"
import { toast } from "sonner"

interface BookingFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const STEPS = ["Event Details", "Schedule", "Risk & Triggers", "Review"]

export function BookingFormDialog({ open, onOpenChange }: BookingFormProps) {
  const { state, addBooking } = useStore()
  const { role } = useRole()
  const [step, setStep] = useState(0)
  const [overrideOpen, setOverrideOpen] = useState(false)
  const [overrideReason, setOverrideReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false) // Prevent double submission

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    venueId: "",
    date: undefined as Date | undefined,
    startTime: "09:00",
    endTime: "17:00",
    expectedAttendance: 100,
    organizer: "",
    riskLevel: "low" as RiskLevel,
    amplifiedNoise: false,
    liquorLicense: false,
  })

  const todayStart = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  useEffect(() => {
    if (formData.date && formData.date < todayStart) {
      setFormData((prev) => ({ ...prev, date: todayStart }))
    }
  }, [formData.date, todayStart])

  const conflicts = useMemo(() => {
    if (!formData.venueId || !formData.date || !formData.startTime || !formData.endTime) {
      return []
    }
    return detectConflicts(
      {
        venueId: formData.venueId,
        date: format(formData.date, "yyyy-MM-dd"),
        startTime: formData.startTime,
        endTime: formData.endTime,
        expectedAttendance: formData.expectedAttendance,
        riskLevel: formData.riskLevel,
        amplifiedNoise: formData.amplifiedNoise,
        liquorLicense: formData.liquorLicense,
      },
      state.bookings,
      state.venues
    )
  }, [
    formData.venueId,
    formData.date,
    formData.startTime,
    formData.endTime,
    formData.expectedAttendance,
    formData.riskLevel,
    formData.amplifiedNoise,
    formData.liquorLicense,
    state.bookings,
    state.venues,
  ])

  const hasCritical = conflicts.some((c) => c.severity === "critical")
  const selectedVenue = state.venues.find((v) => v.id === formData.venueId)

  function resetForm() {
    setStep(0)
    setOverrideReason("")
    setFormData({
      title: "",
      description: "",
      venueId: "",
      date: undefined,
      startTime: "09:00",
      endTime: "17:00",
      expectedAttendance: 100,
      organizer: "",
      riskLevel: "low",
      amplifiedNoise: false,
      liquorLicense: false,
    })
  }

  function canProceed(): boolean {
    switch (step) {
      case 0:
        return formData.title.length >= 2 && formData.venueId !== "" && formData.organizer.length >= 2
      case 1:
        return !!formData.date && formData.startTime < formData.endTime
      case 2:
        return true
      default:
        return true
    }
  }

  async function handleSubmit(isOverride = false) {
    if (!formData.date || isSubmitting) return // Prevent double submission

    setIsSubmitting(true) // Set submitting state

    try {
      // Get current user info - use role for now since we need synchronous access
      const currentUser = `${role === "admin" ? "Admin" : "Operator"} User`

      const booking: Booking = {
        id: `b${Date.now()}`,
        title: formData.title,
        description: formData.description,
        venueId: formData.venueId,
        date: format(formData.date, "yyyy-MM-dd"),
        startTime: formData.startTime,
        endTime: formData.endTime,
        expectedAttendance: formData.expectedAttendance,
        organizer: formData.organizer,
        riskLevel: formData.riskLevel,
        amplifiedNoise: formData.amplifiedNoise,
        liquorLicense: formData.liquorLicense,
        status: "pending",
        conflicts: isOverride ? conflicts : [],
        overrideReason: isOverride ? overrideReason : undefined,
        overriddenBy: isOverride ? currentUser : undefined,
        overriddenAt: isOverride ? new Date().toISOString() : undefined,
        createdAt: new Date().toISOString(),
        createdBy: undefined,
      }

      try {
        await addBooking(booking)

        toast.success(
          isOverride
            ? "Booking created with override"
            : "Booking created successfully"
        )
        resetForm()
        onOpenChange(false)
      } catch (bookingError: any) {
        console.error("Error creating booking:", bookingError)
        
        // Better error handling for booking creation
        if (bookingError?.message) {
          if (bookingError.message.includes('Database permissions not configured')) {
            toast.error("Database permissions not configured. Please contact administrator to set up RLS policies for bookings table.", {
              duration: 8000
            })
          } else if (bookingError.message.includes('Row Level Security policy violation')) {
            toast.error("Database security policies not configured. Please contact administrator to set up proper access policies.", {
              duration: 8000
            })
          } else if (bookingError.message.includes('permission denied')) {
            toast.error("Access denied. Please contact administrator to configure database permissions.", {
              duration: 8000
            })
          } else if (bookingError.message.includes('already booked')) {
            toast.error("This venue is already booked for the selected time. Please choose a different time or venue.", {
              duration: 5000
            })
          } else if (bookingError.message.includes('not found')) {
            toast.error("Selected venue not found. Please select a valid venue.", {
              duration: 5000
            })
          } else {
            toast.error(`Failed to create booking: ${bookingError.message}`)
          }
        } else if (bookingError?.code) {
          toast.error(`Failed to create booking: ${bookingError.code}`)
        } else {
          toast.error("Failed to create booking. Please check your connection and try again.")
        }
        
        // Don't throw - let user fix the issue
      }
    } catch (error) {
      toast.error("Failed to create booking. Please try again.")
      console.error("Booking creation error:", error)
    } finally {
      setIsSubmitting(false) // Reset submitting state
    }
  }

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(o) => {
          if (!o) resetForm()
          onOpenChange(o)
        }}
      >
        <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Booking</DialogTitle>
            <DialogDescription>
              Step {step + 1} of {STEPS.length}: {STEPS[step]}
            </DialogDescription>
          </DialogHeader>

          {/* Progress steps */}
          <div className="flex items-center gap-1">
            {STEPS.map((s, i) => (
              <div
                key={s}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors",
                  i <= step ? "bg-primary" : "bg-muted"
                )}
              />
            ))}
          </div>

          {/* Step 0: Event Details */}
          {step === 0 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Annual Tech Conference"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="organizer">Organizer</Label>
                <Input
                  id="organizer"
                  value={formData.organizer}
                  onChange={(e) =>
                    setFormData({ ...formData, organizer: e.target.value })
                  }
                  placeholder="Metro Events Co."
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Venue</Label>
                <Select
                  value={formData.venueId}
                  onValueChange={(val) =>
                    setFormData({ ...formData, venueId: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a venue" />
                  </SelectTrigger>
                  <SelectContent>
                    {state.venues.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        <div className="flex items-center gap-2">
                          <span>{v.name}</span>
                          <span className="text-muted-foreground text-xs">
                            (max {v.maxPopulation?.toLocaleString() || 'N/A'})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedVenue && (
                  <p className="text-xs text-muted-foreground">
                    Max capacity: {selectedVenue.maxPopulation?.toLocaleString() || 'N/A'} &middot; {selectedVenue.type} venue &middot; {selectedVenue.address}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Brief event description..."
                  rows={2}
                />
              </div>
            </div>
          )}

          {/* Step 1: Schedule */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label>Event Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !formData.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date
                        ? format(formData.date, "MMMM d, yyyy")
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) =>
                        setFormData((prev) => ({
                          ...prev,
                          date: date && date >= todayStart ? date : undefined,
                        }))
                      }
                      disabled={(date) => date < todayStart}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="attendance">Expected Attendance</Label>
                <Input
                  id="attendance"
                  type="number"
                  value={formData.expectedAttendance}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      expectedAttendance: parseInt(e.target.value) || 0,
                    })
                  }
                />
                {selectedVenue && (
                  <p className="text-xs text-muted-foreground">
                    Venue capacity: {selectedVenue.maxPopulation.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Risk & Triggers */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label>Risk Level</Label>
                <div className="flex gap-2">
                  {(["low", "medium", "high"] as RiskLevel[]).map((level) => {
                    const colors = RISK_COLORS[level]
                    const isSelected = formData.riskLevel === level
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, riskLevel: level })
                        }
                        className={cn(
                          "flex-1 flex items-center justify-center gap-2 rounded-md border px-3 py-2.5 text-sm capitalize transition-colors",
                          isSelected
                            ? `${colors.bg} ${colors.text} border-current`
                            : "border-border text-muted-foreground hover:bg-muted"
                        )}
                      >
                        <span
                          className={cn("h-2 w-2 rounded-full", colors.dot)}
                        />
                        {level}
                      </button>
                    )
                  })}
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between rounded-md border p-3">
                <div className="flex flex-col gap-0.5">
                  <Label htmlFor="noise" className="text-sm font-medium">
                    Amplified Noise
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    Will this event use amplified sound?
                  </span>
                </div>
                <Switch
                  id="noise"
                  checked={formData.amplifiedNoise}
                  onCheckedChange={(val) =>
                    setFormData({ ...formData, amplifiedNoise: val })
                  }
                />
              </div>

              <div className="flex items-center justify-between rounded-md border p-3">
                <div className="flex flex-col gap-0.5">
                  <Label htmlFor="liquor" className="text-sm font-medium">
                    Liquor License
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    Will alcohol be served at this event?
                  </span>
                </div>
                <Switch
                  id="liquor"
                  checked={formData.liquorLicense}
                  onCheckedChange={(val) =>
                    setFormData({ ...formData, liquorLicense: val })
                  }
                />
              </div>

              {conflicts.length > 0 && (
                <>
                  <Separator />
                  <ConflictAlertPanel conflicts={conflicts} />
                </>
              )}
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <div className="rounded-md border p-4 flex flex-col gap-3">
                <h4 className="text-sm font-medium">Booking Summary</h4>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                  <span className="text-muted-foreground">Event</span>
                  <span className="font-medium">{formData.title}</span>
                  <span className="text-muted-foreground">Venue</span>
                  <span>{selectedVenue?.name || "-"}</span>
                  <span className="text-muted-foreground">Date</span>
                  <span>
                    {formData.date
                      ? format(formData.date, "MMM d, yyyy")
                      : "-"}
                  </span>
                  <span className="text-muted-foreground">Time</span>
                  <span>
                    {formData.startTime} - {formData.endTime}
                  </span>
                  <span className="text-muted-foreground">Attendance</span>
                  <span>{formData.expectedAttendance.toLocaleString()}</span>
                  <span className="text-muted-foreground">Organizer</span>
                  <span>{formData.organizer}</span>
                  <span className="text-muted-foreground">Risk Level</span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full",
                        RISK_COLORS[formData.riskLevel].dot
                      )}
                    />
                    <span className="capitalize">{formData.riskLevel}</span>
                  </div>
                  <span className="text-muted-foreground">Amplified Noise</span>
                  <span>{formData.amplifiedNoise ? "Yes" : "No"}</span>
                  <span className="text-muted-foreground">Liquor License</span>
                  <span>{formData.liquorLicense ? "Yes" : "No"}</span>
                </div>
              </div>

              {conflicts.length > 0 && (
                <ConflictAlertPanel conflicts={conflicts} />
              )}
            </div>
          )}

          <DialogFooter className="flex items-center justify-between pt-2">
            <div className="flex gap-2">
              {step > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep((s) => s - 1)}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              {step < STEPS.length - 1 ? (
                <Button
                  type="button"
                  disabled={!canProceed()}
                  onClick={() => setStep((s) => s + 1)}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <>
                  {hasCritical ? (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => setOverrideOpen(true)}
                    >
                      Override & Confirm
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => handleSubmit(false)}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Creating..." : "Confirm Booking"}
                    </Button>
                  )}
                </>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Override confirmation dialog */}
      <AlertDialog open={overrideOpen} onOpenChange={setOverrideOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Override Conflicts?</AlertDialogTitle>
            <AlertDialogDescription>
              This booking has {conflicts.length} active conflict
              {conflicts.length > 1 ? "s" : ""}. Overriding will log this
              action for audit purposes. Please provide a reason.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-2 py-2">
            <Label htmlFor="override-reason">Override Reason</Label>
            <Textarea
              id="override-reason"
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              placeholder="Explain why these conflicts are being overridden..."
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={overrideReason.length < 5}
              onClick={() => handleSubmit(true)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirm Override
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
