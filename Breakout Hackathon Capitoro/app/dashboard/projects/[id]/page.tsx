"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSupabase } from "@/lib/supabase-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatSolana, truncateAddress } from "@/lib/utils"
import { ArrowLeft, Edit, Trash2, Upload, FileText, ExternalLink, Wallet } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { InvestmentModal } from "@/components/investment-modal"

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { supabase, user } = useSupabase()
  const { toast } = useToast()
  const projectId = params.id as string

  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState<any>(null)
  const [investments, setInvestments] = useState<any[]>([])
  const [updates, setUpdates] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [isOwner, setIsOwner] = useState(false)
  const [showInvestModal, setShowInvestModal] = useState(false)

  const fetchProjectData = async () => {
    if (!projectId || !user) return

    try {
      // Validate that projectId is a valid UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(projectId)) {
        throw new Error("Invalid project ID format")
      }

      // Fetch project details
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("*, users!projects_entrepreneur_id_fkey(full_name, wallet_address)")
        .eq("id", projectId)
        .single()

      if (projectError) throw projectError

      // Add the entrepreneur's wallet address to the project object
      const projectWithWallet = {
        ...projectData,
        entrepreneur_wallet_address: projectData.users.wallet_address,
      }

      setProject(projectWithWallet)
      setIsOwner(projectData.entrepreneur_id === user.id)

      // Fetch investments
      const { data: investmentsData, error: investmentsError } = await supabase
        .from("investments")
        .select(`
          *,
          users(full_name, wallet_address)
        `)
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })

      if (investmentsError) throw investmentsError
      setInvestments(investmentsData || [])

      // Calculate total funding and investor count
      const totalFunding = investmentsData.reduce((sum, inv) => sum + Number.parseFloat(inv.amount || 0), 0)
      const investorCount = investmentsData.length

      // Update the project with these values
      setProject({
        ...projectWithWallet,
        funding_received: totalFunding,
      })

      // Fetch project updates
      const { data: updatesData, error: updatesError } = await supabase
        .from("project_updates")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })

      if (updatesError) throw updatesError
      setUpdates(updatesData || [])

      // Fetch expenses
      const { data: expensesData, error: expensesError } = await supabase
        .from("expenses")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })

      if (expensesError) throw expensesError
      setExpenses(expensesData || [])
    } catch (error) {
      console.error("Error fetching project data:", error)
      toast({
        title: "Error",
        description: "Failed to load project data",
        variant: "destructive",
      })
      router.push("/dashboard/projects")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // If the projectId is "new", redirect to the new project page
    if (projectId === "new") {
      router.push("/dashboard/projects/new")
      return
    }

    fetchProjectData()
  }, [projectId, supabase, user, router, toast])

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

  const calculateProgress = () => {
    if (!project) return 0
    const received = project.funding_received || 0
    const goal = project.funding_goal || 1
    return Math.min(Math.round((received / goal) * 100), 100)
  }

  const handleInvestmentComplete = async () => {
    // Refetch project data to update the UI
    await fetchProjectData()
  }

  // If we're redirecting to the new project page, show a loading state
  if (projectId === "new") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-capitoro-purple"></div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-capitoro-purple"></div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold mb-4">Project not found</h2>
        <p className="text-gray-400 mb-6">
          The project you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <Link href="/dashboard/projects">
          <Button variant="outline" className="gradient-border">
            Back to Projects
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/projects">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{project.name}</h1>
              <Badge className={getStatusColor(project.status)}>{formatStatus(project.status)}</Badge>
            </div>

            {isOwner && (
              <div className="flex gap-2">
                <Link href={`/dashboard/projects/${projectId}/edit`}>
                  <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </Link>
                <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            )}
          </div>
          <p className="text-gray-400 mt-1">{project.category || "Uncategorized"}</p>
        </div>
      </div>

      <Card className="bg-gray-900/60 backdrop-blur-sm border-gray-800">
        <CardHeader>
          <CardTitle>Project Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
              <p className="text-sm text-gray-400">Funding Goal</p>
              <p className="text-lg font-medium">{formatSolana(project.funding_goal)}</p>
            </div>
            <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
              <p className="text-sm text-gray-400">Funding Received</p>
              <p className="text-lg font-medium">{formatSolana(project.funding_received || 0)}</p>
            </div>
            <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
              <p className="text-sm text-gray-400">Investors</p>
              <p className="text-lg font-medium">{investments.length}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{calculateProgress()}%</span>
            </div>
            <Progress value={calculateProgress()} className="h-2" />
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Description</h3>
            <p className="text-gray-300 whitespace-pre-line">{project.description}</p>
          </div>

          {isOwner && (
            <div className="flex justify-end">
              <Button className="bg-gradient-capitoro hover:opacity-90 transition-opacity">
                <Upload className="mr-2 h-4 w-4" />
                Add Project Files
              </Button>
            </div>
          )}
          {!isOwner && (
            <div className="flex justify-end">
              <Button
                className="bg-gradient-capitoro hover:opacity-90 transition-opacity"
                onClick={() => setShowInvestModal(true)}
              >
                Invest
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="updates" className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="updates">Updates</TabsTrigger>
          <TabsTrigger value="investments">Investments</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
        </TabsList>

        <TabsContent value="updates">
          <Card className="bg-gray-900/60 backdrop-blur-sm border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Project Updates</CardTitle>
                <CardDescription>Latest news and progress updates</CardDescription>
              </div>
              {isOwner && (
                <Button variant="outline" className="gradient-border">
                  <FileText className="mr-2 h-4 w-4" />
                  Post Update
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {updates.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium">No updates yet</h3>
                  <p className="mt-2 text-gray-400">
                    {isOwner
                      ? "Post updates to keep your investors informed about your progress."
                      : "The project owner has not posted any updates yet."}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {updates.map((update) => (
                    <div key={update.id} className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{update.title}</h3>
                        <p className="text-xs text-gray-400">{new Date(update.created_at).toLocaleDateString()}</p>
                      </div>
                      <p className="text-gray-300 whitespace-pre-line">{update.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="investments">
          <Card className="bg-gray-900/60 backdrop-blur-sm border-gray-800">
            <CardHeader>
              <CardTitle>Investments</CardTitle>
              <CardDescription>People who have invested in this project</CardDescription>
            </CardHeader>
            <CardContent>
              {investments.length === 0 ? (
                <div className="text-center py-8">
                  <Wallet className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium">No investments yet</h3>
                  <p className="mt-2 text-gray-400">This project has not received any investments yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {investments.map((investment) => (
                    <div
                      key={investment.id}
                      className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 rounded-lg bg-gray-800/50 border border-gray-700"
                    >
                      <div>
                        <h3 className="font-medium">{investment.users.full_name}</h3>
                        <p className="text-sm text-gray-400">
                          {truncateAddress(investment.users.wallet_address)} •
                          {new Date(investment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="bg-capitoro-purple/10 text-capitoro-purple border-capitoro-purple/20"
                        >
                          {formatSolana(investment.amount)}
                        </Badge>
                        <a
                          href={`https://explorer.solana.com/tx/${investment.transaction_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-white"
                        >
                          <ExternalLink size={16} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses">
          <Card className="bg-gray-900/60 backdrop-blur-sm border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Expenses</CardTitle>
                <CardDescription>How funds are being used</CardDescription>
              </div>
              {isOwner && (
                <Button variant="outline" className="gradient-border">
                  <FileText className="mr-2 h-4 w-4" />
                  Add Expense
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {expenses.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium">No expenses recorded</h3>
                  <p className="mt-2 text-gray-400">
                    {isOwner
                      ? "Record expenses to show investors how funds are being used."
                      : "The project owner has not recorded any expenses yet."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {expenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 rounded-lg bg-gray-800/50 border border-gray-700"
                    >
                      <div>
                        <h3 className="font-medium">{expense.description}</h3>
                        <p className="text-sm text-gray-400">
                          {expense.category} •{new Date(expense.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="bg-capitoro-teal/10 text-capitoro-teal border-capitoro-teal/20"
                        >
                          {formatSolana(expense.amount)}
                        </Badge>
                        {expense.transaction_hash && (
                          <a
                            href={`https://explorer.solana.com/tx/${expense.transaction_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-white"
                          >
                            <ExternalLink size={16} />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <InvestmentModal
        isOpen={showInvestModal}
        onClose={() => setShowInvestModal(false)}
        project={project}
        onInvestmentComplete={handleInvestmentComplete}
      />
    </div>
  )
}
