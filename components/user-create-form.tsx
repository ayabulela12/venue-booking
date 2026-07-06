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
import { Plus, Shield, MapPin, Building, UserCheck } from "lucide-react"
import { useRole } from "@/components/role-provider"

interface UserCreateFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateUser: (user: {
    name: string
    email: string
    role: string
    municipality: string
    department: string
  }) => void
  onShowNotification: (type: "success" | "error", title: string, message: string) => void
}

const defaultFormData = {
  name: "",
  email: "",
  role: "local_admin",
  municipality: "polokwane",
  department: "",
}

export function UserCreateForm({
  open,
  onOpenChange,
  onCreateUser,
  onShowNotification,
}: UserCreateFormProps) {
  const { isSystemAdmin } = useRole()
  const [formData, setFormData] = useState(defaultFormData)

  const getCreateableRoles = () => {
    if (isSystemAdmin) {
      return ["district_manager", "local_admin", "operations"]
    }
    return ["local_admin"]
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "system_admin":
        return <Shield className="h-4 w-4" />
      case "district_manager":
        return <MapPin className="h-4 w-4" />
      case "local_admin":
        return <Building className="h-4 w-4" />
      case "operations":
        return <UserCheck className="h-4 w-4" />
      default:
        return <UserCheck className="h-4 w-4" />
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "system_admin":
        return "System Admin"
      case "district_manager":
        return "District Manager"
      case "local_admin":
        return "Local Admin"
      case "operations":
        return "Operations"
      default:
        return role
    }
  }

  useEffect(() => {
    if (open) {
      const roles = getCreateableRoles()
      setFormData({
        ...defaultFormData,
        role: roles[0] ?? "local_admin",
      })
    }
  }, [open, isSystemAdmin])

  const handleSubmit = () => {
    if (!formData.name || !formData.email) {
      onShowNotification("error", "Validation Error", "Please fill in all required fields")
      return
    }

    onCreateUser(formData)
    setFormData(defaultFormData)
    onOpenChange(false)
  }

  const createableRoles = getCreateableRoles()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New User
          </DialogTitle>
          <DialogDescription>
            {isSystemAdmin
              ? "Create district managers, local admins, or operations users"
              : "Create local admins within your district"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name *</label>
            <Input
              placeholder="Enter user name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email *</label>
            <Input
              type="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Role *</label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData({ ...formData, role: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {createableRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    <span className="flex items-center gap-2">
                      {getRoleIcon(role)}
                      {getRoleDisplayName(role)}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(isSystemAdmin || formData.role !== "operations") && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Municipality *</label>
              <Select
                value={formData.municipality}
                onValueChange={(value) => setFormData({ ...formData, municipality: value })}
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

          {formData.role === "operations" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <Input
                placeholder="Enter department (e.g., emergency_services)"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            <Plus className="h-4 w-4 mr-2" />
            Create User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
