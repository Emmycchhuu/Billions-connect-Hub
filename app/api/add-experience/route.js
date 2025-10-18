import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request) {
  try {
    const { userId, gameType, pointsEarned } = await request.json()

    if (!userId || !gameType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = createClient()
    
    // Get current user data
    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("experience, total_games_played, level")
      .eq("id", userId)
      .single()

    if (fetchError) {
      console.error("Error fetching profile:", fetchError)
      return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
    }

    // Calculate experience points based on game type
    const expPoints = {
      "impostor": 10,
      "spin": 5,
      "quiz": 8
    }

    const expToAdd = expPoints[gameType] || 5
    const newExperience = (profile.experience || 0) + expToAdd
    const newTotalGames = (profile.total_games_played || 0) + 1

    // Calculate new level
    const calculateLevel = (exp) => {
      if (exp < 100) return 1
      if (exp < 250) return 2
      if (exp < 450) return 3
      if (exp < 700) return 4
      if (exp < 1000) return 5
      if (exp < 1350) return 6
      if (exp < 1750) return 7
      if (exp < 2200) return 8
      if (exp < 2700) return 9
      if (exp < 3250) return 10
      if (exp < 3850) return 11
      if (exp < 4500) return 12
      if (exp < 5200) return 13
      if (exp < 5950) return 14
      if (exp < 6750) return 15
      if (exp < 7600) return 16
      if (exp < 8500) return 17
      if (exp < 9450) return 18
      if (exp < 10450) return 19
      return 20
    }

    const newLevel = calculateLevel(newExperience)
    const leveledUp = newLevel > (profile.level || 1)

    // Update profile with new experience and level
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        experience: newExperience,
        total_games_played: newTotalGames,
        level: newLevel,
        updated_at: new Date().toISOString()
      })
      .eq("id", userId)

    if (updateError) {
      console.error("Error updating profile:", updateError)
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      newLevel,
      newExperience,
      expGained: expToAdd,
      leveledUp,
      totalGames: newTotalGames
    })

  } catch (error) {
    console.error("Error in add-experience API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
