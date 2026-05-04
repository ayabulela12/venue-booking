"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"
import type { Session } from "@supabase/supabase-js"
import type { UserRole } from "@/lib/types"
import { createClient } from "@supabase/supabase-js"

// Use shared client instance to maintain auth session
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface RoleContextValue {
  role: UserRole
  setRole: (role: UserRole) => void
  toggleRole: () => void
  isSystemAdmin: boolean
  isDistrictManager: boolean
  isLocalAdmin: boolean
  isOperations: boolean
  isAdmin: boolean // Backward compatibility
  isOperator: boolean // Backward compatibility
  isAuthenticated: boolean
  authLoading: boolean
}

const RoleContext = createContext<RoleContextValue | null>(null)

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>("local_admin")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)

  const roleFromSession = useCallback((session: Session | null): UserRole => {
    if (!session?.user) return "local_admin"
    
    const metadata = session?.user?.user_metadata as Record<string, unknown> | undefined
    
    // New hierarchical roles (priority)
    if (metadata?.role === "system_admin") return "system_admin"
    if (metadata?.role === "district_manager") return "district_manager"
    if (metadata?.role === "local_admin") return "local_admin"
    if (metadata?.role === "operations") return "operations"
    
    // Backward compatibility mapping
    if (metadata?.role === "admin") return "system_admin"      // Existing admin → System Admin
    if (metadata?.role === "operator") return "local_admin"    // Existing operator → Local Admin
    
    return "local_admin"
  }, [])

  useEffect(() => {
    let unsub: (() => void) | undefined

    async function init() {
      setAuthLoading(true)
      try {
        const { data } = await supabase.auth.getSession()
        setIsAuthenticated(!!data.session)
        setRole(roleFromSession(data.session ?? null))

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session: Session | null) => {
          setIsAuthenticated(!!session)
          setRole(roleFromSession(session))
        })

        unsub = () => subscription.unsubscribe()
      } catch (err) {
        // If Supabase env vars aren't set, keep the app usable in a "demo" mode.
        // eslint-disable-next-line no-console
        console.error(err)
        setIsAuthenticated(false)
        setRole("local_admin")
      } finally {
        setAuthLoading(false)
      }
    }

    void init()

    return () => {
      unsub?.()
    }
  }, [roleFromSession])

  const toggleRole = useCallback(() => {
    if (isAuthenticated) return
    setRole((prev) => (prev === "system_admin" ? "local_admin" : "system_admin"))
  }, [isAuthenticated])

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        toggleRole,
        isSystemAdmin: role === "system_admin",
        isDistrictManager: role === "district_manager",
        isLocalAdmin: role === "local_admin",
        isOperations: role === "operations",
        isAdmin: role === "system_admin", // Backward compatibility
        isOperator: role === "local_admin", // Backward compatibility
        isAuthenticated,
        authLoading,
      }}
    >
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  const ctx = useContext(RoleContext)
  if (!ctx) throw new Error("useRole must be used within RoleProvider")
  return ctx
}
