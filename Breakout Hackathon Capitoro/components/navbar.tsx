"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { useSupabase } from "@/lib/supabase-provider"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { useState } from "react"

export function Navbar() {
  const { user } = useSupabase()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isLandingPage = pathname === "/"
  const navbarClass = isLandingPage ? "absolute top-0 left-0 right-0 z-10" : "bg-capitoro-navy border-b border-gray-800"

  return (
    <header className={`${navbarClass} w-full`}>
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Logo />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
            About
          </Link>
          <Link href="/projects" className="text-gray-300 hover:text-white transition-colors">
            Projects
          </Link>

          {user ? (
            <Link href="/dashboard">
              <Button variant="outline" className="gradient-border">
                Dashboard
              </Button>
            </Link>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-capitoro hover:opacity-90 transition-opacity">Register</Button>
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-capitoro-navy/95 overflow-y-auto">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4 pt-20">
            <Link
              href="/about"
              className="text-gray-300 hover:text-white transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/projects"
              className="text-gray-300 hover:text-white transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Projects
            </Link>

            {user ? (
              <Link href="/dashboard" className="py-2" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full gradient-border">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login" className="py-2" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link href="/register" className="py-2" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-gradient-capitoro hover:opacity-90 transition-opacity">Register</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
