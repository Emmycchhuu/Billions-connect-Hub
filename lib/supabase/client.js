import { createBrowserClient } from "@supabase/ssr"

let client = null

export function createClient() {
  if (client) return client

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // In development, avoid throwing from client code which causes Next's
    // overlay and unhandled errors. Provide a safe, no-op client that
    // responds with empty results for queries so the UI can handle
    // the missing configuration more gracefully.
    console.warn("[v0] Supabase credentials missing for browser client. Returning noop client.")

    const chain = {
      // chainable query methods
      from() { return chain },
      select() { return chain },
      eq() { return chain },
      order() { return chain },
      limit() { return chain },
      single() { return chain },
      insert() { return chain },
      update() { return chain },
      rpc() { return chain },
      // simple channel stub
      channel() { return { on() { return { subscribe() { return { } } } } } },
      // make it thenable so `await client.from(...).select(...)` resolves
      then(resolve) { resolve({ data: [], error: null }) },
      catch() { return chain }
    }

    client = chain
    return client
  }

  client = createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    },
    global: {
      headers: {
        'X-Client-Info': 'billions-game-hub'
      }
    }
  })

  return client
}
