"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/lib/supabase-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewProjectPage() {
  const router = useRouter()
  const { supabase, user } = useSupabase()
  const { toast } = useToast()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState("idea")
  const [fundingGoal, setFundingGoal] = useState("1")
  const [category, setCategory] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!user) throw new Error("You must be logged in to create a project")

      const { data, error } = await supabase
        .from("projects")
        .insert({
          entrepreneur_id: user.id,
          name,
          description,
          status,
          funding_goal: Number.parseFloat(fundingGoal),
          funding_received: 0,
          category,
        })
        .select()
        .single()

      if (error) throw error

      toast({
        title: "Project created",
        description: "Your project has been created successfully.",
      })

      // Redirect to the project page
      router.push(`/dashboard/projects/${data.id}`)
    } catch (error: any) {
      toast({
        title: "Error creating project",
        description: error.message || "An error occurred while creating your project.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/projects">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">New Project</h1>
          <p className="text-gray-400">Create a new startup project</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="bg-gray-900/60 backdrop-blur-sm border-gray-800">
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>Provide information about your startup project</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-gray-800 border-gray-700"
                placeholder="e.g., My Awesome Startup"
              />
            </div>

            <div>
              <Label htmlFor="description">Project Description</Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full min-h-[150px] rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm"
                placeholder="Describe your project, its goals, and why it's innovative..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm"
                  required
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  <option value="fintech">FinTech</option>
                  <option value="healthtech">HealthTech</option>
                  <option value="edtech">EdTech</option>
                  <option value="ecommerce">E-Commerce</option>
                  <option value="saas">SaaS</option>
                  <option value="ai">AI/ML</option>
                  <option value="blockchain">Blockchain</option>
                  <option value="gaming">Gaming</option>
                  <option value="social">Social Media</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <Label htmlFor="status">Project Status</Label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm"
                >
                  <option value="idea">Idea Stage</option>
                  <option value="prototype">Prototype</option>
                  <option value="mvp">MVP</option>
                  <option value="growth">Growth</option>
                  <option value="scaling">Scaling</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="fundingGoal">Funding Goal (SOL)</Label>
              <Input
                id="fundingGoal"
                type="number"
                min="0.1"
                step="0.1"
                value={fundingGoal}
                onChange={(e) => setFundingGoal(e.target.value)}
                required
                className="bg-gray-800 border-gray-700"
              />
              <p className="text-xs text-gray-400 mt-1">Minimum funding goal is 0.1 SOL</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" className="bg-gradient-capitoro hover:opacity-90 transition-opacity" disabled={loading}>
            {loading ? "Creating Project..." : "Create Project"}
          </Button>
        </div>
      </form>
    </div>
  )
}
