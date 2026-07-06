"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Shield, MapPin, Building, UserCheck } from "lucide-react"

interface UserEditFormProps {
  user: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdateUser: (updatedUser: any) => void
  onShowNotification: (type: 'success' | 'error', title: string, message: string) => void
}

export function UserEditForm({
  user,
  open,
  onOpenChange,
  onUpdateUser,
  onShowNotification,
}: UserEditFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'local_admin',
    municipality: 'polokwane',
    department: '',
    status: 'active'
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'local_admin',
        municipality: user.municipality || 'polokwane',
        department: user.department || '',
        status: user.status || 'active'
      })
    }
  }, [user])

  const handleSubmit = () => {
    if (!formData.name || !formData.email) {
      onShowNotification('error', 'Validation Error', 'Please fill in all required fields')
      return
    }

    const updatedUser = {
      ...user,
      ...formData
    }

    onUpdateUser(updatedUser)
    onShowNotification('success', 'User Updated', `User "${formData.name}" has been updated successfully`)
    onOpenChange(false)
  }

  const getRoleIcon = (role: string) => {
    switch(role) {
      case "system_admin": return <Shield className="h-4 w-4" />
      case "district_manager": return <MapPin className="h-4 w-4" />
      case "local_admin": return <Building className="h-4 w-4" />
      case "operations": return <UserCheck className="h-4 w-4" />
      default: return <UserCheck className="h-4 w-4" />
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getRoleIcon(formData.role)}
            Edit User
          </DialogTitle>
          <DialogDescription>
            Update user information and permissions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name *</label>
            <Input
              placeholder="Enter user name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email *</label>
            <Input
              type="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Role *</label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData({...formData, role: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system_admin">System Admin</SelectItem>
                <SelectItem value="district_manager">District Manager</SelectItem>
                <SelectItem value="local_admin">Local Admin</SelectItem>
                <SelectItem value="operations">Operations</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Status *</label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({...formData, status: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(formData.role !== 'operations') && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Municipality *</label>
              <Select
                value={formData.municipality}
                onValueChange={(value) => setFormData({...formData, municipality: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select municipality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="polokwane">Polokwane</SelectItem>
                  <SelectItem value="blouberg">Blouberg</SelectItem>
                  <SelectItem value="molemole">Molemole</SelectItem>
                  <SelectItem value="lepel">Lepelle-Nkumpi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {formData.role === 'operations' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <Input
                placeholder="Enter department (e.g., emergency_services)"
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
              />
            </div>
          )}

          <div className="flex items-center gap-2 p-3 rounded-md border bg-muted/50">
            <Badge variant="outline" className="capitalize">
              {getRoleIcon(formData.role)}
              <span className="ml-1">{getRoleDisplayName(formData.role)}</span>
            </Badge>
            <span className="text-sm text-muted-foreground">
              {formData.municipality && `• ${formData.municipality} municipality`}
              {formData.department && `• ${formData.department} department`}
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Update User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
