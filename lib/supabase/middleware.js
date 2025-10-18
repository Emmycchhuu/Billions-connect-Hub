import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"

export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Get environment variables with fallbacks
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

  // If credentials aren't available, just pass through
  if (!supabaseUrl || !supabaseKey) {
    console.warn("Supabase credentials missing in middleware")
    return supabaseResponse
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    })

    // Only refresh session if there's an auth cookie
    const authCookie = request.cookies.get('sb-nuipqdpeaprwaiitotci-auth-token')
    if (authCookie) {
      // Add timeout to prevent hanging requests
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Auth timeout')), 5000)
      )
      
      const authPromise = supabase.auth.getUser()
      await Promise.race([authPromise, timeoutPromise])
    }

    return supabaseResponse
  } catch (error) {
    console.warn("Supabase middleware error:", error.message)
    // Clear potentially corrupted auth cookies
    supabaseResponse.cookies.delete('sb-nuipqdpeaprwaiitotci-auth-token')
    supabaseResponse.cookies.delete('sb-nuipqdpeaprwaiitotci-auth-token.0')
    supabaseResponse.cookies.delete('sb-nuipqdpeaprwaiitotci-auth-token.1')
    
    return supabaseResponse
  }
}
