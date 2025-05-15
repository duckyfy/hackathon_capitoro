"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useSupabase } from "@/lib/supabase-provider"
import Link from "next/link"
import { Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function Register() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { supabase } = useSupabase()
  const { toast } = useToast()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)

  // Additional fields for project
  const [projectName, setProjectName] = useState("")
  const [projectDescription, setProjectDescription] = useState("")
  const [projectStatus, setProjectStatus] = useState("idea")

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Register user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (authError) throw authError

      if (authData.user) {
        // Insert user into our custom users table
        const { error: userError } = await supabase.from("users").insert({
          id: authData.user.id,
          email,
          full_name: fullName,
          password: "auth_managed", // Use a placeholder instead of empty string
        })

        if (userError) throw userError

        toast({
          title: "Registration successful!",
          description: "Your account has been created. Please check your email for verification.",
        })

        // Show verification message instead of redirecting immediately
        setRegistrationSuccess(true)
      }
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "An error occurred during registration",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-capitoro-navy text-white">
        <Navbar />

        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto bg-gray-900/60 backdrop-blur-sm p-8 rounded-xl border border-gray-800">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="text-green-500" size={32} />
              </div>
              <h1 className="text-2xl font-bold mb-4">Registration Successful!</h1>
              <p className="text-gray-300 mb-6">
                We've sent a verification email to <span className="font-medium text-white">{email}</span>. Please check
                your inbox and click the verification link to activate your account.
              </p>
              <Alert className="bg-blue-900/20 border-blue-800 text-blue-400 mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>You must verify your email before you can log in to your account.</AlertDescription>
              </Alert>
              <div className="space-y-4">
                <Button
                  onClick={() => router.push("/login")}
                  className="bg-gradient-capitoro hover:opacity-90 transition-opacity"
                >
                  Go to Login
                </Button>
                <p className="text-sm text-gray-400">
                  Didn't receive the email? Check your spam folder or{" "}
                  <button
                    className="text-capitoro-blue hover:underline"
                    onClick={async () => {
                      try {
                        await supabase.auth.resend({
                          type: "signup",
                          email,
                        })
                        toast({
                          title: "Verification email resent",
                          description: "Please check your inbox for the verification link.",
                        })
                      } catch (error) {
                        toast({
                          title: "Failed to resend verification email",
                          description: "Please try again later.",
                          variant: "destructive",
                        })
                      }
                    }}
                  >
                    click here to resend
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-capitoro-navy text-white">
      <Navbar />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto bg-gray-900/60 backdrop-blur-sm p-8 rounded-xl border border-gray-800">
          <h1 className="text-2xl font-bold mb-6 text-center">Create Your Capitoro Account</h1>

          <form onSubmit={handleRegister}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="bg-gray-800 border-gray-700"
                />
              </div>

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

              <Alert className="bg-blue-900/20 border-blue-800 text-blue-400">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Email Verification Required</AlertTitle>
                <AlertDescription>
                  After registration, you'll need to verify your email address before you can log in.
                </AlertDescription>
              </Alert>

              <div className="border-t border-gray-800 pt-4 mt-4">
                <p className="text-sm text-gray-400 mb-4">
                  Want to create a project? You can do this from your dashboard after registration.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-capitoro hover:opacity-90 transition-opacity"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </Button>

              <p className="text-center text-sm text-gray-400">
                Already have an account?{" "}
                <Link href="/login" className="text-capitoro-blue hover:underline">
                  Log in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  )
}
