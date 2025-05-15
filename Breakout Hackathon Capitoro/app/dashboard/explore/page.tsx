"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatSolana } from "@/lib/utils"
import { ArrowRight, Search } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { InvestmentModal } from "@/components/investment-modal"

export default function ExplorePage() {
  const { supabase } = useSupabase()
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [showInvestModal, setShowInvestModal] = useState(false)

  const handleInvestmentComplete = async () => {
    // Refetch projects data to update the UI
    await fetchProjects()
  }

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select(`
        *,
        users!projects_entrepreneur_id_fkey(full_name, wallet_address),
        investments(id, amount)
      `)
        .order("created_at", { ascending: false })

      if (error) throw error

      // Calculate totals manually
      const projectsWithTotals =
        data?.map((project) => {
          const totalFunding =
            project.investments?.reduce((sum, inv) => sum + (Number.parseFloat(inv.amount) || 0), 0) || 0
          const investorCount = project.investments?.length || 0
          return {
            ...project,
            totalFunding,
            investorCount,
            entrepreneur_wallet_address: project.users.wallet_address,
          }
        }) || []

      setProjects(projectsWithTotals)
    } catch (error) {
      console.error("Error fetching projects:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [supabase])

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

  const calculateProgress = (project: any) => {
    const received = project.totalFunding || 0
    const goal = project.funding_goal || 1
    return Math.min(Math.round((received / goal) * 100), 100)
  }

  const categories = Array.from(new Set(projects.map((p) => p.category).filter(Boolean)))

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      searchQuery === "" ||
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = selectedCategory === null || project.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-capitoro-purple"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Explore Projects</h1>
        <p className="text-gray-400">Discover and invest in promising startups</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700"
          />
        </div>

        <select
          value={selectedCategory || ""}
          onChange={(e) => setSelectedCategory(e.target.value || null)}
          className="md:w-48 rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {filteredProjects.length === 0 ? (
        <Card className="bg-gray-900/60 backdrop-blur-sm border-gray-800">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Search className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium mb-2">No projects found</h3>
            <p className="text-gray-400 text-center max-w-md">
              No projects match your search criteria. Try adjusting your filters or check back later.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="bg-gray-900/60 backdrop-blur-sm border-gray-800">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <Badge className={getStatusColor(project.status)}>{formatStatus(project.status)}</Badge>
                </div>
                <CardDescription>By {project.users.full_name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-300 line-clamp-3">{project.description}</p>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>{formatSolana(project.totalFunding || 0)} raised</span>
                    <span>{calculateProgress(project)}%</span>
                  </div>
                  <Progress value={calculateProgress(project)} className="h-1" />
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    <span className="text-gray-400">{project.investorCount || 0} investors</span>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/dashboard/projects/${project.id}`}>
                      <Button variant="ghost" size="sm" className="gap-1">
                        View
                        <ArrowRight size={16} />
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      className="bg-gradient-capitoro hover:opacity-90 transition-opacity"
                      onClick={() => {
                        setSelectedProject(project)
                        setShowInvestModal(true)
                      }}
                    >
                      Invest
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <InvestmentModal
        isOpen={showInvestModal}
        onClose={() => setShowInvestModal(false)}
        project={selectedProject}
        onInvestmentComplete={handleInvestmentComplete}
      />
    </div>
  )
}
