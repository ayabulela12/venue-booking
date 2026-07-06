"use client"

import { useState, useMemo, useEffect } from "react"
import { format, parse, parseISO } from "date-fns"
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  XCircle,
  Volume2,
  Wine,
  AlertTriangle,
  CheckCircle,
  Ban,
  MessageSquare,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useStore } from "@/lib/store"
import { useRole } from "@/components/role-provider"
import { RISK_COLORS } from "@/lib/constants"
import { BookingFormDialog } from "@/components/booking-form"
import { BookingDetailSheet } from "@/components/booking-detail-sheet"
import { cn } from "@/lib/utils"
import { filterBookingsForUser } from "@/lib/booking-filters"
import type { Booking, BookingStatus } from "@/lib/types"
import { toast } from "sonner"

const statusStyles: Record<BookingStatus, string> = {
  confirmed: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  pending: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  cancelled: "bg-muted text-muted-foreground border-border",
  override: "bg-red-500/10 text-red-700 border-red-500/20",
  denied: "bg-red-500/10 text-red-700 border-red-500/20",
}

const statusIcons: Record<BookingStatus, React.ReactNode> = {
  confirmed: <CheckCircle className="h-3 w-3" />,
  pending: <AlertTriangle className="h-3 w-3" />,
  cancelled: <XCircle className="h-3 w-3" />,
  override: <Ban className="h-3 w-3" />,
  denied: <Ban className="h-3 w-3" />,
}

function toStatusLabel(status: BookingStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function formatTimeLabel(time: string) {
  return format(parse(time, "HH:mm", new Date()), "h:mm a")
}

export default function BookingsPage() {
  const { state, getVenueById, confirmBooking, denyBooking, cancelBooking, deleteBooking } = useStore()
  const { role, isAdmin, isLocalAdmin, isOperator, userId } = useRole()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all")
  const [formOpen, setFormOpen] = useState(false)
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [denyDialogOpen, setDenyDialogOpen] = useState(false)
  const [denyReason, setDenyReason] = useState("")
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  const roleScopedBookings = useMemo(
    () =>
      filterBookingsForUser(state.bookings, state.venues, { role, userId }),
    [state.bookings, state.venues, role, userId]
  )

  const filteredBookings = useMemo(() => {
    return roleScopedBookings
      .filter((b) => {
        const venue = getVenueById(b.venueId)
        const matchesSearch =
          b.title.toLowerCase().includes(search.toLowerCase()) ||
          b.organizer.toLowerCase().includes(search.toLowerCase()) ||
          (venue?.name || "").toLowerCase().includes(search.toLowerCase())
        const matchesStatus =
          statusFilter === "all" || b.status === statusFilter
        return matchesSearch && matchesStatus
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
  }, [roleScopedBookings, search, statusFilter, getVenueById])

  async function handleCancel(booking: Booking) {
    try {
      if (isAdmin) {
        await denyBooking(booking.id, "Cancelled by admin")
      } else {
        // For operators, let the server handle user ID detection
        await cancelBooking(booking.id)
      }
      toast.success(`"${booking.title}" has been cancelled`)
    } catch (error) {
      toast.error("Failed to cancel booking")
      console.error("Cancel booking error:", error)
    }
  }

  async function handleDelete(booking: Booking) {
    if (confirm(`Are you sure you want to delete "${booking.title}"? This action cannot be undone.`)) {
      try {
        await deleteBooking(booking.id)
        toast.success(`"${booking.title}" has been deleted`)
      } catch (error) {
        toast.error("Failed to delete booking")
        console.error("Delete booking error:", error)
      }
    }
  }

  async function handleConfirm(booking: Booking) {
    try {
      await confirmBooking(booking.id)
      toast.success(`"${booking.title}" has been confirmed`)
    } catch (error) {
      toast.error("Failed to confirm booking")
      console.error("Confirm booking error:", error)
    }
  }

  function handleDeny(booking: Booking) {
    setSelectedBooking(booking)
    setDenyDialogOpen(true)
  }

  async function confirmDeny(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (selectedBooking && denyReason.trim()) {
      try {
        await denyBooking(selectedBooking.id, denyReason.trim())
        toast.success(`"${selectedBooking.title}" has been denied: ${denyReason}`)
        setDenyDialogOpen(false)
        setDenyReason("")
        setSelectedBooking(null)
      } catch (error) {
        toast.error("Failed to deny booking")
        console.error("Deny booking error:", error)
      }
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">
            {isLocalAdmin || isOperator ? "My Bookings" : "Booking Management"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLocalAdmin
              ? "View and manage bookings you have created"
              : isOperator
                ? "View and manage your event bookings"
                : "Create and manage event bookings with conflict detection"}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Booking
          </Button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search bookings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(val) =>
            setStatusFilter(val as BookingStatus | "all")
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="override">Override</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="denied">Denied</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Venue</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Risk</TableHead>
              <TableHead>Triggers</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[60px]">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings.map((booking) => {
              const venue = getVenueById(booking.venueId)
              const risk = RISK_COLORS[booking.riskLevel]
              return (
                <TableRow
                  key={booking.id}
                  className="cursor-pointer"
                  onClick={() => {
                    setDetailBooking(booking)
                    setDetailOpen(true)
                  }}
                >
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">
                        {booking.title}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {booking.organizer}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {venue?.name || "Unknown"}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm">
                        {format(parseISO(booking.date), "MMM d, yyyy")}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatTimeLabel(booking.startTime)} - {formatTimeLabel(booking.endTime)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn("h-2 w-2 rounded-full", risk.dot)}
                      />
                      <span
                        className={cn("text-xs capitalize", risk.text)}
                      >
                        {booking.riskLevel}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {booking.amplifiedNoise && (
                        <Badge
                          variant="outline"
                          className="bg-amber-500/10 text-amber-700 border-amber-500/20 text-[10px] px-1 py-0"
                        >
                          <Volume2 className="h-2.5 w-2.5" />
                        </Badge>
                      )}
                      {booking.liquorLicense && (
                        <Badge
                          variant="outline"
                          className="bg-violet-500/10 text-violet-600 border-violet-500/20 text-[10px] px-1 py-0"
                        >
                          <Wine className="h-2.5 w-2.5" />
                        </Badge>
                      )}
                      {booking.conflicts.length > 0 && (
                        <Badge
                          variant="outline"
                          className="bg-red-500/10 text-red-600 border-red-500/20 text-[10px] px-1 py-0"
                        >
                          <AlertTriangle className="h-2.5 w-2.5" />
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs capitalize flex items-center gap-1.5 px-2 py-1",
                        statusStyles[booking.status]
                      )}
                    >
                      {statusIcons[booking.status]}
                      {toStatusLabel(booking.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            setDetailBooking(booking)
                            setDetailOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        
                        {isAdmin && booking.status === "pending" && (
                          <>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                handleConfirm(booking)
                              }}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Confirm Booking
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeny(booking)
                              }}
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              Deny Booking
                            </DropdownMenuItem>
                          </>
                        )}
                        
                        {booking.status !== "cancelled" && booking.status !== "denied" && (
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCancel(booking)
                            }}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            {isAdmin ? "Cancel Booking" : "Cancel My Booking"}
                          </DropdownMenuItem>
                        )}
                        
                        {isAdmin && (
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(booking)
                            }}
                          >
                            <Ban className="h-4 w-4 mr-2" />
                            Delete Booking
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
            {filteredBookings.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-muted-foreground"
                >
                  No bookings found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <BookingFormDialog open={formOpen} onOpenChange={setFormOpen} />

      <BookingDetailSheet
        booking={detailBooking}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      <AlertDialog open={denyDialogOpen} onOpenChange={setDenyDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deny Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for denying this booking. This will be recorded in the system logs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="denyReason">Reason for denial</Label>
            <Textarea
              id="denyReason"
              placeholder="e.g., High noise levels, Weather concerns, Maintenance scheduled, etc."
              value={denyReason}
              onChange={(e) => setDenyReason(e.target.value)}
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeny}
              disabled={!denyReason.trim()}
            >
              Deny Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
