"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Crown, Star, Zap } from "lucide-react"

export default function LevelDisplay({ user, profile, className = "" }) {
  const [levelData, setLevelData] = useState({
    level: profile?.level || 1,
    experience: profile?.experience || 0,
    totalGames: profile?.total_games_played || 0
  })

  const getExpForNextLevel = (currentLevel) => {
    const levelThresholds = {
      1: 100, 2: 250, 3: 450, 4: 700, 5: 1000,
      6: 1350, 7: 1750, 8: 2200, 9: 2700, 10: 3250,
      11: 3850, 12: 4500, 13: 5200, 14: 5950, 15: 6750,
      16: 7600, 17: 8500, 18: 9450, 19: 10450, 20: 10450
    }
    return levelThresholds[currentLevel] || 10450
  }

  const getExpForCurrentLevel = (currentLevel) => {
    const levelThresholds = {
      1: 0, 2: 100, 3: 250, 4: 450, 5: 700,
      6: 1000, 7: 1350, 8: 1750, 9: 2200, 10: 2700,
      11: 3250, 12: 3850, 13: 4500, 14: 5200, 15: 5950,
      16: 6750, 17: 7600, 18: 8500, 19: 9450, 20: 10450
    }
    return levelThresholds[currentLevel] || 0
  }

  const getProgressPercentage = () => {
    const currentLevelExp = getExpForCurrentLevel(levelData.level)
    const nextLevelExp = getExpForNextLevel(levelData.level)
    const currentExp = levelData.experience - currentLevelExp
    const expNeeded = nextLevelExp - currentLevelExp
    
    if (levelData.level >= 10) return 100
    return Math.min((currentExp / expNeeded) * 100, 100)
  }

  const getLevelColor = (level) => {
    if (level >= 15) return "text-purple-400"
    if (level >= 10) return "text-blue-400"
    if (level >= 6) return "text-green-400"
    if (level >= 3) return "text-yellow-400"
    return "text-slate-400"
  }

  const getLevelIcon = (level) => {
    if (level >= 15) return <Crown className="w-4 h-4" />
    if (level >= 8) return <Star className="w-4 h-4" />
    return <Zap className="w-4 h-4" />
  }

  const refreshLevelData = async () => {
    if (!user) return
    
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from("profiles")
        .select("level, experience, total_games_played")
        .eq("id", user.id)
        .single()
      
      if (data) {
        setLevelData({
          level: data.level || 1,
          experience: data.experience || 0,
          totalGames: data.total_games_played || 0
        })
      }
    } catch (error) {
      console.error("Error fetching level data:", error)
    }
  }

  useEffect(() => {
    refreshLevelData()
  }, [user, profile])

  if (!user) return null

  return (
    <div className={`neumorphism-card p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`neumorphism-3d p-1 rounded-lg ${getLevelColor(levelData.level)}`}>
            {getLevelIcon(levelData.level)}
          </div>
          <div>
            <h3 className="text-slate-100 font-semibold">Level {levelData.level}</h3>
            <p className="text-xs text-slate-400">{levelData.totalGames} games played</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-300">{levelData.experience} XP</p>
          {levelData.level < 10 && (
            <p className="text-xs text-slate-500">
              {getExpForNextLevel(levelData.level) - levelData.experience} to next level
            </p>
          )}
        </div>
      </div>
      
      {levelData.level < 20 && (
        <div className="w-full bg-slate-800/50 rounded-full h-2 mb-2">
          <div 
            className="bg-gradient-to-r from-cyan-400 to-purple-400 h-2 rounded-full transition-all duration-500"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
      )}
      
      <div className="text-xs text-slate-500">
        {levelData.level >= 3 ? (
          <span className="text-green-400">✓ Community chat unlocked</span>
        ) : (
          <span>Reach level 3 to unlock community chat</span>
        )}
      </div>
    </div>
  )
}
