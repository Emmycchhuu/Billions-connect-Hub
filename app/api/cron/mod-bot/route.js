import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request) {
  try {
    const supabase = createClient()
    
    // Check if there's already an active question
    const { data: activeQuestion } = await supabase
      .from("mod_bot_sessions")
      .select("*")
      .eq("is_answered", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (activeQuestion) {
      return NextResponse.json({ 
        message: "There's already an active question",
        activeQuestion 
      })
    }

    // Check if we've asked too many questions recently (max 7 per 24 hours)
    const { data: recentQuestions } = await supabase
      .from("mod_bot_sessions")
      .select("*")
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    if (recentQuestions && recentQuestions.length >= 7) {
      return NextResponse.json({ 
        message: "Maximum questions per day reached (7)" 
      })
    }

    // Get a random question that hasn't been asked recently
    const { data: questionData, error: questionError } = await supabase
      .rpc("get_random_mod_question")

    if (questionError || !questionData || questionData.length === 0) {
      return NextResponse.json({ 
        message: "No questions available" 
      })
    }

    const question = questionData[0]

    // Create a new mod bot session
    const { data: session, error: sessionError } = await supabase
      .from("mod_bot_sessions")
      .insert({
        question_id: question.question_id,
        question_text: question.question_text,
        correct_answer: question.correct_answer,
        points_reward: question.points_reward
      })
      .select()
      .single()

    if (sessionError) {
      console.error("Error creating mod bot session:", sessionError)
      return NextResponse.json({ error: "Failed to create question session" }, { status: 500 })
    }

    // Send the question to chat
    const { error: messageError } = await supabase
      .from("chat_messages")
      .insert({
        user_id: null, // Bot message
        username: "Mod Bot",
        profile_picture: "/images/billions-logo.png",
        message: `🤖 **Question Time!**\n\n${question.question_text}\n\nFirst correct answer wins ${question.points_reward} points! 🏆`
      })

    if (messageError) {
      console.error("Error sending bot message:", messageError)
    }

    return NextResponse.json({ 
      success: true,
      question: session,
      message: "Question posted successfully"
    })

  } catch (error) {
    console.error("Error in mod bot cron:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
