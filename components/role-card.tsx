"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Shield, MapPin, Building, Users } from "lucide-react"
import type { UserRole } from "@/lib/types"
import { getRoleDisplayName, getRoleDescription } from "@/lib/role-credentials"

interface RoleCardProps {
  role: UserRole
  onLogin: (role: UserRole) => void
  loading: boolean
  disabled?: boolean
}

export function RoleCard({ role, onLogin, loading, disabled = false }: RoleCardProps) {
  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "system_admin":
        return <Shield className="h-8 w-8" />
      case "district_manager":
        return <MapPin className="h-8 w-8" />
      case "local_admin":
        return <Building className="h-8 w-8" />
      case "operations":
        return <Users className="h-8 w-8" />
      default:
        return <Shield className="h-8 w-8" />
    }
  }

  const getRoleVariant = (role: UserRole) => {
    switch (role) {
      case "system_admin":
        return "default"
      case "district_manager":
        return "secondary"
      case "local_admin":
        return "outline"
      case "operations":
        return "destructive" as const
      default:
        return "default"
    }
  }

  return (
    <Card className={`transition-all duration-200 hover:shadow-lg hover:scale-105 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
      <CardHeader className="text-center pb-3">
        <div className="flex justify-center mb-2">
          <div className="p-3 rounded-full bg-primary/10">
            {getRoleIcon(role)}
          </div>
        </div>
        <CardTitle className="text-lg">{getRoleDisplayName(role)}</CardTitle>
        <Badge variant={getRoleVariant(role)} className="w-fit mx-auto">
          {role.replace('_', ' ').toUpperCase()}
        </Badge>
      </CardHeader>
      
      <CardContent className="pt-0">
        <CardDescription className="text-center mb-4 min-h-[2.5rem]">
          {getRoleDescription(role)}
        </CardDescription>
        
        <Button
          onClick={() => onLogin(role)}
          disabled={loading || disabled}
          className="w-full"
          variant={getRoleVariant(role)}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            `Login as ${getRoleDisplayName(role)}`
          )}
        </Button>
        
        {disabled && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            Credentials not configured
          </p>
        )}
      </CardContent>
    </Card>
  )
}
