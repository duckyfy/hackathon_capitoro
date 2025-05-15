"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatSolana } from "@/lib/utils"
import { ArrowRight, Briefcase, PlusCircle } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default function ProjectsPage() {
  const { supabase, user } = useSupabase()
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<any[]>([])

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from("projects")
          .select(`
            *,
            investments(id, amount)
          `)
          .eq("entrepreneur_id", user.id)

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
            }
          }) || []

        setProjects(projectsWithTotals)
      } catch (error) {
        console.error("Error fetching projects:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
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
          <h1 className="text-3xl font-bold">My Projects</h1>
          <p className="text-gray-400">Manage your startup projects</p>
        </div>

        <Link href="/dashboard/projects/new">
          <Button className="bg-gradient-capitoro hover:opacity-90 transition-opacity">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <Card className="bg-gray-900/60 backdrop-blur-sm border-gray-800">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Briefcase className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium mb-2">No projects yet</h3>
            <p className="text-gray-400 text-center max-w-md mb-6">
              Create your first project to start receiving investments from the Capitoro community.
            </p>
            <Link href="/dashboard/projects/new">
              <Button className="bg-gradient-capitoro hover:opacity-90 transition-opacity">
                Create Your First Project
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="bg-gray-900/60 backdrop-blur-sm border-gray-800">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{project.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {project.description.length > 100
                        ? `${project.description.substring(0, 100)}...`
                        : project.description}
                    </CardDescription>
                    <p className="text-sm text-gray-400">
                      {formatSolana(project.totalFunding || 0)} raised •{project.investorCount || 0} investors
                    </p>
                  </div>
                  <Badge className={getStatusColor(project.status)}>{formatStatus(project.status)}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                    <p className="text-sm text-gray-400">Funding Goal</p>
                    <p className="text-lg font-medium">{formatSolana(project.funding_goal)}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                    <p className="text-sm text-gray-400">Funding Received</p>
                    <p className="text-lg font-medium">{formatSolana(project.totalFunding || 0)}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                    <p className="text-sm text-gray-400">Investors</p>
                    <p className="text-lg font-medium">{project.investorCount || 0}</p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Link href={`/dashboard/projects/${project.id}`}>
                    <Button variant="outline" className="gradient-border">
                      View Project
                      <ArrowRight className="ml-2 h-4 w-4" />
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
