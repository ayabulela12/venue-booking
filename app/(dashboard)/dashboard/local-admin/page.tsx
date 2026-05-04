"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRole } from "@/components/role-provider"
import { 
  Building, 
  Calendar,
  Ticket,
  Users,
  Activity,
  Plus,
  Eye,
  MapPin
} from "lucide-react"
import Link from "next/link"

export default function LocalAdminDashboard() {
  const { isLocalAdmin } = useRole()

  if (!isLocalAdmin) {
    return <div>Access denied</div>
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Local Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Kraaifontein Central - Manage town venues and bookings
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
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">Under management</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Town Performance</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">97%</div>
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
              Manage venues and bookings in your town
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
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  New Booking Request
                </Button>
              </Link>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Your Venues:</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">✓</Badge>
                  Kraaifontein Community Hall
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">✓</Badge>
                  Kraaifontein Sports Center
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">✓</Badge>
                  Local Library Hall
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">✓</Badge>
                  Town Meeting Room
                </div>
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
                <div>• 3 bookings approved this week</div>
                <div>• 2 pending approval</div>
                <div>• 1 event scheduled for Saturday</div>
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
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Community Meeting</h4>
                <Badge variant="default">Confirmed</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Kraaifontein Community Hall • May 15, 2024 • 50 attendees
              </p>
              <p className="text-xs text-muted-foreground">
                Organized by Local Civic Association • Approved by District Manager
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Youth Sports Tournament</h4>
                <Badge variant="secondary">Pending</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Kraaifontein Sports Center • May 20, 2024 • 120 attendees
              </p>
              <p className="text-xs text-muted-foreground">
                Organized by Youth Sports Club • Awaiting district approval
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Health Awareness Workshop</h4>
                <Badge variant="outline">Draft</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Local Library Hall • May 25, 2024 • 30 attendees
              </p>
              <p className="text-xs text-muted-foreground">
                Organized by Health Department • Draft booking
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Town Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Town Information
          </CardTitle>
          <CardDescription>
            Your role and scope within the district
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Your Role</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="default">Local Admin</Badge>
                  Town-level venue management
                </div>
                <p className="text-muted-foreground">
                  You manage venues and bookings within Kraaifontein Central town. 
                  All booking requests require district manager approval for large events.
                </p>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">District Context</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Kraaifontein District</Badge>
                  3 towns total
                </div>
                <p className="text-muted-foreground">
                  Part of Kraaifontein district managed by District Manager. 
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
