"use client"

import { useState } from "react"
import type { FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { getSupabaseClient } from "@/lib/supabase-client"
import { Building2, MapPin, Shield, Users, CheckCircle, Lock, Mail, ArrowLeft } from "lucide-react"

export default function ManualLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

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
        setErrorMessage(error.message)
        toast.error(error.message)
        return
      }

      toast.success("Signed in successfully")
      router.replace("/dashboard")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign-in failed"
      setErrorMessage(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen overflow-hidden flex bg-gray-50">
      {/* Left Sidebar - City Background with Dark Green Overlay */}
      <div className="w-1/2 relative overflow-hidden hidden lg:block">
        {/* City Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=1920&h=1080&fit=crop)',
          }}
        />
        
        {/* Dark Green Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/90 to-green-800/80" />
        
        {/* Content Overlay */}
        <div className="relative z-10 px-8 py-6 text-white flex flex-col justify-center h-full xl:px-10 xl:py-8">
          <div className="space-y-6">
            {/* Logo/Title */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Building2 className="h-8 w-8 text-green-300 xl:h-10 xl:w-10" />
                <h1 className="text-3xl font-bold xl:text-4xl">Venue Operations System</h1>
              </div>
              <p className="text-lg text-green-100 xl:text-xl">
                Smart municipal venue management for modern cities
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-green-100">City Operations</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-green-300 flex-shrink-0" />
                  <span className="text-green-50">Multi-district coordination</span>
                </div>
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-green-300 flex-shrink-0" />
                  <span className="text-green-50">Centralized venue management</span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-green-300 flex-shrink-0" />
                  <span className="text-green-50">Emergency services coordination</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-green-300 flex-shrink-0" />
                  <span className="text-green-50">Inter-department collaboration</span>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-green-100">Trusted By Municipalities</h3>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 bg-green-800/50 px-3 py-2 rounded-full">
                  <CheckCircle className="h-4 w-4 text-green-300" />
                  <span className="text-sm text-green-100">City Administrations</span>
                </div>
                <div className="flex items-center gap-2 bg-green-800/50 px-3 py-2 rounded-full">
                  <CheckCircle className="h-4 w-4 text-green-300" />
                  <span className="text-sm text-green-100">District Managers</span>
                </div>
                <div className="flex items-center gap-2 bg-green-800/50 px-3 py-2 rounded-full">
                  <CheckCircle className="h-4 w-4 text-green-300" />
                  <span className="text-sm text-green-100">Emergency Services</span>
                </div>
              </div>
            </div>

            {/* Footer Info */}
            <div className="pt-3 border-t border-green-700/50">
              <p className="text-sm text-green-200">
                Urban Excellence • 24/7 System Availability • Secure Data Management
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Login Form */}
      <div className="w-full lg:w-1/2 bg-white px-6 py-5 sm:px-8 lg:px-10 lg:py-6 flex items-center justify-center">
        <div className="w-full max-w-md space-y-5">
          {/* Back to Role Selection */}
          <div className="flex items-center gap-2">
            <Link href="/login" className="flex items-center gap-2 text-green-700 hover:text-green-800 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Back to role selection</span>
            </Link>
          </div>

          {/* Sign In Form */}
          <div className="space-y-5">
            <div className="text-center space-y-1.5">
              <h2 className="text-2xl font-bold text-gray-900 lg:text-3xl">Sign In</h2>
              <p className="text-gray-600">Enter your credentials to access the system</p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errorMessage}</p>
              </div>
            )}

            <form className="space-y-4" onSubmit={onSubmit}>
              {/* Email Input */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="pl-10 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="pl-10 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="remember" 
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember" className="text-sm text-gray-600">Remember me</Label>
              </div>

              {/* Sign In Button */}
              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full h-12 bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900 text-white font-medium transition-all duration-200"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Additional Links */}
            <div className="space-y-3">
              <div className="text-center">
                <Link href="#" className="text-green-700 hover:text-green-800 text-sm font-medium transition-colors">
                  Forgot your password?
                </Link>
              </div>
              
              <div className="text-center text-sm text-gray-600">
                Don't have an account?{" "}
                <div className="flex gap-2 justify-center mt-2">
                  <Link href="/signup" className="text-green-700 hover:text-green-800 font-medium transition-colors">
                    Create operator account
                  </Link>
                  <span className="text-gray-400">or</span>
                  <Link href="/admin-signup" className="text-green-700 hover:text-green-800 font-medium transition-colors">
                    Create admin account
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
