"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRole } from "@/components/role-provider"
import { 
  Users, 
  Plus,
  Eye,
  Edit,
  Shield,
  MapPin,
  Building,
  UserCheck
} from "lucide-react"

export default function UsersPage() {
  const { isSystemAdmin, isDistrictManager } = useRole()
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Mock user data
  const users = [
    {
      id: 1,
      name: "John Smith",
      email: "john@district.gov",
      role: "district_manager",
      district: "Kraaifontein",
      status: "active"
    },
    {
      id: 2,
      name: "Mike Davis",
      email: "mike@local.gov",
      role: "local_admin",
      district: "Kraaifontein",
      town: "Kraaifontein Central",
      status: "active"
    },
    {
      id: 3,
      name: "Lisa Chen",
      email: "lisa@local.gov",
      role: "local_admin",
      district: "Kraaifontein",
      town: "Wallacedene",
      status: "active"
    },
    {
      id: 4,
      name: "Tom Wilson",
      email: "tom@local.gov",
      role: "local_admin",
      district: "Kraaifontein",
      town: "Bloekombos",
      status: "active"
    },
    {
      id: 5,
      name: "Dr. Sarah Johnson",
      email: "sarah@medical.gov",
      role: "operations",
      district: "Kraaifontein",
      department: "medical",
      status: "active"
    },
    {
      id: 6,
      name: "Capt. James Brown",
      email: "james@fire.gov",
      role: "operations",
      district: "Kraaifontein",
      department: "fire",
      status: "active"
    }
  ]

  const getRoleIcon = (role: string) => {
    switch(role) {
      case "system_admin": return <Shield className="h-4 w-4" />
      case "district_manager": return <MapPin className="h-4 w-4" />
      case "local_admin": return <Building className="h-4 w-4" />
      case "operations": return <UserCheck className="h-4 w-4" />
      default: return <Users className="h-4 w-4" />
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch(role) {
      case "system_admin": return "System Admin"
      case "district_manager": return "District Manager"
      case "local_admin": return "Local Admin"
      case "operations": return "Operations"
      default: return role
    }
  }

  const getRoleColor = (role: string) => {
    switch(role) {
      case "system_admin": return "default"
      case "district_manager": return "secondary"
      case "local_admin": return "outline"
      case "operations": return "destructive"
      default: return "outline"
    }
  }

  const canCreateUser = () => {
    if (isSystemAdmin) return true
    if (isDistrictManager) return true // Can create local admins
    return false
  }

  const getCreateableRoles = () => {
    if (isSystemAdmin) {
      return ["district_manager", "local_admin", "operations"]
    }
    if (isDistrictManager) {
      return ["local_admin"] // Only within their district
    }
    return []
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">
          {isSystemAdmin 
            ? "Manage all users across the system"
            : "Manage local admins within your district"
          }
        </p>
      </div>

      {/* User Creation */}
      {canCreateUser() && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create New User
            </CardTitle>
            <CardDescription>
              {isSystemAdmin 
                ? "Create district managers, local admins, or operations users"
                : "Create local admins within your district"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-2">
                <h4 className="text-sm font-medium">Available Roles to Create:</h4>
                <div className="flex gap-2 flex-wrap">
                  {getCreateableRoles().map((role) => (
                    <Badge key={role} variant={getRoleColor(role) as any}>
                      {getRoleIcon(role)}
                      <span className="ml-1">{getRoleDisplayName(role)}</span>
                    </Badge>
                  ))}
                </div>
              </div>
              
              <Button 
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                {showCreateForm ? "Hide Form" : "Create New User"}
              </Button>
              
              {showCreateForm && (
                <div className="p-4 border rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-2">
                    User creation form would go here. For now, this is a demonstration of the role-based access control.
                  </p>
                  <div className="text-xs space-y-1">
                    <div>• System Admin: Can create all role types</div>
                    <div>• District Manager: Can create local admins only</div>
                    <div>• Local Admin: Cannot create users</div>
                    <div>• Operations: Cannot create users</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            System Users
          </CardTitle>
          <CardDescription>
            All users in the system with their roles and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{user.name}</h4>
                    <Badge variant={getRoleColor(user.role) as any}>
                      {getRoleIcon(user.role)}
                      <span className="ml-1">{getRoleDisplayName(user.role)}</span>
                    </Badge>
                    <Badge variant={user.status === "active" ? "default" : "secondary"}>
                      {user.status}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-2">{user.email}</p>
                
                <div className="text-xs text-muted-foreground space-y-1">
                  {user.district && (
                    <div>• District: {user.district}</div>
                  )}
                  {user.town && (
                    <div>• Town: {user.town}</div>
                  )}
                  {user.department && (
                    <div>• Department: {user.department}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Role Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Role Permissions
          </CardTitle>
          <CardDescription>
            User creation permissions for each role
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">System Admin</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ Can create District Managers</li>
                <li>✓ Can create Local Admins</li>
                <li>✓ Can create Operations users</li>
                <li>✓ Can manage all users</li>
                <li>✓ Full system access</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">District Manager</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ Can create Local Admins (within district)</li>
                <li>✗ Cannot create District Managers</li>
                <li>✗ Cannot create Operations users</li>
                <li>✓ Can manage local admins in district</li>
                <li>✓ District-wide oversight</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Local Admin</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✗ Cannot create any users</li>
                <li>✓ Can manage venues and bookings</li>
                <li>✓ Town-level operations</li>
                <li>✓ Existing operator functionality</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Operations</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✗ Cannot create any users</li>
                <li>✓ Department-specific notifications</li>
                <li>✓ Event resource management</li>
                <li>✓ Intelligent alert system</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
