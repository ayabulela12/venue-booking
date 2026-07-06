"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRole } from "@/components/role-provider"
import { createClient } from "@supabase/supabase-js"
import { 
  Shield, 
  Activity,
  AlertTriangle,
  Users,
  MapPin,
  Calendar,
  Bell,
  Filter,
  Eye,
  Ambulance,
  Car,
  Building,
  UserCheck
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function OperationsDashboard() {
  const { isOperations } = useRole()
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all")
  const [notifications, setNotifications] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalEvents: 0,
    highPriority: 0,
    mediumPriority: 0,
    lowPriority: 0
  })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchOperationsData()
  }, [])

  const fetchOperationsData = async () => {
    try {
      // Get all bookings from Capricorn District
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('*')
        .in('municipality', ['polokwane', 'blouberg', 'molemole', 'lepel'])
        .order('date', { ascending: true })

      if (error) {
        console.error('Error fetching operations data:', error)
        toast.error('Failed to load operations data')
        return
      }

      // Convert bookings to operations notifications
      const operationsNotifications = bookings?.map(booking => ({
        id: booking.id,
        event: booking.title,
        venue: booking.venue_id, // We'll need to join with venues table
        date: booking.date,
        attendees: booking.expected_attendance,
        departments: booking.expected_attendance > 500 ? ['medical', 'traffic', 'police'] : 
                     booking.expected_attendance > 200 ? ['medical', 'traffic'] : 
                     booking.expected_attendance > 100 ? ['medical'] : [],
        priority: booking.expected_attendance > 500 ? 'high' : 
                 booking.expected_attendance > 200 ? 'medium' : 'low',
        status: booking.status,
        municipality: booking.municipality
      })) || []

      setNotifications(operationsNotifications)

      // Calculate stats
      const highPriority = operationsNotifications.filter(n => n.priority === 'high').length
      const mediumPriority = operationsNotifications.filter(n => n.priority === 'medium').length
      const lowPriority = operationsNotifications.filter(n => n.priority === 'low').length

      setStats({
        totalEvents: operationsNotifications.length,
        highPriority,
        mediumPriority,
        lowPriority
      })
    } catch (error) {
      console.error('Error in fetchOperationsData:', error)
      toast.error('Failed to load operations data')
    }
  }

  const departments = [
    { id: "medical", name: "Medical", icon: Ambulance, color: "red" },
    { id: "fire", name: "Fire", icon: Building, color: "orange" },
    { id: "traffic", name: "Traffic", icon: Car, color: "blue" },
    { id: "police", name: "Police", icon: UserCheck, color: "green" }
  ]

  const filteredNotifications = selectedDepartment === "all" 
    ? notifications 
    : notifications.filter(n => n.departments.includes(selectedDepartment))

  const getDepartmentIcon = (deptId: string) => {
    const dept = departments.find((d: any) => d.id === deptId)
    const Icon = dept?.icon || Shield
    return <Icon className="h-4 w-4" />
  }

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case "high": return "destructive"
      case "medium": return "secondary"
      case "low": return "outline"
      default: return "outline"
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Operations Dashboard</h1>
        <p className="text-muted-foreground">
          Capricorn District operations and intelligent event notifications
        </p>
      </div>

      {/* Department Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {departments.map((dept) => (
          <Card key={dept.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{dept.name}</CardTitle>
              <dept.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {selectedDepartment === 'all' ? stats.totalEvents : notifications.filter((n: any) => n.departments.includes(selectedDepartment)).length}
              </div>
              <p className="text-xs text-muted-foreground">Active notifications</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Department Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Department Filter
          </CardTitle>
          <CardDescription>
            View notifications by department or see all operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedDepartment === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDepartment("all")}
            >
              <Eye className="h-4 w-4 mr-2" />
              All Departments
            </Button>
            {departments.map((dept) => (
              <Button
                key={dept.id}
                variant={selectedDepartment === dept.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDepartment(dept.id)}
              >
                <dept.icon className="h-4 w-4 mr-2" />
                {dept.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Intelligent Notifications */}
      <Card className="border-orange-200 bg-orange-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-orange-600" />
            Intelligent Event Notifications
          </CardTitle>
          <CardDescription>
            Automatically generated department requirements based on event size and type
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-3 bg-white rounded-lg border">
              <h4 className="font-medium text-sm mb-2">🎯 Notification Logic</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Large events (&gt;500): All departments</li>
                <li>• Medium events (&gt;200): Medical + Traffic</li>
                <li>• Concerts/Festivals: Medical + Traffic + Police</li>
                <li>• Sports events: Medical + Traffic</li>
              </ul>
            </div>
            
            <div className="p-3 bg-white rounded-lg border">
              <h4 className="font-medium text-sm mb-2">📊 Current Status</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• {stats.highPriority} high-priority events</li>
                <li>• {notifications.filter((n: any) => n.status === "pending").length} pending confirmations</li>
                <li>• {notifications.filter((n: any) => n.departments.includes("medical")).length} medical deployments</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Event Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Event Notifications
          </CardTitle>
          <CardDescription>
            {selectedDepartment === "all" 
              ? "All department notifications"
              : `${departments.find((d: any) => d.id === selectedDepartment)?.name} department notifications`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredNotifications.map((notification: any) => (
              <div key={notification.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{notification.event}</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant={getPriorityColor(notification.priority)}>
                      {notification.priority} priority
                    </Badge>
                    <Badge variant={notification.status === "confirmed" ? "default" : "secondary"}>
                      {notification.status}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-2">
                  <MapPin className="h-3 w-3 inline mr-1" />
                  {notification.venue} • 
                  <Calendar className="h-3 w-3 inline mx-1" />
                  {notification.date} • 
                  <Users className="h-3 w-3 inline mx-1" />
                  {notification.attendees} attendees
                </p>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Required departments:</span>
                  {notification.departments.length > 0 ? (
                    <div className="flex gap-1">
                      {notification.departments.map((dept) => (
                        <Badge key={dept} variant="outline" className="text-xs">
                          {getDepartmentIcon(dept)}
                          <span className="ml-1">
                            {departments.find(d => d.id === dept)?.name}
                          </span>
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      No departments required
                    </Badge>
                  )}
                </div>
                
                {notification.departments.includes("medical") && (
                  <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                    <Ambulance className="h-3 w-3 inline mr-1" />
                    Medical team required - {notification.attendees}+ attendees
                  </div>
                )}
                
                {notification.departments.includes("traffic") && (
                  <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-700">
                    <Car className="h-3 w-3 inline mr-1" />
                    Traffic control needed for event access
                  </div>
                )}
                
                {notification.departments.includes("police") && (
                  <div className="mt-2 p-2 bg-green-50 rounded text-sm text-green-700">
                    <UserCheck className="h-3 w-3 inline mr-1" />
                    Police presence required for crowd management
                  </div>
                )}
                
                {notification.departments.includes("fire") && (
                  <div className="mt-2 p-2 bg-orange-50 rounded text-sm text-orange-700">
                    <Building className="h-3 w-3 inline mr-1" />
                    Fire department on standby for safety
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Department Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Department Resources
          </CardTitle>
          <CardDescription>
            Current resource allocation and availability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {departments.map((dept) => (
              <div key={dept.id} className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <dept.icon className="h-5 w-5" />
                  <h4 className="font-medium">{dept.name} Department</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Active Deployments:</span>
                    <Badge variant="outline">
                      {notifications.filter(n => n.departments.includes(dept.id)).length}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Resource Status:</span>
                    <Badge variant={notifications.filter(n => n.departments.includes(dept.id)).length > 2 ? "destructive" : "secondary"}>
                      {notifications.filter(n => n.departments.includes(dept.id)).length > 2 ? "High Load" : "Available"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Next Deployment:</span>
                    <span className="text-muted-foreground">
                      {notifications.find(n => n.departments.includes(dept.id))?.date || "None scheduled"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
