import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import CommunityChatClient from "@/components/CommunityChatClient"

export default async function CommunityPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return <CommunityChatClient user={user} profile={profile} />
}