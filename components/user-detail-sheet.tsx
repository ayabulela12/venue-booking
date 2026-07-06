"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Shield, MapPin, Building, UserCheck, Mail, Calendar } from "lucide-react"

interface UserDetailSheetProps {
  user: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserDetailSheet({
  user,
  open,
  onOpenChange,
}: UserDetailSheetProps) {
  if (!user) return null

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

  const getRoleColor = (role: string) => {
    switch(role) {
      case "system_admin": return "default"
      case "district_manager": return "secondary"
      case "local_admin": return "outline"
      case "operations": return "destructive"
      default: return "outline"
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {getRoleIcon(user.role)}
            {user.name}
          </SheetTitle>
          <SheetDescription>{user.email}</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 mt-6">
          {/* User Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1 rounded-md border p-3">
              <span className="text-xs text-muted-foreground">Role</span>
              <Badge variant={getRoleColor(user.role) as any} className="w-fit capitalize">
                {getRoleDisplayName(user.role)}
              </Badge>
            </div>
            <div className="flex flex-col gap-1 rounded-md border p-3">
              <span className="text-xs text-muted-foreground">Status</span>
              <Badge variant={user.status === "active" ? "default" : "secondary"}>
                {user.status}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-medium">Contact Information</h4>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{user.email}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Location Information */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-medium">Location Information</h4>
            <div className="flex flex-col gap-2">
              {user.municipality && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="capitalize">{user.municipality} Municipality</span>
                </div>
              )}
              {user.department && (
                <div className="flex items-center gap-2 text-sm">
                  <Building className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{user.department}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Account Information */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-medium">Account Information</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" />
                <span>User ID: {user.id}</span>
              </div>
              <div>Account created and managed through Capricorn District system</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1">
              Edit User
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
