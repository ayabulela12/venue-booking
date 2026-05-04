"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useRole } from "@/components/role-provider"

export default function DashboardPage() {
  const router = useRouter()
  const { isSystemAdmin, isDistrictManager, isLocalAdmin, isOperations, authLoading } = useRole()

  useEffect(() => {
    if (authLoading) return

    // Redirect to role-specific dashboard
    if (isSystemAdmin) {
      router.replace("/dashboard/system-admin")
    } else if (isDistrictManager) {
      router.replace("/dashboard/district-manager")
    } else if (isLocalAdmin) {
      router.replace("/dashboard/local-admin")
    } else if (isOperations) {
      router.replace("/dashboard/operations")
    } else {
      // Fallback to local admin if role not detected
      router.replace("/dashboard/local-admin")
    }
  }, [isSystemAdmin, isDistrictManager, isLocalAdmin, isOperations, authLoading, router])

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting to your dashboard...</p>
      </div>
    </div>
  )
}
