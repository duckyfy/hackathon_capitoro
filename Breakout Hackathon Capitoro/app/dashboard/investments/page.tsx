"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatSolana } from "@/lib/utils"
import { ArrowRight, Wallet } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default function InvestmentsPage() {
  const { supabase, user } = useSupabase()
  const [loading, setLoading] = useState(true)
  const [investments, setInvestments] = useState<any[]>([])

  useEffect(() => {
    const fetchInvestments = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from("investments")
          .select(`
            *,
            projects(*)
          `)
          .eq("investor_id", user.id)
          .order("created_at", { ascending: false })

        if (error) throw error
        setInvestments(data || [])
      } catch (error) {
        console.error("Error fetching investments:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchInvestments()
  }, [supabase, user])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "idea":
        return "bg-blue-500/20 text-blue-500"
      case "prototype":
        return "bg-purple-500/20 text-purple-500"
      case "mvp":
        return "bg-yellow-500/20 text-yellow-500"
      case "growth":
        return "bg-green-500/20 text-green-500"
      case "scaling":
        return "bg-teal-500/20 text-teal-500"
      default:
        return "bg-gray-500/20 text-gray-500"
    }
  }

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
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
          <h1 className="text-3xl font-bold">My Investments</h1>
          <p className="text-gray-400">Track your investments in startups</p>
        </div>

        <Link href="/dashboard/explore">
          <Button className="bg-gradient-capitoro hover:opacity-90 transition-opacity">Explore Projects</Button>
        </Link>
      </div>

      {investments.length === 0 ? (
        <Card className="bg-gray-900/60 backdrop-blur-sm border-gray-800">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Wallet className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium mb-2">No investments yet</h3>
            <p className="text-gray-400 text-center max-w-md mb-6">
              You haven't invested in any projects yet. Explore projects and invest in promising startups.
            </p>
            <Link href="/dashboard/explore">
              <Button className="bg-gradient-capitoro hover:opacity-90 transition-opacity">Explore Projects</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {investments.map((investment) => (
            <Card key={investment.id} className="bg-gray-900/60 backdrop-blur-sm border-gray-800">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{investment.projects.name}</CardTitle>
                  <Badge className={getStatusColor(investment.projects.status)}>
                    {formatStatus(investment.projects.status)}
                  </Badge>
                </div>
                <CardDescription>Invested on {new Date(investment.created_at).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-300 line-clamp-3">{investment.projects.description}</p>

                <div className="flex justify-between items-center">
                  <Badge
                    variant="outline"
                    className="bg-capitoro-purple/10 text-capitoro-purple border-capitoro-purple/20"
                  >
                    {formatSolana(investment.amount)}
                  </Badge>
                  <Link href={`/dashboard/projects/${investment.projects.id}`}>
                    <Button variant="ghost" size="sm" className="gap-1">
                      View Project
                      <ArrowRight size={16} />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
