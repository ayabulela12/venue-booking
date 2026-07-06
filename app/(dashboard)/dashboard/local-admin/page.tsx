"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRole } from "@/components/role-provider"
import { createClient } from "@supabase/supabase-js"
import { 
  Building, 
  Calendar,
  Ticket,
  Users,
  Activity,
  Plus,
  Eye,
  MapPin,
  CalendarPlus
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function LocalAdminDashboard() {
  const { isLocalAdmin } = useRole()
  const [stats, setStats] = useState({
    venues: 0,
    bookings: 0,
    pending: 0,
    performance: 0
  })
  const [userMunicipality, setUserMunicipality] = useState("polokwane")
  const [recentBookings, setRecentBookings] = useState<any[]>([])
  const [userVenues, setUserVenues] = useState<any[]>([])

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Get current user's municipality (for demo, default to polokwane)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const municipality = user.user_metadata?.municipality || "polokwane"
      setUserMunicipality(municipality)

      // Get venue count for this municipality
      const { data: venues } = await supabase
        .from('venues')
        .select('id')
        .eq('municipality', municipality)

      // Booking counts for this local admin only
      const { data: bookings } = await supabase
        .from('bookings')
        .select('status')
        .eq('created_by', user.id)

      const pendingCount = bookings?.filter(b => b.status === 'pending').length || 0
      const totalBookings = bookings?.length || 0

      setStats({
        venues: venues?.length || 0,
        bookings: totalBookings,
        pending: pendingCount,
        performance: totalBookings > 0 ? Math.round(((totalBookings - pendingCount) / totalBookings) * 100) : 100
      })

      // Get recent bookings
      const { data: recent } = await supabase
        .from('bookings')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })
        .limit(3)

      setRecentBookings(recent || [])

      // Get venues for this municipality
      const { data: municipalityVenues } = await supabase
        .from('venues')
        .select('name')
        .eq('municipality', municipality)
        .limit(4)

      setUserVenues(municipalityVenues || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    }
  }

  if (!isLocalAdmin) {
    return <div>Access denied</div>
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Local Admin Dashboard</h1>
        <p className="text-muted-foreground">
          {userMunicipality.charAt(0).toUpperCase() + userMunicipality.slice(1)} Municipality - Manage venues and bookings
        </p>
      </div>

      {/* Town Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Venues</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.venues}</div>
            <p className="text-xs text-muted-foreground">Under management</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.bookings}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Town Performance</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.performance}%</div>
            <p className="text-xs text-muted-foreground">Efficiency score</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Venue Management
            </CardTitle>
            <CardDescription>
              Manage venues and bookings in your municipality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Link href="/venues">
                <Button className="w-full justify-start">
                  <Eye className="h-4 w-4 mr-2" />
                  Browse Venues
                </Button>
              </Link>
              <Link href="/bookings">
                <Button className="w-full justify-start">
                  <CalendarPlus className="h-4 w-4 mr-2" />
                  Book Venue
                </Button>
              </Link>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Your Venues:</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                {userVenues.map((venue, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Badge variant="secondary">✓</Badge>
                    {venue.name}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Booking Management
            </CardTitle>
            <CardDescription>
              View and manage upcoming bookings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Link href="/bookings">
                <Button variant="outline" className="w-full justify-start">
                  <Eye className="h-4 w-4 mr-2" />
                  View My Bookings
                </Button>
              </Link>
              <Link href="/calendar">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  View Calendar
                </Button>
              </Link>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Recent Activity:</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div>• {stats.bookings} total bookings</div>
                <div>• {stats.pending} pending approval</div>
                <div>• {stats.bookings - stats.pending} confirmed bookings</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            Recent Bookings
          </CardTitle>
          <CardDescription>
            Latest booking requests and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentBookings.map((booking, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{booking.title}</h4>
                  <Badge variant={booking.status === 'confirmed' ? 'default' : booking.status === 'pending' ? 'secondary' : 'outline'}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {booking.date} • {booking.expected_attendance} attendees
                </p>
                <p className="text-xs text-muted-foreground">
                  Organized by {booking.organizer}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Town Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Municipality Information
          </CardTitle>
          <CardDescription>
            Your role and scope within Capricorn District
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Your Role</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="default">Local Admin</Badge>
                  Municipality-level venue management
                </div>
                <p className="text-muted-foreground">
                  You manage venues and bookings within {userMunicipality.charAt(0).toUpperCase() + userMunicipality.slice(1)} municipality. 
                  All booking requests require district manager approval for large events.
                </p>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">District Context</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Capricorn District</Badge>
                  4 municipalities total
                </div>
                <p className="text-muted-foreground">
                  Part of Capricorn District managed by District Manager. 
                  Coordinate with other local admins for district-wide events.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
