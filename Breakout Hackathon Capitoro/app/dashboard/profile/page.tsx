"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ProfilePage() {
  const { supabase, user } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userData, setUserData] = useState<any>(null)

  // Form fields
  const [fullName, setFullName] = useState("")
  const [bio, setBio] = useState("")
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null)

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [canDelete, setCanDelete] = useState(false) // Default to false until we check
  const [deleteError, setDeleteError] = useState<string | null>(null)

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
        setFullName(currentUser.full_name || "")
        setBio(currentUser.bio || "")
        setProfileImageUrl(currentUser.profile_image_url || null)
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [supabase, user])

  useEffect(() => {
    const checkCanDelete = async () => {
      if (!user) return

      try {
        // Check if user has any projects with investments
        const { data: projectsData, error: projectsError } = await supabase
          .from("projects")
          .select("id, investments(id)")
          .eq("entrepreneur_id", user.id)

        if (projectsError) throw projectsError

        // Check if user has made any investments
        const { data: investmentsData, error: investmentsError } = await supabase
          .from("investments")
          .select("id")
          .eq("investor_id", user.id)

        if (investmentsError) throw investmentsError

        // User can delete if they have no projects with investments and have made no investments
        const hasProjectsWithInvestments = projectsData.some(
          (project) => project.investments && project.investments.length > 0,
        )
        const hasMadeInvestments = investmentsData.length > 0

        console.log("Can delete account:", !hasProjectsWithInvestments && !hasMadeInvestments)
        setCanDelete(!hasProjectsWithInvestments && !hasMadeInvestments)

        if (hasProjectsWithInvestments) {
          setDeleteError(
            "Your account cannot be deleted because you have projects with active investments. Please contact support for assistance.",
          )
        } else if (hasMadeInvestments) {
          setDeleteError(
            "Your account cannot be deleted because you have invested in other projects. Please contact support for assistance.",
          )
        } else if (hasProjectsWithInvestments && hasMadeInvestments) {
          setDeleteError(
            "Your account cannot be deleted because you have projects with investments and you have invested in other projects. Please contact support for assistance.",
          )
        } else {
          setDeleteError(null)
        }
      } catch (error) {
        console.error("Error checking delete eligibility:", error)
      }
    }

    checkCanDelete()
  }, [supabase, user])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0])

      // Create a preview URL
      const reader = new FileReader()
      reader.onload = (event) => {
        setProfileImageUrl(event.target?.result as string)
      }
      reader.readAsDataURL(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      let updatedProfileImageUrl = userData.profile_image_url

      // Upload new profile image if selected
      if (profileImage) {
        const fileExt = profileImage.name.split(".").pop()
        const fileName = `${user!.id}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `profile-images/${fileName}`

        const { error: uploadError, data } = await supabase.storage.from("avatars").upload(filePath, profileImage)

        if (uploadError) throw uploadError

        const {
          data: { publicUrl },
        } = supabase.storage.from("avatars").getPublicUrl(filePath)

        updatedProfileImageUrl = publicUrl
      }

      // Update user profile
      const { error } = await supabase
        .from("users")
        .update({
          full_name: fullName,
          bio,
          profile_image_url: updatedProfileImageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user!.id)

      if (error) throw error

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message || "An error occurred while updating your profile.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user) return

    // Double check that the user can delete their account
    if (!canDelete) {
      toast({
        title: "Cannot delete account",
        description: deleteError || "You cannot delete your account at this time.",
        variant: "destructive",
      })
      return
    }

    setDeleteLoading(true)

    try {
      // First try the API route
      try {
        const response = await fetch("/api/delete-account", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || "Failed to delete account via API")
        }

        // If successful, redirect to home page
        toast({
          title: "Account deleted",
          description: "Your account has been permanently deleted.",
        })
        router.push("/")
        return
      } catch (apiError) {
        console.error("API route failed, falling back to client-side deletion:", apiError)
        // Continue with client-side fallback
      }

      // Client-side fallback if API route fails
      // 1. Delete user data from custom tables
      // First, delete any projects the user has created (that don't have investments)
      const { data: projectsData, error: projectsQueryError } = await supabase
        .from("projects")
        .select("id")
        .eq("entrepreneur_id", user.id)

      if (projectsQueryError) throw projectsQueryError

      if (projectsData && projectsData.length > 0) {
        const projectIds = projectsData.map((project) => project.id)

        // Delete projects
        const { error: projectsDeleteError } = await supabase.from("projects").delete().in("id", projectIds)

        if (projectsDeleteError) throw projectsDeleteError
      }

      // Delete user's investments
      const { error: investmentsDeleteError } = await supabase.from("investments").delete().eq("investor_id", user.id)

      if (investmentsDeleteError) throw investmentsDeleteError

      // Delete user data from users table
      const { error: userDataError } = await supabase.from("users").delete().eq("id", user.id)

      if (userDataError) throw userDataError

      // 2. Make the account unusable by changing email and password
      // Generate random strings for email and password
      const randomString = Math.random().toString(36).substring(2, 15)
      const randomEmail = `deleted-${randomString}@deleted-account.com`
      const randomPassword = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

      // Update user email and password to random values
      const { error: updateError } = await supabase.auth.updateUser({
        email: randomEmail,
        password: randomPassword,
      })

      if (updateError) throw updateError

      // 3. Sign out the user
      await supabase.auth.signOut()

      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted.",
      })

      // Redirect to home page
      router.push("/")
    } catch (error: any) {
      console.error("Error deleting account:", error)
      toast({
        title: "Error deleting account",
        description: error.message || "An error occurred while deleting your account.",
        variant: "destructive",
      })
    } finally {
      setDeleteLoading(false)
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
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-gray-400">Manage your account settings</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="bg-gray-900/60 backdrop-blur-sm border-gray-800">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal information and profile picture</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex flex-col items-center gap-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profileImageUrl || undefined} />
                  <AvatarFallback className="text-lg bg-capitoro-purple/20 text-capitoro-purple">
                    {getInitials(fullName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Label htmlFor="profile-image" className="cursor-pointer">
                    <div className="bg-gray-800 hover:bg-gray-700 transition-colors px-3 py-1 rounded-md text-sm">
                      Change Photo
                    </div>
                    <Input
                      id="profile-image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </Label>
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <Label htmlFor="full-name">Full Name</Label>
                  <Input
                    id="full-name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={user?.email || ""}
                    disabled
                    className="bg-gray-800 border-gray-700 opacity-70"
                  />
                  <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full min-h-[100px] rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/60 backdrop-blur-sm border-gray-800">
          <CardHeader>
            <CardTitle>Account Type</CardTitle>
            <CardDescription>Your account type determines what you can do on Capitoro</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
              <p className="font-medium">
                You are registered as: <span className="text-capitoro-purple">{userData.role}</span>
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Account type cannot be changed. Please contact support if you need to change your account type.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/60 backdrop-blur-sm border-gray-800">
          <CardHeader>
            <CardTitle className="text-red-500">Danger Zone</CardTitle>
            <CardDescription>Permanently delete your account and all associated data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-300">
                Once you delete your account, there is no going back. This action cannot be undone.
              </p>

              {deleteError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Account Deletion Restricted</AlertTitle>
                  <AlertDescription>{deleteError}</AlertDescription>
                </Alert>
              )}

              {canDelete && (
                <Alert className="bg-amber-900/20 border-amber-800 text-amber-400">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Account Deletion Available</AlertTitle>
                  <AlertDescription>
                    You can delete your account because you have no projects with investments and you haven't invested
                    in any projects.
                  </AlertDescription>
                </Alert>
              )}

              {!showDeleteConfirm ? (
                <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)} disabled={!canDelete}>
                  Delete Account
                </Button>
              ) : (
                <div className="p-4 rounded-lg bg-red-900/20 border border-red-800 space-y-4">
                  <p className="font-medium text-white">Are you sure you want to delete your account?</p>
                  <div className="flex gap-4">
                    <Button variant="destructive" onClick={handleDeleteAccount} disabled={deleteLoading || !canDelete}>
                      {deleteLoading ? "Deleting..." : "Yes, Delete My Account"}
                    </Button>
                    <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" className="bg-gradient-capitoro hover:opacity-90 transition-opacity" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  )
}
