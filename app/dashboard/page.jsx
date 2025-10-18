import { redirect } from "next/navigation"
import { cache } from "react"
import { createClient } from "@/lib/supabase/server"
import DashboardClient from "@/components/dashboard-client"

const getUserAndProfile = cache(async () => {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { user: null, profile: null, leaderboard: null }
  }

  const { data: profile, error: profileError } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  let userProfile = profile
  if (profileError || !profile) {
    const { data: newProfile } = await supabase
      .from("profiles")
      .insert([
        {
          id: user.id,
          username: user.email?.split("@")[0] || "Agent",
          total_points: 0,
        },
      ])
      .select()
      .single()
    userProfile = newProfile
  }

  // Fetch leaderboard data
  const { data: leaderboard } = await supabase
    .from("profiles")
    .select("id, username, total_points, profile_picture")
    .order("total_points", { ascending: false })
    .limit(10)

  return { user, profile: userProfile, leaderboard }
})

export default async function DashboardPage() {
  const { user, profile, leaderboard } = await getUserAndProfile()

  if (!user) {
    redirect("/auth/login")
  }

  return <DashboardClient user={user} profile={profile} leaderboard={leaderboard} />
}
