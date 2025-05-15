"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatSolana } from "@/lib/utils"
import { ArrowRight, Search, Filter, ExternalLink } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { InvestmentModal } from "@/components/investment-modal"

export default function ProjectsPage() {
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
        investments(id, amount, transaction_hash)
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

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case "fintech":
        return "bg-green-500/20 text-green-500"
      case "healthtech":
        return "bg-red-500/20 text-red-500"
      case "edtech":
        return "bg-blue-500/20 text-blue-500"
      case "ecommerce":
        return "bg-yellow-500/20 text-yellow-500"
      case "saas":
        return "bg-purple-500/20 text-purple-500"
      case "ai":
        return "bg-indigo-500/20 text-indigo-500"
      case "blockchain":
        return "bg-teal-500/20 text-teal-500"
      case "gaming":
        return "bg-pink-500/20 text-pink-500"
      case "social":
        return "bg-orange-500/20 text-orange-500"
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
      <div className="min-h-screen bg-capitoro-navy text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-24">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-capitoro-purple"></div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-capitoro-navy text-white">
      <Navbar />

      <div className="container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4">Explore Projects</h1>
            <p className="text-xl text-gray-300">Discover innovative student-led startups seeking investment</p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-400" />
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
                <Card key={project.id} className="bg-gray-900/60 backdrop-blur-sm border-gray-800 h-full flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <Badge className={getStatusColor(project.status)}>{formatStatus(project.status)}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <CardDescription>By {project.users.full_name}</CardDescription>
                      {project.category && (
                        <Badge className={getCategoryColor(project.category)}>{project.category}</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 flex-1 flex flex-col">
                    <p className="text-sm text-gray-300 line-clamp-3 flex-1">{project.description}</p>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>{formatSolana(project.totalFunding || 0)} raised</span>
                        <span>{calculateProgress(project)}%</span>
                      </div>
                      <Progress value={calculateProgress(project)} className="h-1" />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="p-2 rounded bg-gray-800/50 border border-gray-700">
                        <p className="text-xs text-gray-400">Investors</p>
                        <p className="font-medium">{project.investorCount || 0}</p>
                      </div>
                      <div className="p-2 rounded bg-gray-800/50 border border-gray-700">
                        <p className="text-xs text-gray-400">Timeline</p>
                        <p className="font-medium">{project.timeline || "3 months"}</p>
                      </div>
                    </div>

                    {project.investments && project.investments.length > 0 && (
                      <div className="p-2 rounded bg-gray-800/50 border border-gray-700 text-sm">
                        <p className="text-xs text-gray-400 mb-1">Latest Transaction</p>
                        <div className="flex items-center justify-between">
                          <p className="font-medium truncate">{formatSolana(project.investments[0].amount)}</p>
                          {project.investments[0].transaction_hash && (
                            <a
                              href={`https://explorer.solana.com/tx/${project.investments[0].transaction_hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-capitoro-blue hover:text-capitoro-purple transition-colors"
                            >
                              <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center mt-auto pt-4">
                      <Link href={`/dashboard/projects/${project.id}`}>
                        <Button variant="ghost" size="sm" className="gap-1">
                          View Details
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
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
      <InvestmentModal
        isOpen={showInvestModal}
        onClose={() => setShowInvestModal(false)}
        project={selectedProject}
        onInvestmentComplete={handleInvestmentComplete}
      />
    </div>
  )
}
