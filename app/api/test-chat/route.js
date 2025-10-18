import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request) {
  try {
    const supabase = await createClient()
    
    // Test if chat_messages table exists and is accessible
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .limit(1)

    if (error) {
      return NextResponse.json({ 
        error: "Chat table error", 
        details: error.message,
        hint: error.hint,
        code: error.code
      }, { status: 500 })
    }

    // Test if we can insert a message
    const { data: insertData, error: insertError } = await supabase
      .from("chat_messages")
      .insert({
        user_id: null, // System message
        username: "System Test",
        message: "Community chat is working! 🎉"
      })
      .select()

    if (insertError) {
      return NextResponse.json({ 
        error: "Insert test failed", 
        details: insertError.message,
        hint: insertError.hint,
        code: insertError.code
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: "Community chat is working properly",
      testMessage: insertData[0]
    })

  } catch (error) {
    return NextResponse.json({ 
      error: "Server error", 
      details: error.message 
    }, { status: 500 })
  }
}
