"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogOut, Trophy, Gamepad2, User } from "lucide-react"
import { playSound } from "@/lib/sounds"
import Image from "next/image"

export default function DashboardClient({ user, profile }) {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  // 🎮 GAMES + VOICE VERIFICATION CARD
  const games = [
    {
      id: "impostor",
      title: "Find the Impostor",
      description: "Identify the AI impostor among verified humans",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_2350-jWSnwdRwsggurXEbBbS4RMnKf6u8bS.png",
      color: "cyan",
      points: "50-100 pts",
      href: "/games/impostor",
    },
    {
      id: "spin",
      title: "Billions Spin",
      description: "Spin the futuristic slot machine for rewards",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_2345-aECh5wiLMPLbpkNwF8qcHzgtjob5s2.png",
      color: "purple",
      points: "10-500 pts",
      href: "/games/spin",
    },
    {
      id: "quiz",
      title: "Billions Quiz",
      description: "Test your knowledge in rapid-fire questions",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_2346-u8L0SLhfElJSie0Jf6YNRhcAbmDVDb.png",
      color: "pink",
      points: "20-200 pts",
      href: "/games/quiz",
    },
    {
      id: "voice",
      title: "Voice Verification",
      description: "Verify your identity with your voice and earn rewards",
      image:
        "https://ibb.co/B5G3Ygq4", // 🖼️ Replace this with your hosted image
      color: "emerald",
      points: "Bonus: 100 pts",
      href: "/voiceverification",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(6,182,212,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(168,85,247,0.1),transparent_50%)]" />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
          <div className="flex items-center gap-4">
            <Image
              src="/images/billions-logo.png"
              alt="Billions Gaming Hub"
              width={60}
              height={60}
              className="rounded-xl"
            />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
                Gaming Hub
              </h1>
              <p className="text-slate-400 text-sm md:text-base">
                Welcome back, {profile?.username || "Agent"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-lg px-4 md:px-6 py-2 md:py-3 flex-1 md:flex-none">
              <div className="flex items-center gap-2 justify-center">
                <Trophy className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
                <span className="text-xl md:text-2xl font-bold text-cyan-400">
                  {profile?.total_points || 0}
                </span>
                <span className="text-slate-400 text-xs md:text-sm">points</span>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="border-red-500/50 text-red-400 hover:bg-red-500/10 bg-transparent flex-1 md:flex-none"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {isLoggingOut ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </div>

        {/* Profile Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-slate-900/50 backdrop-blur-xl border-cyan-500/20">
            <CardHeader>
              <CardTitle className="text-cyan-400 flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                {profile?.profile_picture && (
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-cyan-500/50">
                    <Image
                      src={profile.profile_picture || "/placeholder.svg"}
                      alt={profile.username}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <p className="text-2xl font-bold text-slate-100">
                    {profile?.username || "Agent"}
                  </p>
                  <p className="text-sm text-slate-400">{user.email}</p>
                </div>
              </div>
              <Link href="/profile">
                <Button
                  variant="outline"
                  className="w-full border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 bg-transparent"
                  onMouseEnter={() => playSound("hover")}
                >
                  Edit Profile
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 backdrop-blur-xl border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-purple-400 flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Total Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-100">
                {profile?.total_points || 0}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 backdrop-blur-xl border-pink-500/20">
            <CardHeader>
              <CardTitle className="text-pink-400 flex items-center gap-2">
                <Gamepad2 className="w-5 h-5" />
                Games Available
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-100">
                {games.length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Games Section */}
        <div>
          <h2 className="text-2xl font-bold text-slate-100 mb-6">
            Choose Your Game
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {games.map((game) => (
              <Link
                key={game.id}
                href={game.href}
                onMouseEnter={() => playSound("hover")}
                onClick={() => playSound("click")}
              >
                <Card
                  className={`bg-slate-900/50 backdrop-blur-xl border-${game.color}-500/20 hover:border-${game.color}-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer group overflow-hidden`}
                >
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={game.image || "/placeholder.svg"}
                      alt={game.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
                  </div>
                  <CardHeader>
                    <CardTitle className={`text-${game.color}-400 text-xl`}>
                      {game.title}
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      {game.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">Earn:</span>
                      <span
                        className={`text-${game.color}-400 font-semibold`}
                      >
                        {game.points}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Leaderboard + Acknowledgment */}
        <div className="mt-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold text-slate-100">Leaderboard</h2>
            <div className="flex flex-wrap gap-3">
              <Link href="/leaderboard">
                <Button
                  variant="outline"
                  className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 bg-transparent"
                  onMouseEnter={() => playSound("hover")}
                >
                  View Full Leaderboard
                </Button>
              </Link>
              <Link href="/acknowledgment">
                <Button
                  variant="outline"
                  className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 bg-transparent"
                  onMouseEnter={() => playSound("hover")}
                >
                  💙 Acknowledgment
                </Button>
              </Link>
            </div>
          </div>

          <Card className="bg-slate-900/50 backdrop-blur-xl border-cyan-500/20">
            <CardContent className="p-6">
              <p className="text-slate-400 text-center">
                Play games to see your ranking!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
