"use client"

import React, { useEffect, useState } from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { usePathname, useRouter } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { useRole } from "@/components/role-provider"
import { NotificationCard } from "@/components/ui/notification-card"

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/system-admin": "System Admin Dashboard",
  "/dashboard/district-manager": "District Manager Dashboard", 
  "/dashboard/local-admin": "Local Admin Dashboard",
  "/dashboard/operations": "Operations Dashboard",
  "/venues": "Venue Management",
  "/bookings": "Booking Management",
  "/calendar": "Master Calendar",
  "/logs": "System Logs",
}

// Notification context
const NotificationContext = React.createContext<{
  notifications: Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message: string
  }>
  showNotification: (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => void
  removeNotification: (id: string) => void
}>({
  notifications: [],
  showNotification: () => {},
  removeNotification: () => {}
})

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const pageTitle = pageTitles[pathname] || "MetroMatrix"
  const router = useRouter()
  const { isAuthenticated, authLoading } = useRole()
  const [notifications, setNotifications] = useState<Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message: string
  }>>([])

  const showNotification = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    setNotifications(prev => [...prev, { id, type, title, message }])
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login")
    }
  }, [authLoading, isAuthenticated, router])

  if (authLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  if (!isAuthenticated) {
    return <div className="flex h-screen items-center justify-center">Redirecting...</div>
  }

  return (
    <NotificationContext.Provider value={{ notifications, showNotification, removeNotification }}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-sm font-medium">
                    {pageTitle}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
      
      {/* Notification Container - Client Side Only */}
      {typeof window !== 'undefined' && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              {...notification}
              onClose={removeNotification}
            />
          ))}
        </div>
      )}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => {
  const context = React.useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within DashboardLayout')
  }
  return context
}
