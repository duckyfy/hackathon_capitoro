"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { WalletConnectButton } from "@/components/wallet-connect-button"
import { formatSolana } from "@/lib/utils"
import { ArrowRight, Wallet, Briefcase } from "lucide-react"
import Link from "next/link"

export default function Dashboard() {
  const { supabase, user } = useSupabase()
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userData, setUserData] = useState<any>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [investments, setInvestments] = useState<any[]>([])
  const [walletAddress, setWalletAddress] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return

      try {
        // First, check if the user already exists in our database
        const { data: existingUser, error: fetchError } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .maybeSingle()

        if (fetchError) throw fetchError

        let currentUser = existingUser

        // If user doesn't exist, create a new record
        if (!currentUser) {
          console.log("No user data found, creating default user data")

          // Use upsert to avoid duplicate key errors
          const { data: newUser, error: upsertError } = await supabase
            .from("users")
            .upsert({
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || "User",
              role: "entrepreneur",
              password: "auth_managed",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .select()
            .single()

          if (upsertError) {
            console.error("Error creating user:", upsertError)
            throw upsertError
          }

          currentUser = newUser
        }

        // Set user data state
        setUserData(currentUser)
        setUserRole(currentUser.role)
        setWalletAddress(currentUser.wallet_address || null)

        // Continue with fetching projects and investments
        // Fetch all projects regardless of role
        const { data: projectsData, error: projectsError } = await supabase
          .from("projects")
          .select(`
            *,
            investments(id, amount)
          `)
          .eq("entrepreneur_id", user.id)

        if (projectsError) throw projectsError

        // Calculate totals manually
        const projectsWithTotals =
          projectsData?.map((project) => {
            const totalFunding =
              project.investments?.reduce((sum, inv) => sum + (Number.parseFloat(inv.amount) || 0), 0) || 0
            const investorCount = project.investments?.length || 0
            return {
              ...project,
              totalFunding,
              investorCount,
            }
          }) || []

        setProjects(projectsWithTotals)

        // Fetch investments
        const { data: investmentsData, error: investmentsError } = await supabase
          .from("investments")
          .select(`
            *,
            projects(*)
          `)
          .eq("investor_id", user.id)

        if (investmentsError) throw investmentsError
        setInvestments(investmentsData || [])
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [supabase, user])

  const handleWalletConnect = async (address: string) => {
    if (!user) return

    try {
      const { error } = await supabase.from("users").update({ wallet_address: address }).eq("id", user.id)

      if (error) throw error

      setWalletAddress(address)
    } catch (error) {
      console.error("Error updating wallet address:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-capitoro-purple"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {userData?.full_name}</h1>
          <p className="text-gray-400">Dashboard</p>
        </div>

        <WalletConnectButton onWalletConnect={handleWalletConnect} className="shrink-0" showBalance={false} />
      </div>

      {!walletAddress && (
        <Card className="bg-gray-900/60 backdrop-blur-sm border-gray-800">
          <CardHeader>
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>Connect your Phantom wallet to invest in projects or receive funding.</CardDescription>
          </CardHeader>
          <CardContent>
            <WalletConnectButton onWalletConnect={handleWalletConnect} />
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gray-900/60 backdrop-blur-sm border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projects.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/60 backdrop-blur-sm border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Funding Received</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatSolana(
                  projects.reduce((sum, project) => {
                    return sum + (project.totalFunding || 0)
                  }, 0),
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/60 backdrop-blur-sm border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Investments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatSolana(investments.reduce((sum, inv) => sum + inv.amount, 0))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gray-900/60 backdrop-blur-sm border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>My Projects</CardTitle>
              <CardDescription>Manage your startup projects</CardDescription>
            </div>
            <Link href="/dashboard/projects/new">
              <Button variant="outline" className="gradient-border">
                New Project
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <div className="text-center py-8">
                <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium">No projects yet</h3>
                <p className="mt-2 text-gray-400">Create your first project to start receiving investments.</p>
                <Link href="/dashboard/projects/new" className="mt-4 inline-block">
                  <Button>Create Project</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 rounded-lg bg-gray-800/50 border border-gray-700"
                  >
                    <div>
                      <h3 className="font-medium">{project.name}</h3>
                      <p className="text-sm text-gray-400">
                        {formatSolana(project.totalFunding || 0)} raised •{project.investorCount || 0} investors
                      </p>
                    </div>
                    <Link href={`/dashboard/projects/${project.id}`}>
                      <Button variant="ghost" size="sm" className="gap-1">
                        View Details
                        <ArrowRight size={16} />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gray-900/60 backdrop-blur-sm border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>My Investments</CardTitle>
              <CardDescription>Track your investments in startups</CardDescription>
            </div>
            <Link href="/dashboard/explore">
              <Button variant="outline" className="gradient-border">
                Explore Projects
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {investments.length === 0 ? (
              <div className="text-center py-8">
                <Wallet className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium">No investments yet</h3>
                <p className="mt-2 text-gray-400">Explore projects and invest in promising startups.</p>
                <Link href="/dashboard/explore" className="mt-4 inline-block">
                  <Button>Explore Projects</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {investments.map((investment) => (
                  <div
                    key={investment.id}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 rounded-lg bg-gray-800/50 border border-gray-700"
                  >
                    <div>
                      <h3 className="font-medium">{investment.projects.name}</h3>
                      <p className="text-sm text-gray-400">
                        {formatSolana(investment.amount)} invested •
                        {new Date(investment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Link href={`/dashboard/investments/${investment.id}`}>
                      <Button variant="ghost" size="sm" className="gap-1">
                        View Details
                        <ArrowRight size={16} />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
