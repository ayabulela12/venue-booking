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
  isAdmin: boolean
  isOperator: boolean
  isAuthenticated: boolean
  authLoading: boolean
}

const RoleContext = createContext<RoleContextValue | null>(null)

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>("operator")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)

  const roleFromSession = useCallback((session: Session | null): UserRole => {
    if (!session?.user) return "operator"
    
    // For now, fall back to user_metadata for immediate compatibility
    // TODO: Once all users have profiles, switch to profiles table lookup
    const metadata = session?.user?.user_metadata as Record<string, unknown> | undefined
    if (metadata?.role === "admin") return "admin"
    return "operator"
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
        setRole("operator")
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
    setRole((prev) => (prev === "admin" ? "operator" : "admin"))
  }, [isAuthenticated])

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        toggleRole,
        isAdmin: role === "admin",
        isOperator: role === "operator",
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
