import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ClientCommunity from "./ClientCommunity";

export default async function CommunityPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // ✅ pass data to client component safely
  return <ClientCommunity user={user} profile={profile} />;
}