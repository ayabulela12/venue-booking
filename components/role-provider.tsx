"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"
import type { Session } from "@supabase/supabase-js"
import type { UserRole } from "@/lib/types"
import { getSupabaseClient } from "@/lib/supabase-client"

interface RoleContextValue {
  role: UserRole
  setRole: (role: UserRole) => void
  toggleRole: () => void
  isSystemAdmin: boolean
  isDistrictManager: boolean
  isLocalAdmin: boolean
  isOperations: boolean
  isAdmin: boolean // Backward compatibility
  isOperator: boolean // Legacy demo operator role only (not local_admin)
  municipality: string | undefined
  userId: string | undefined
  isAuthenticated: boolean
  authLoading: boolean
}

const RoleContext = createContext<RoleContextValue | null>(null)

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>("local_admin")
  const [municipality, setMunicipality] = useState<string | undefined>()
  const [userId, setUserId] = useState<string | undefined>()
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
    if (metadata?.role === "admin") return "system_admin"
    if (metadata?.role === "operator") return "local_admin"

    return "local_admin"
  }, [])

  const applySession = useCallback(
    (session: Session | null) => {
      setIsAuthenticated(!!session)
      setRole(roleFromSession(session))
      const metadata = session?.user?.user_metadata as
        | Record<string, unknown>
        | undefined
      const m = metadata?.municipality
      setMunicipality(typeof m === "string" && m.length > 0 ? m : undefined)
      setUserId(session?.user?.id)
    },
    [roleFromSession]
  )

  useEffect(() => {
    let unsub: (() => void) | undefined

    async function init() {
      setAuthLoading(true)
      try {
        const { data } = await getSupabaseClient().auth.getSession()
        applySession(data.session ?? null)

        const {
          data: { subscription },
        } = getSupabaseClient().auth.onAuthStateChange((_event, session: Session | null) => {
          applySession(session)
        })

        unsub = () => subscription.unsubscribe()
      } catch (err) {
        // If Supabase env vars aren't set, keep the app usable in a "demo" mode.
        // eslint-disable-next-line no-console
        console.error(err)
        setIsAuthenticated(false)
        setRole("local_admin")
        setMunicipality(undefined)
        setUserId(undefined)
      } finally {
        setAuthLoading(false)
      }
    }

    void init()

    return () => {
      unsub?.()
    }
  }, [applySession])

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
        isOperator: role === "operator",
        municipality,
        userId,
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
