"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogOut, Trophy, Gamepad2, User, Users, Gift, Shield } from "lucide-react"
import { playSound } from "@/lib/sounds"
import Image from "next/image"
import CurrencyDisplay, { PointsDisplay } from "@/components/CurrencyDisplay"
import ReferralSystem from "@/components/ReferralSystem"

export default function DashboardClient({ user, profile, leaderboard }) {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  const games = [
    {
      id: "impostor",
      title: "Find the Impostor",
      description: "Identify the AI impostor among verified humans",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_2350-jWSnwdRwsggurXEbBbS4RMnKf6u8bS.png",
      color: "cyan",
      points: "₿50-100",
      href: "/games/impostor",
    },
    {
      id: "spin",
      title: "Billions Spin",
      description: "Spin the futuristic slot machine for rewards",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_2345-aECh5wiLMPLbpkNwF8qcHzgtjob5s2.png",
      color: "purple",
      points: "₿10-500",
      href: "/games/spin",
    },
    {
      id: "quiz",
      title: "Billions Quiz",
      description: "Test your knowledge in rapid-fire questions",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_2346-u8L0SLhfElJSie0Jf6YNRhcAbmDVDb.png",
      color: "pink",
      points: "₿20-200",
      href: "/games/quiz",
    },
  ]

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Cyber Grid Background */}
      <div className="absolute inset-0 cyber-grid opacity-30" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(6,182,212,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(168,85,247,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(236,72,153,0.1),transparent_50%)]" />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
          <div className="flex items-center gap-4">
            <div className="neumorphism-3d p-2 rounded-xl">
              <Image
                src="/images/billions-logo.png"
                alt="Billions Gaming Hub"
                width={60}
                height={60}
                className="rounded-xl"
              />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold holographic animate-holographic mb-2">
                Gaming Hub
              </h1>
              <p className="text-slate-400 text-sm md:text-base">Welcome back, {profile?.username || "Agent"}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="neumorphism-card px-4 md:px-6 py-2 md:py-3 flex-1 md:flex-none">
              <div className="flex items-center gap-2 justify-center">
                <Trophy className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
                <PointsDisplay 
                  points={profile?.total_points || 0} 
                  size="2xl"
                  className="text-cyan-400"
                />
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="neumorphism-button border-red-500/50 text-red-400 hover:bg-red-500/10 bg-transparent flex-1 md:flex-none neon-border-red"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {isLoggingOut ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="neumorphism-card hover:neumorphism-3d transition-all duration-300 hover:scale-105 group">
            <CardHeader className="pb-4">
              <CardTitle className="text-cyan-400 flex items-center gap-2">
                <div className="neumorphism-3d p-1 rounded-lg group-hover:animate-pulse">
                  <User className="w-5 h-5" />
                </div>
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                {profile?.profile_picture && (
                  <div className="relative w-16 h-16 rounded-full overflow-hidden neumorphism-3d group-hover:scale-110 transition-transform duration-300">
                    <Image
                      src={profile.profile_picture || "/placeholder.svg"}
                      alt={profile.username}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <p className="text-2xl font-bold text-slate-100 group-hover:text-cyan-400 transition-colors">{profile?.username || "Agent"}</p>
                  <p className="text-sm text-slate-400">{user.email}</p>
                </div>
              </div>
              <Link href="/profile">
                <Button
                  variant="outline"
                  className="w-full neumorphism-button neon-border-cyan hover:bg-cyan-500/10"
                  onMouseEnter={() => playSound("hover")}
                >
                  Edit Profile
                </Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card className="neumorphism-card hover:neumorphism-3d transition-all duration-300 hover:scale-105 group">
            <CardHeader className="pb-4">
              <CardTitle className="text-purple-400 flex items-center gap-2">
                <div className="neumorphism-3d p-1 rounded-lg group-hover:animate-pulse">
                  <Trophy className="w-5 h-5" />
                </div>
                Total Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <PointsDisplay 
                  points={profile?.total_points || 0} 
                  size="3xl"
                  className="text-slate-100 group-hover:text-purple-400 transition-colors"
                />
                <p className="text-sm text-slate-400 mt-2">Earned from games</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="neumorphism-card hover:neumorphism-3d transition-all duration-300 hover:scale-105 group">
            <CardHeader className="pb-4">
              <CardTitle className="text-pink-400 flex items-center gap-2">
                <div className="neumorphism-3d p-1 rounded-lg group-hover:animate-pulse">
                  <Gamepad2 className="w-5 h-5" />
                </div>
                Games Available
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-4xl font-bold text-slate-100 group-hover:text-pink-400 transition-colors">3</p>
                <p className="text-sm text-slate-400 mt-2">Active games to play</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Referral System */}
        <div className="mb-8">
          <ReferralSystem user={user} profile={profile} />
        </div>

        {/* Level Display */}
        <div className="mb-8">
          <LevelDisplay user={user} profile={profile} />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-slate-100 mb-6 holographic animate-holographic">Choose Your Game</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {games.map((game) => (
              <Link
                key={game.id}
                href={game.href}
                onMouseEnter={() => playSound("hover")}
                onClick={() => playSound("click")}
              >
                <Card className="neumorphism-card hover:neumorphism-3d transition-all duration-300 hover:scale-105 cursor-pointer group overflow-hidden">
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={game.image || "/placeholder.svg"}
                      alt={game.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                  </div>
                  <CardHeader>
                    <CardTitle className={`text-${game.color}-400 text-xl`}>{game.title}</CardTitle>
                    <CardDescription className="text-slate-400">{game.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-400">Earn:</span>
                      <span className={`text-${game.color}-400 font-semibold`}>{game.points}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Voice Verification */}
        <div className="mt-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-100 holographic animate-holographic">Human Verification</h2>
            <Link href="/community">
              <Button
                variant="outline"
                className="neumorphism-button neon-border-purple"
                onMouseEnter={() => playSound("hover")}
              >
                Verify Identity
              </Button>
            </Link>
          </div>
          <Card className="neumorphism-card">
            <CardContent className="p-6">
              <div className="text-center">
                <Shield className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-100 mb-2">Voice Verification</h3>
                <p className="text-slate-400 mb-4">
                  Prove your humanity through advanced voice biometrics. Essential for Billions Network security.
                </p>
                <p className="text-green-400 text-sm">✓ Get your custom verification card!</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-100 holographic animate-holographic">Leaderboard</h2>
            <Link href="/leaderboard">
              <Button
                variant="outline"
                className="neumorphism-button neon-border-cyan"
                onMouseEnter={() => playSound("hover")}
              >
                View Full Leaderboard
              </Button>
            </Link>
          </div>
          <Card className="neumorphism-card">
            <CardContent className="p-6">
              <div className="space-y-4">
                {leaderboard?.slice(0, 5).map((player, index) => (
                  <div key={player.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center justify-center text-sm font-bold text-white">
                        {index + 1}
                      </div>
                      <div className="flex items-center gap-2">
                        {player.profile_picture && (
                          <div className="relative w-8 h-8 rounded-full overflow-hidden">
                            <Image
                              src={player.profile_picture}
                              alt={player.username}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <span className="text-slate-100 font-medium">{player.username}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <PointsDisplay points={player.total_points} size="sm" className="text-cyan-400" />
                    </div>
                  </div>
                ))}
                {(!leaderboard || leaderboard.length === 0) && (
                  <p className="text-slate-400 text-center">Play games to see your ranking!</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
