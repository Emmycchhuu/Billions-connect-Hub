"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useNotification } from "@/components/NotificationSystem"
import Image from "next/image"
import Link from "next/link"

export default function DashboardClient({ user, profile }) {
  const supabase = createClient()
  const { showSuccess, showError } = useNotification()
  const [loading, setLoading] = useState(false)
  const [userData, setUserData] = useState(profile || null)
  const [origin, setOrigin] = useState("") // ✅ for client-side window.origin

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin)
    }
  }, [])

  useEffect(() => {
    if (!user || !user.id) return

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (error) throw error
        setUserData(data)
      } catch (err) {
        console.error("Error fetching profile:", err.message)
      }
    }

    fetchProfile()
  }, [user, supabase])

  const handleLogout = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      showSuccess("Logged out successfully!")
      window.location.href = "/auth/login"
    } catch (error) {
      showError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full p-6 relative">
      <div className="absolute inset-0 cyber-grid" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.05),transparent_60%)]" />
      <div className="relative z-10 max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Image
              src="/images/billions-logo.png"
              alt="Billions Logo"
              width={48}
              height={48}
              className="object-contain"
            />
            <h1 className="text-2xl font-bold text-purple-400">Agent Dashboard</h1>
          </div>
          <Button
            onClick={handleLogout}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-lg"
          >
            {loading ? "Logging out..." : "Logout"}
          </Button>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          {/* User Info */}
          <Card className="glass-card border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-xl text-purple-400">Profile</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 space-y-2">
              <p><span className="font-semibold">Username:</span> {userData?.username || "N/A"}</p>
              <p><span className="font-semibold">Email:</span> {userData?.email || user?.email}</p>
              <p><span className="font-semibold">Referral Code:</span> {userData?.referral_code || "None"}</p>
            </CardContent>
          </Card>

          {/* Referrals */}
          <Card className="glass-card border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-xl text-purple-400">Referrals</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300">
              <p>Invite friends to join Billions using your referral link:</p>
              <div className="mt-3 p-3 bg-purple-900/20 border border-purple-500/20 rounded-lg">
                <code className="break-words text-purple-300">
                  {origin
                    ? `${origin}/auth/sign-up?ref=${userData?.referral_code || ""}`
                    : "Loading..."}
                </code>
              </div>
            </CardContent>
          </Card>

          {/* Bonus Section */}
          <Card className="glass-card border-purple-500/20 md:col-span-2">
            <CardHeader>
              <CardTitle className="text-xl text-purple-400">Earnings & Progress</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300">
              <div className="flex flex-col gap-4">
                <p>Your current balance: <span className="text-green-400 font-semibold">$0.00</span></p>
                <p>Status: <span className="text-blue-400">Active Agent</span></p>
                <Button className="bg-purple-700 hover:bg-purple-800 w-fit text-white font-semibold">
                  View Transaction History
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-10">
          <Link href="/" className="text-purple-400 hover:text-purple-300 underline underline-offset-4">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
