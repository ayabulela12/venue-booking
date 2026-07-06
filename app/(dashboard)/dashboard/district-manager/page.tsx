"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRole } from "@/components/role-provider"
import { 
  Users, 
  MapPin, 
  Building, 
  Activity,
  TrendingUp,
  Calendar,
  Plus,
  Eye,
  Brain
} from "lucide-react"
import Link from "next/link"

export default function DistrictManagerDashboard() {
  const { isDistrictManager } = useRole()

  if (!isDistrictManager) {
    return <div>Access denied</div>
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">District Manager Dashboard</h1>
        <p className="text-muted-foreground">
          Capricorn District - Manage operations across all municipalities and venues
        </p>
      </div>

      {/* District Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Municipalities Managed</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">In Capricorn district</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Local Admins</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">Active town managers</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Venues</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Across district</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">District Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">95%</div>
            <p className="text-xs text-muted-foreground">Efficiency score</p>
          </CardContent>
        </Card>
      </div>

      {/* AI District Summary */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            AI District Summary
          </CardTitle>
          <CardDescription>
            Intelligent overview of district activities and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-3 bg-white rounded-lg border">
              <h4 className="font-medium text-sm mb-2">📈 Current Activity</h4>
              <p className="text-sm text-muted-foreground">
                District operating at 95% capacity with 12 active events across 3 towns. 
                High demand for community halls this weekend. Consider resource allocation for large events.
              </p>
            </div>
            
            <div className="p-3 bg-white rounded-lg border">
              <h4 className="font-medium text-sm mb-2">🎯 Recommendations</h4>
              <p className="text-sm text-muted-foreground">
                Kraaifontein Central venue showing 30% overbooking. Consider redistributing events to 
                Wallacedene venue. Medical department requests additional resources for Saturday festival.
              </p>
            </div>
          </div>
          
          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <h4 className="font-medium text-sm mb-2 text-yellow-800">⚠️ Resource Alerts</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Traffic department needed for 3 events this weekend</li>
              <li>• Medical services required for festival (500+ attendees)</li>
              <li>• Fire department on standby for outdoor concert</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Local User Management
            </CardTitle>
            <CardDescription>
              Create and manage local admins within your district
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Link href="/users">
                <Button className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Local Admin
                </Button>
              </Link>
              <Link href="/users">
                <Button variant="outline" className="w-full justify-start">
                  <Eye className="h-4 w-4 mr-2" />
                  View Local Admins
                </Button>
              </Link>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Your Permissions:</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">✓</Badge>
                  Create local admins in district
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">✓</Badge>
                  Monitor all town operations
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">✗</Badge>
                  Cannot create other district managers
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              District Operations
            </CardTitle>
            <CardDescription>
              Monitor and manage district-wide activities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Link href="/bookings">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  View All Bookings
                </Button>
              </Link>
              <Link href="/dashboard/operations">
                <Button variant="outline" className="w-full justify-start">
                  <Activity className="h-4 w-4 mr-2" />
                  Operations Overview
                </Button>
              </Link>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">District Scope:</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Badge variant="default">Kraaifontein</Badge>
                  3 towns, 8 venues
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Resource Mgmt</Badge>
                  Cross-town coordination
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Town Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Town Performance Overview
          </CardTitle>
          <CardDescription>
            Monitor performance and activities across all towns in your district
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Kraaifontein Central</h4>
                <Badge variant="default">High</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">Local Admin: Mike Davis</p>
              <div className="text-xs space-y-1">
                <div>• 4 venues • 6 bookings</div>
                <div>• Performance: 97%</div>
                <div>• Resource usage: Optimal</div>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Wallacedene</h4>
                <Badge variant="secondary">Medium</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">Local Admin: Lisa Chen</p>
              <div className="text-xs space-y-1">
                <div>• 2 venues • 3 bookings</div>
                <div>• Performance: 94%</div>
                <div>• Resource usage: Available</div>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Bloekombos</h4>
                <Badge variant="outline">Low</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">Local Admin: Tom Wilson</p>
              <div className="text-xs space-y-1">
                <div>• 2 venues • 3 bookings</div>
                <div>• Performance: 89%</div>
                <div>• Resource usage: Underutilized</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
