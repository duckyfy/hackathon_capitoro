"use server"

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

export async function deleteAccount(userId: string) {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  try {
    // 1. Delete user data from custom tables
    // First, delete any projects the user has created (that don't have investments)
    const { data: projectsData, error: projectsQueryError } = await supabase
      .from("projects")
      .select("id")
      .eq("entrepreneur_id", userId)

    if (projectsQueryError) throw projectsQueryError

    if (projectsData && projectsData.length > 0) {
      const projectIds = projectsData.map((project) => project.id)

      // Delete project updates
      await supabase.from("project_updates").delete().in("project_id", projectIds)

      // Delete expenses
      await supabase.from("expenses").delete().in("project_id", projectIds)

      // Delete projects
      await supabase.from("projects").delete().in("id", projectIds)
    }

    // Delete user's investments
    await supabase.from("investments").delete().eq("investor_id", userId)

    // Delete user data from users table
    await supabase.from("users").delete().eq("id", userId)

    // 2. Delete the user from Supabase Auth
    // This requires admin privileges, so we'll use the admin API
    const { error: authError } = await supabase.auth.admin.deleteUser(userId)

    if (authError) throw authError

    // 3. Sign out the user
    await supabase.auth.signOut()

    revalidatePath("/")
    return { success: true }
  } catch (error: any) {
    console.error("Error deleting account:", error)
    return {
      success: false,
      error: error.message || "Failed to delete account",
    }
  }
}
