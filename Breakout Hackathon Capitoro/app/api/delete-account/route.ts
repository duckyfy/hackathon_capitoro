import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  try {
    // Get the current user
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

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

    // 2. Instead of using admin API, make the account unusable by changing email and password
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

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting account:", error)
    return NextResponse.json({ error: error.message || "Failed to delete account" }, { status: 500 })
  }
}
