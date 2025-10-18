"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Trophy, Medal, Crown, TrendingUp, Gamepad2, Clock } from "lucide-react"
import { playSound } from "@/lib/sounds"

export default function LeaderboardClient({ user, profile, leaderboard, gameSessions }) {
  const [activeTab, setActiveTab] = useState("leaderboard")

  const userRank = leaderboard?.findIndex((p) => p.id === user.id) + 1 || 0

  const getGameIcon = (gameType) => {
    switch (gameType) {
      case "impostor":
        return "🎭"
      case "spin":
        return "🎰"
      case "quiz":
        return "🧠"
      default:
        return "🎮"
    }
  }

  const getGameName = (gameType) => {
    switch (gameType) {
      case "impostor":
        return "Find the Impostor"
      case "spin":
        return "Billions Spin"
      case "quiz":
        return "Billions Quiz"
      default:
        return "Unknown Game"
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
  }

  const getRankIcon = (index) => {
    if (index === 0) return { Icon: Crown, color: "text-yellow-400", bg: "bg-yellow-500/20" }
    if (index === 1) return { Icon: Medal, color: "text-slate-300", bg: "bg-slate-500/20" }
    if (index === 2) return { Icon: Medal, color: "text-orange-400", bg: "bg-orange-500/20" }
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.1),transparent_50%)]" />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <Link href="/dashboard">
            <Button
              variant="outline"
              className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 bg-transparent"
              onMouseEnter={() => playSound("hover")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Hub
            </Button>
          </Link>
          <div className="bg-slate-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-lg px-6 py-3 animate-slide-in-right">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="text-slate-400">Your Rank:</span>
              <span className="text-2xl font-bold text-cyan-400">#{userRank || "N/A"}</span>
            </div>
          </div>
        </div>

        <div className="text-center mb-8 animate-slide-up">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Leaderboard
          </h1>
          <p className="text-slate-400 text-lg">Compete with players worldwide</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 bg-slate-900/50 border border-cyan-500/20">
            <TabsTrigger
              value="leaderboard"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Top Players
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400"
            >
              <Clock className="w-4 h-4 mr-2" />
              Your History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="leaderboard" className="space-y-6 mt-6">
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {leaderboard?.slice(0, 3).map((player, index) => {
                const icons = [
                  { icon: Crown, color: "text-yellow-400", bg: "bg-yellow-500/20", border: "border-yellow-500/30" },
                  { icon: Medal, color: "text-slate-300", bg: "bg-slate-500/20", border: "border-slate-500/30" },
                  { icon: Medal, color: "text-orange-400", bg: "bg-orange-500/20", border: "border-orange-500/30" },
                ]
                const { icon: Icon, color, bg, border } = icons[index]

                return (
                  <Card
                    key={player.id}
                    className={`bg-slate-900/80 backdrop-blur-xl border-2 ${border} card-shine animate-scale-in hover:scale-105 transition-transform duration-300`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CardHeader className="text-center pb-4">
                      <div
                        className={`mx-auto mb-3 w-16 h-16 rounded-full ${bg} flex items-center justify-center animate-bounce-subtle`}
                      >
                        <Icon className={`w-10 h-10 ${color}`} />
                      </div>
                      <div className="relative w-24 h-24 mx-auto mb-3 rounded-full overflow-hidden border-4 border-cyan-500/50">
                        <Image
                          src={player.profile_picture || "/images/avatar-1.jpeg"}
                          alt={player.username}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <CardTitle className="text-2xl text-slate-100">{player.username}</CardTitle>
                      <CardDescription className="text-slate-400">Rank #{index + 1}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className={`text-4xl font-bold ${color}`}>{player.total_points}</p>
                      <p className="text-slate-400 text-sm mt-1">points</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <Card className="bg-slate-900/80 backdrop-blur-xl border-cyan-500/20 animate-slide-up">
              <CardHeader>
                <CardTitle className="text-cyan-400 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  All Rankings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {leaderboard?.map((player, index) => {
                    const rankIcon = getRankIcon(index)

                    return (
                      <div
                        key={player.id}
                        className={`flex items-center justify-between p-4 rounded-lg transition-all hover:scale-[1.02] ${
                          player.id === user.id
                            ? "bg-cyan-500/20 border border-cyan-500/50 animate-pulse-glow"
                            : "bg-slate-800/50 hover:bg-slate-800/70"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                              index < 3
                                ? "bg-gradient-to-br from-cyan-500 to-purple-500 text-white"
                                : "bg-slate-700 text-slate-300"
                            }`}
                          >
                            {rankIcon ? <rankIcon.Icon className={`w-6 h-6 ${rankIcon.color}`} /> : index + 1}
                          </div>
                          <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-slate-700">
                            <Image
                              src={player.profile_picture || "/images/avatar-1.jpeg"}
                              alt={player.username}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p
                              className={`font-semibold ${player.id === user.id ? "text-cyan-400" : "text-slate-100"}`}
                            >
                              {player.username}
                              {player.id === user.id && (
                                <span className="ml-2 text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded">You</span>
                              )}
                            </p>
                            <p className="text-sm text-slate-400">
                              Joined {formatDate(player.created_at).split(",")[0]}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-cyan-400">{player.total_points}</p>
                          <p className="text-xs text-slate-400">points</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6 mt-6">
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-slate-900/80 backdrop-blur-xl border-cyan-500/20">
                <CardHeader>
                  <CardTitle className="text-cyan-400 flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Total Points
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-slate-100">{profile?.total_points || 0}</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-900/80 backdrop-blur-xl border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-purple-400 flex items-center gap-2">
                    <Gamepad2 className="w-5 h-5" />
                    Games Played
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-slate-100">{gameSessions?.length || 0}</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-900/80 backdrop-blur-xl border-pink-500/20">
                <CardHeader>
                  <CardTitle className="text-pink-400 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Your Rank
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-slate-100">#{userRank || "N/A"}</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-900/80 backdrop-blur-xl border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-purple-400 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Games
                </CardTitle>
                <CardDescription className="text-slate-400">Your last 10 game sessions</CardDescription>
              </CardHeader>
              <CardContent>
                {gameSessions && gameSessions.length > 0 ? (
                  <div className="space-y-3">
                    {gameSessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800/70 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-3xl">{getGameIcon(session.game_type)}</div>
                          <div>
                            <p className="font-semibold text-slate-100">{getGameName(session.game_type)}</p>
                            <p className="text-sm text-slate-400">{formatDate(session.created_at)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-cyan-400">+{session.points_earned}</p>
                          <p className="text-xs text-slate-400">points</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Gamepad2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No games played yet</p>
                    <p className="text-slate-500 text-sm mt-2">Start playing to see your history here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
