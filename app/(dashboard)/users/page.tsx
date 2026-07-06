"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRole } from "@/components/role-provider"
import { useNotifications } from "@/app/(dashboard)/layout"
import { 
  Users, 
  Plus,
  Eye,
  Edit,
  Shield,
  MapPin,
  Building,
  UserCheck,
  Trash2,
  Ban
} from "lucide-react"
import { createClient } from "@supabase/supabase-js"
import { UserDetailSheet } from "@/components/user-detail-sheet"
import { UserEditForm } from "@/components/user-edit-form"
import { UserCreateForm } from "@/components/user-create-form"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

export default function UsersPage() {
  const { isSystemAdmin, isDistrictManager } = useRole()
  const { showNotification } = useNotifications()
  const [createFormOpen, setCreateFormOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [showUserDetail, setShowUserDetail] = useState(false)
  const [showUserEdit, setShowUserEdit] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false)
  const [selectedMunicipality, setSelectedMunicipality] = useState("all")

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Capricorn District user data
  const [users, setUsers] = useState<any[]>([
    {
      id: 1,
      name: "Thabo Mokoena",
      email: "thabo.mokoena@capricorn.gov",
      role: "district_manager",
      municipality: "polokwane",
      status: "active"
    },
    {
      id: 2,
      name: "Sarah Dlamini",
      email: "sarah.dlamini@polokwane.gov",
      role: "local_admin",
      municipality: "polokwane",
      status: "active"
    },
    {
      id: 3,
      name: "Peter Potgieter",
      email: "peter.potgieter@blouberg.gov",
      role: "local_admin",
      municipality: "blouberg",
      status: "active"
    },
    {
      id: 4,
      name: "Maria Molefe",
      email: "maria.molefe@molemole.gov",
      role: "local_admin",
      municipality: "molemole",
      status: "active"
    },
    {
      id: 5,
      name: "Jacob Sekukuni",
      email: "jacob.sekukuni@lepel.gov",
      role: "local_admin",
      municipality: "lepel",
      status: "active"
    },
    {
      id: 6,
      name: "Operations Team",
      email: "operations@capricorn.gov",
      role: "operations",
      municipality: "polokwane",
      department: "emergency_services",
      status: "active"
    }
  ])

  // Filter users by municipality
  const filteredUsers = selectedMunicipality === "all" 
    ? users 
    : users.filter(user => user.municipality === selectedMunicipality)

  const handleDeleteUser = async (userId: number | string, userName: string) => {
    setSelectedUser({ id: userId, name: userName })
    setShowDeleteConfirm(true)
  }

  const confirmDeleteUser = async () => {
    try {
      // In a real implementation, this would delete from auth.users and profiles
      console.log(`Deleting user: ${selectedUser?.id} - ${selectedUser?.name}`)
      
      // Remove from local state - handle both string and number IDs
      setUsers(users.filter(u => {
        const userIdStr = typeof selectedUser?.id === 'string' ? selectedUser.id : selectedUser?.id?.toString()
        return u.id !== userIdStr
      }))
      
      showNotification('success', 'User Deleted', `User "${selectedUser?.name}" has been deleted successfully`)
      setShowDeleteConfirm(false)
      setSelectedUser(null)
    } catch (error) {
      console.error('Error deleting user:', error)
      showNotification('error', 'Delete Failed', 'Failed to delete user')
    }
  }

  const handleRevokeAccess = async (userId: number | string, userName: string) => {
    setSelectedUser({ id: userId, name: userName })
    setShowRevokeConfirm(true)
  }

  const confirmRevokeAccess = async () => {
    try {
      // In a real implementation, this would disable user account
      console.log(`Revoking access for user: ${selectedUser?.id} - ${selectedUser?.name}`)
      
      // Update user status in local state - handle both string and number IDs
      setUsers(users.map(u => {
        const userIdStr = typeof selectedUser?.id === 'string' ? selectedUser.id : selectedUser?.id?.toString()
        return u.id !== userIdStr
      }))
      
      showNotification('success', 'Access Revoked', `Access revoked for user "${selectedUser?.name}"`)
      setShowRevokeConfirm(false)
      setSelectedUser(null)
    } catch (error) {
      console.error('Error revoking access:', error)
      showNotification('error', 'Revoke Failed', 'Failed to revoke access')
    }
  }

  const handleCreateUser = async (formData: {
    name: string
    email: string
    role: string
    municipality: string
    department: string
  }) => {
    try {
      // In a real implementation, this would create user in Supabase auth and profiles
      console.log('Creating user:', formData)

      const newUser = {
        id: parseInt(Date.now().toString()),
        name: formData.name,
        email: formData.email,
        role: formData.role,
        municipality: formData.municipality,
        department: formData.department || '',
        status: 'active'
      }

      setUsers([...users, newUser])
      showNotification('success', 'User Created', `User "${formData.name}" has been created successfully`)
    } catch (error) {
      console.error('Error creating user:', error)
      showNotification('error', 'Create Failed', 'Failed to create user')
    }
  }

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

  const handleViewUser = (user: any) => {
    setSelectedUser(user)
    setShowUserDetail(true)
  }

  const handleEditUser = (user: any) => {
    setSelectedUser(user)
    setShowUserEdit(true)
  }

  const handleUpdateUser = (updatedUser: any) => {
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u))
  }

  const canCreateUser = () => {
    if (isSystemAdmin) return true
    if (isDistrictManager) return true // Can create local admins
    return false
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">
            User Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isSystemAdmin
              ? "Manage all users across the system"
              : "Manage local admins within your district"}
          </p>
        </div>
        {canCreateUser() && (
          <Button onClick={() => setCreateFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        )}
      </div>

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
            {/* Municipality Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Filter by Municipality:</label>
              <Select value={selectedMunicipality} onValueChange={setSelectedMunicipality}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All municipalities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Municipalities</SelectItem>
                  <SelectItem value="polokwane">Polokwane</SelectItem>
                  <SelectItem value="blouberg">Blouberg</SelectItem>
                  <SelectItem value="molemole">Molemole</SelectItem>
                  <SelectItem value="lepel">Lepelle-Nkumpi</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">
                ({filteredUsers.length} users)
              </span>
            </div>

            {/* Users List */}
            {filteredUsers.map((user) => (
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
                    <Button variant="outline" size="sm" onClick={() => handleViewUser(user)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    {(isSystemAdmin || isDistrictManager) && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-orange-600 hover:text-orange-700"
                          onClick={() => handleRevokeAccess(user.id, user.name)}
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteUser(user.id, user.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-2">{user.email}</p>
                
                <div className="text-xs text-muted-foreground space-y-1">
                  {user.municipality && (
                    <div>• Municipality: {user.municipality}</div>
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

      {/* Modals */}
      <UserDetailSheet
        user={selectedUser}
        open={showUserDetail}
        onOpenChange={setShowUserDetail}
      />

      <UserEditForm
        user={selectedUser}
        open={showUserEdit}
        onOpenChange={setShowUserEdit}
        onUpdateUser={handleUpdateUser}
        onShowNotification={showNotification}
      />

      {canCreateUser() && (
        <UserCreateForm
          open={createFormOpen}
          onOpenChange={setCreateFormOpen}
          onCreateUser={handleCreateUser}
          onShowNotification={showNotification}
        />
      )}

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete User"
        description={`Are you sure you want to delete user "${selectedUser?.name}"? This action cannot be undone and will remove all access to the system.`}
        confirmText="Delete User"
        type="delete"
        onConfirm={confirmDeleteUser}
      />

      <ConfirmDialog
        open={showRevokeConfirm}
        onOpenChange={setShowRevokeConfirm}
        title="Revoke Access"
        description={`Are you sure you want to revoke access for user "${selectedUser?.name}"? This will suspend their account and prevent system access.`}
        confirmText="Revoke Access"
        type="revoke"
        onConfirm={confirmRevokeAccess}
      />
    </div>
  )
}
