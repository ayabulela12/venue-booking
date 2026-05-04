"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Building2,
  CalendarDays,
  Ticket,
  FileText,
  Shield,
  User,
  LogOut,
  MapPin,
  Building,
  Users,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { useRole } from "@/components/role-provider"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { UserRole } from "@/lib/types"
import { createClient } from "@supabase/supabase-js"
import { toast } from "sonner"

// Use shared client to maintain auth session
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["system_admin", "district_manager", "local_admin", "operations"] as UserRole[],
  },
  {
    title: "User Management",
    href: "/users",
    icon: Users,
    roles: ["system_admin", "district_manager"] as UserRole[],
  },
  {
    title: "Venues",
    href: "/venues",
    icon: Building2,
    roles: ["system_admin", "district_manager", "local_admin"] as UserRole[],
  },
  {
    title: "Bookings",
    href: "/bookings",
    icon: Ticket,
    roles: ["system_admin", "district_manager", "local_admin", "operations"] as UserRole[],
  },
  {
    title: "Operations",
    href: "/dashboard/operations",
    icon: Shield,
    roles: ["system_admin", "district_manager", "operations"] as UserRole[],
  },
  {
    title: "Calendar",
    href: "/calendar",
    icon: CalendarDays,
    roles: ["system_admin", "district_manager", "local_admin", "operations"] as UserRole[],
  },
  {
    title: "System Logs",
    href: "/logs",
    icon: FileText,
    roles: ["system_admin"] as UserRole[],
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { role, toggleRole, isSystemAdmin, isDistrictManager, isLocalAdmin, isOperations, isAuthenticated } = useRole()
  const [loggingOut, setLoggingOut] = useState(false)

  const visibleItems = navItems.filter((item) =>
    item.roles.includes(role)
  )

  async function handleLogout() {
    setLoggingOut(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        toast.error(error.message)
        return
      }
      toast.success("Signed out successfully")
      router.replace("/login")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Logout failed"
      toast.error(message)
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-2.5 group-data-[collapsible=icon]:justify-center">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground font-mono text-sm font-bold">
            M
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">
              Venue Operations
            </span>
            <span className="text-[10px] text-sidebar-foreground/50 uppercase tracking-widest">
              Municipal Services
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        {isAuthenticated ? (
          <div className="flex w-full flex-col gap-2">
            <div
              className={cn(
                "flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-sm",
                "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
              )}
            >
              {isSystemAdmin ? (
                <Shield className="h-4 w-4 shrink-0 text-sidebar-primary" />
              ) : isDistrictManager ? (
                <MapPin className="h-4 w-4 shrink-0 text-blue-400" />
              ) : isLocalAdmin ? (
                <Building className="h-4 w-4 shrink-0 text-emerald-400" />
              ) : (
                <Users className="h-4 w-4 shrink-0 text-orange-400" />
              )}
              <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
                <span className="text-sidebar-foreground/80">
                  Signed in as {role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] px-1.5 py-0",
                    isSystemAdmin
                      ? "border-sidebar-primary/40 text-sidebar-primary"
                      : isDistrictManager
                      ? "border-blue-400/40 text-blue-400"
                      : isLocalAdmin
                      ? "border-emerald-400/40 text-emerald-400"
                      : "border-orange-400/40 text-orange-400"
                  )}
                >
                  Active
                </Badge>
              </div>
            </div>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-sm transition-colors",
                "hover:bg-sidebar-accent",
                "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0",
                loggingOut && "opacity-70 cursor-not-allowed"
              )}
            >
              <LogOut className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
                <span className="text-sidebar-foreground/80">Logout</span>
              </div>
            </button>
          </div>
        ) : (
          <button
            onClick={toggleRole}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-sm transition-colors",
              "hover:bg-sidebar-accent",
              "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
            )}
          >
            {isSystemAdmin ? (
              <Shield className="h-4 w-4 shrink-0 text-sidebar-primary" />
            ) : isDistrictManager ? (
              <MapPin className="h-4 w-4 shrink-0 text-blue-400" />
            ) : isLocalAdmin ? (
              <Building className="h-4 w-4 shrink-0 text-emerald-400" />
            ) : (
              <Users className="h-4 w-4 shrink-0 text-orange-400" />
            )}
            <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
              <span className="text-sidebar-foreground/80">
                {role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] px-1.5 py-0",
                  isSystemAdmin
                    ? "border-sidebar-primary/40 text-sidebar-primary"
                    : isDistrictManager
                    ? "border-blue-400/40 text-blue-400"
                    : isLocalAdmin
                    ? "border-emerald-400/40 text-emerald-400"
                    : "border-orange-400/40 text-orange-400"
                )}
              >
                Switch
              </Badge>
            </div>
          </button>
        )}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
