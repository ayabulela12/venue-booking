"use client"

import { useState } from "react"
import type { FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { getSupabaseClient } from "@/lib/supabase-client"
import { getRoleCredentials, validateRoleCredentials, getRoleDisplayName } from "@/lib/role-credentials"
import type { UserRole } from "@/lib/types"
import { Building2, Factory, Landmark, ShieldCheck, User } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<UserRole | "">("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const roleOptions: Array<{
    role: UserRole
    title: string
    description: string
    icon: typeof ShieldCheck
  }> = [
    {
      role: "system_admin",
      title: "System Admin",
      description: "Full system control and district oversight",
      icon: ShieldCheck,
    },
    {
      role: "district_manager",
      title: "District Manager",
      description: "Manage operations and performance in a district",
      icon: Landmark,
    },
    {
      role: "local_admin",
      title: "Local Admin",
      description: "Handle venue bookings and local coordination",
      icon: User,
    },
    {
      role: "operations",
      title: "Operations",
      description: "Monitor events and departmental resources",
      icon: Factory,
    },
  ]

  // Role-based login function
  async function loginAsRole(role: UserRole) {
    if (!validateRoleCredentials(role)) {
      const displayName = getRoleDisplayName(role)
      toast.error(`${displayName} credentials not configured. Please contact administrator.`)
      return
    }

    setLoading(true)
    setErrorMessage(null)

    try {
      const credentials = getRoleCredentials(role)
      const supabase = getSupabaseClient()
      
      const { error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (error) {
        setErrorMessage(error.message)
        toast.error(`Login failed for ${role.replace('_', ' ')}`)
        return
      }

      const displayName = getRoleDisplayName(role)
      toast.success(`Signed in successfully as ${displayName}`)
      router.replace("/dashboard")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign-in failed"
      setErrorMessage(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null)

    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error(error.message)
        setErrorMessage(error.message)
        return
      }

      toast.success(`Signed in successfully`)
      router.replace("/dashboard")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign-in failed"
      toast.error(message)
      setErrorMessage(message)
    } finally {
      setLoading(false)
    }
  }

  function handleRoleLogin() {
    if (selectedRole) {
      loginAsRole(selectedRole)
    }
  }

  return (
    <div className="grid min-h-screen overflow-hidden bg-white md:grid-cols-[1.05fr_1.3fr]">
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 px-10 py-12 text-white md:flex md:flex-col">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(16,185,129,0.26),transparent_45%)]" />
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-emerald-400/50 bg-emerald-500/10 p-2.5">
                  <Building2 className="h-8 w-8 text-emerald-300" />
                </div>
                <div>
                  <p className="text-3xl font-bold leading-tight">Venue Operations</p>
                  <p className="text-3xl font-bold leading-tight text-emerald-300">System</p>
                </div>
              </div>
              <div className="space-y-4">
                <h2 className="max-w-md text-4xl font-semibold leading-tight">
                  The Operating System for <span className="text-emerald-300">Municipal Venues</span>
                </h2>
                <p className="max-w-md text-base text-emerald-50/90">
                  Streamline bookings, automate risk checks, and coordinate city services in one intelligent platform.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-900/30 p-3">
                  <p className="font-medium text-emerald-200">Smart Bookings</p>
                  <p className="mt-1 text-emerald-100/80">Fast venue and event management</p>
                </div>
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-900/30 p-3">
                  <p className="font-medium text-emerald-200">Risk Intelligence</p>
                  <p className="mt-1 text-emerald-100/80">Role-based controls and compliance</p>
                </div>
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-900/30 p-3">
                  <p className="font-medium text-emerald-200">Service Coordination</p>
                  <p className="mt-1 text-emerald-100/80">Cross-department collaboration</p>
                </div>
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-900/30 p-3">
                  <p className="font-medium text-emerald-200">Insights</p>
                  <p className="mt-1 text-emerald-100/80">Real-time dashboards and reports</p>
                </div>
              </div>
            </div>
            <p className="relative z-10 text-sm text-emerald-100/80">Built for municipalities and smart city operations.</p>
          </div>
      </aside>

      <section className="flex items-center justify-center bg-[#f7faf8] p-4 sm:p-8">
        <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-slate-900">Welcome back</h1>
              <p className="mt-1 text-sm text-slate-600">Select your role to continue</p>
            </div>

            {errorMessage && (
              <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>
            )}

            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-800">Quick Role Access</p>
              <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {roleOptions.map((item) => {
                  const Icon = item.icon
                  const disabled = !validateRoleCredentials(item.role)
                  const active = selectedRole === item.role
                  return (
                    <button
                      key={item.role}
                      type="button"
                      disabled={loading || disabled}
                      onClick={() => setSelectedRole(item.role)}
                      className={`rounded-xl border p-3 text-left transition ${
                        active
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-slate-200 bg-white hover:border-emerald-300"
                      } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
                    >
                      <Icon className="mb-3 h-5 w-5 text-emerald-700" />
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-600">{item.description}</p>
                    </button>
                  )
                })}
              </div>

              {selectedRole && (
                <div className="mt-3 rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
                  You are entering as: <span className="font-semibold">{getRoleDisplayName(selectedRole)}</span>
                </div>
              )}

              <Button
                onClick={handleRoleLogin}
                disabled={loading || !selectedRole}
                className="mt-4 h-11 w-full bg-emerald-700 text-white hover:bg-emerald-800"
              >
                {loading ? "Signing in..." : `Login as ${selectedRole ? getRoleDisplayName(selectedRole) : "Role"}`}
              </Button>
            </div>

            <div className="my-5 flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs font-medium uppercase text-slate-400">or</span>
              <Separator className="flex-1" />
            </div>

            <form className="space-y-4" onSubmit={onSubmit}>
              <h2 className="text-base font-semibold text-slate-900">Manual Login</h2>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="h-11"
                placeholder="Email address"
              />
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="h-11"
                placeholder="Password"
              />
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-slate-600">
                  <Checkbox
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(Boolean(checked))}
                    disabled={loading}
                  />
                  Remember me
                </label>
                <Link href="#" className="text-emerald-700 hover:text-emerald-800">
                  Forgot password?
                </Link>
              </div>
              <Button type="submit" disabled={loading} variant="outline" className="h-11 w-full border-emerald-300 text-emerald-800 hover:bg-emerald-50">
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-600">
              New here?{" "}
              <Link href="/signup" className="font-medium text-emerald-700 hover:text-emerald-800">
                Create operator account
              </Link>{" "}
              or{" "}
              <Link href="/admin-signup" className="font-medium text-emerald-700 hover:text-emerald-800">
                create admin account
              </Link>
            </p>
        </div>
      </section>
    </div>
  )
}

