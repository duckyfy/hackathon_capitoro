"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useSupabase } from "@/lib/supabase-provider"
import Link from "next/link"
import { Eye, EyeOff, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function Login() {
  const router = useRouter()
  const { supabase } = useSupabase()
  const { toast } = useToast()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [emailNotVerified, setEmailNotVerified] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setEmailNotVerified(false)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // Check if the error is due to email not being verified
        if (error.message.includes("Email not confirmed")) {
          setEmailNotVerified(true)
          throw new Error("Your email has not been verified. Please check your inbox for the verification link.")
        }
        throw error
      }

      toast({
        title: "Login successful!",
        description: "Welcome back to Capitoro.",
      })

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resendVerificationEmail = async () => {
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      })

      if (error) throw error

      toast({
        title: "Verification email resent",
        description: "Please check your inbox for the verification link.",
      })
    } catch (error: any) {
      toast({
        title: "Failed to resend verification email",
        description: error.message || "Please try again later.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-capitoro-navy text-white">
      <Navbar />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto bg-gray-900/60 backdrop-blur-sm p-8 rounded-xl border border-gray-800">
          <h1 className="text-2xl font-bold mb-6 text-center">Log in to Capitoro</h1>

          {emailNotVerified && (
            <Alert className="bg-amber-900/20 border-amber-800 text-amber-400 mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Email Not Verified</AlertTitle>
              <AlertDescription className="space-y-2">
                <p>Your email has not been verified. Please check your inbox for the verification link.</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-amber-400 border-amber-400 hover:bg-amber-400/20"
                  onClick={resendVerificationEmail}
                >
                  Resend Verification Email
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-gray-800 border-gray-700"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-gray-800 border-gray-700"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="text-right">
              <Link href="/forgot-password" className="text-sm text-capitoro-blue hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-capitoro hover:opacity-90 transition-opacity"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log in"}
            </Button>

            <p className="text-center text-sm text-gray-400">
              Don't have an account?{" "}
              <Link href="/register" className="text-capitoro-blue hover:underline">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  )
}
