"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useSupabase } from "@/lib/supabase-provider"
import { LayoutDashboard, Briefcase, Settings, Wallet, PlusCircle } from "lucide-react"
import { useState, useEffect } from "react"

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { user, supabase } = useSupabase()
  const [userRole, setUserRole] = useState<string | null>(null)

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) return

      try {
        // Use maybeSingle() instead of single() to avoid errors when no rows are found
        const { data, error } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle()

        if (error) throw error

        // Check if data exists before setting the role
        if (data) {
          setUserRole(data.role)
        } else {
          console.log("No user data found for ID:", user.id)
          // Set a default role or handle the case when no user data is found
          setUserRole("entrepreneur")
        }
      } catch (error) {
        console.error("Error fetching user role:", error)
        // Set a default role in case of error
        setUserRole("entrepreneur")
      } finally {
        setLoading(false)
      }
    }

    fetchUserRole()
  }, [user, supabase])

  if (loading) {
    return (
      <div className={cn("bg-gray-900/60 backdrop-blur-sm rounded-xl border border-gray-800 p-4", className)}>
        <div className="space-y-4">
          <div className="h-8 bg-gray-800 rounded animate-pulse"></div>
          <div className="h-8 bg-gray-800 rounded animate-pulse"></div>
          <div className="h-8 bg-gray-800 rounded animate-pulse"></div>
        </div>
      </div>
    )
  }

  const isEntrepreneur = userRole === "entrepreneur"
  const isInvestor = userRole === "investor"

  return (
    <div className={cn("bg-gray-900/60 backdrop-blur-sm rounded-xl border border-gray-800 p-4", className)}>
      <nav className="space-y-2">
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
            pathname === "/dashboard"
              ? "bg-capitoro-purple/20 text-capitoro-purple"
              : "text-gray-400 hover:text-white hover:bg-gray-800",
          )}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </Link>

        <Link
          href="/dashboard/projects"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
            pathname.startsWith("/dashboard/projects")
              ? "bg-capitoro-blue/20 text-capitoro-blue"
              : "text-gray-400 hover:text-white hover:bg-gray-800",
          )}
        >
          <Briefcase size={18} />
          <span>My Projects</span>
        </Link>

        <Link
          href="/dashboard/projects/new"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
            pathname === "/dashboard/projects/new"
              ? "bg-capitoro-green/20 text-capitoro-green"
              : "text-gray-400 hover:text-white hover:bg-gray-800",
          )}
        >
          <PlusCircle size={18} />
          <span>New Project</span>
        </Link>

        <Link
          href="/dashboard/investments"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
            pathname.startsWith("/dashboard/investments")
              ? "bg-capitoro-blue/20 text-capitoro-blue"
              : "text-gray-400 hover:text-white hover:bg-gray-800",
          )}
        >
          <Briefcase size={18} />
          <span>My Investments</span>
        </Link>

        <Link
          href="/dashboard/explore"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
            pathname === "/dashboard/explore"
              ? "bg-capitoro-green/20 text-capitoro-green"
              : "text-gray-400 hover:text-white hover:bg-gray-800",
          )}
        >
          <PlusCircle size={18} />
          <span>Explore Projects</span>
        </Link>

        <Link
          href="/dashboard/wallet"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
            pathname === "/dashboard/wallet"
              ? "bg-capitoro-teal/20 text-capitoro-teal"
              : "text-gray-400 hover:text-white hover:bg-gray-800",
          )}
        >
          <Wallet size={18} />
          <span>Wallet</span>
        </Link>

        <Link
          href="/dashboard/profile"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
            pathname === "/dashboard/profile"
              ? "bg-capitoro-purple/20 text-capitoro-purple"
              : "text-gray-400 hover:text-white hover:bg-gray-800",
          )}
        >
          <Settings size={18} />
          <span>Profile</span>
        </Link>
      </nav>
    </div>
  )
}
