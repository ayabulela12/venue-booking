"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRole } from "@/components/role-provider"
import { 
  Users, 
  Shield, 
  MapPin, 
  Building, 
  Activity,
  Settings,
  Plus,
  Eye
} from "lucide-react"
import Link from "next/link"

export default function SystemAdminDashboard() {
  const { isSystemAdmin } = useRole()

  if (!isSystemAdmin) {
    return <div>Access denied</div>
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Super user oversight - Manage Capricorn District municipalities, users, and system operations
        </p>
      </div>

      {/* System Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Municipalities</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">Capricorn District</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">Across all municipalities</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Venues</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">31</div>
            <p className="text-xs text-muted-foreground">Across municipalities</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">Operational</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription>
              Create and manage users across all municipalities and roles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Link href="/users">
                <Button className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New User
                </Button>
              </Link>
              <Link href="/users">
                <Button variant="outline" className="w-full justify-start">
                  <Eye className="h-4 w-4 mr-2" />
                  View All Users
                </Button>
              </Link>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">User Creation Permissions:</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">✓</Badge>
                  Can create District Managers
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">✓</Badge>
                  Can create Local Admins
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">✓</Badge>
                  Can create Operations users
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              System Administration
            </CardTitle>
            <CardDescription>
              System configuration and oversight tools
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Link href="/logs">
                <Button variant="outline" className="w-full justify-start">
                  <Activity className="h-4 w-4 mr-2" />
                  View System Logs
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start" disabled>
                <Settings className="h-4 w-4 mr-2" />
                System Settings (Coming Soon)
              </Button>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">System Access:</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Badge variant="default">Full Access</Badge>
                  All districts and features
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default">Super User</Badge>
                  Can approve all sub-users
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Municipality Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Municipality Overview
          </CardTitle>
          <CardDescription>
            Monitor all Capricorn District municipalities and their performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Polokwane</h4>
                <Badge variant="default">Active</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">Main City - Administrative Center</p>
              <div className="text-xs space-y-1">
                <div>• 12 venues managed</div>
                <div>• 9 active bookings</div>
                <div>• 78% confirmed rate</div>
                <div>• Low risk indicator</div>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Blouberg</h4>
                <Badge variant="default">Active</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">Rural Municipality</p>
              <div className="text-xs space-y-1">
                <div>• 6 venues managed</div>
                <div>• 2 active bookings</div>
                <div>• 50% confirmed rate</div>
                <div>• Low risk indicator</div>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Molemole</h4>
                <Badge variant="default">Active</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">Mixed Urban-Rural</p>
              <div className="text-xs space-y-1">
                <div>• 8 venues managed</div>
                <div>• 2 active bookings</div>
                <div>• 50% confirmed rate</div>
                <div>• Medium risk indicator</div>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Lepelle-Nkumpi</h4>
                <Badge variant="outline">Active</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">Rural Mining Communities</p>
              <div className="text-xs space-y-1">
                <div>• 5 venues managed</div>
                <div>• 2 active bookings</div>
                <div>• 50% confirmed rate</div>
                <div>• Low risk indicator</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
