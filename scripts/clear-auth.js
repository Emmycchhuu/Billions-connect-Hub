// Script to clear Supabase auth cookies in development
// Run this if you're experiencing auth issues

if (typeof window !== 'undefined') {
  // Clear all Supabase-related cookies
  const cookiesToDelete = [
    'sb-nuipqdpeaprwaiitotci-auth-token',
    'sb-nuipqdpeaprwaiitotci-auth-token.0',
    'sb-nuipqdpeaprwaiitotci-auth-token.1',
    'sb-nuipqdpeaprwaiitotci-auth-token-code-verifier'
  ]
  
  cookiesToDelete.forEach(cookieName => {
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.localhost;`
  })
  
  console.log('Supabase auth cookies cleared')
  
  // Clear localStorage
  Object.keys(localStorage).forEach(key => {
    if (key.includes('supabase') || key.includes('sb-')) {
      localStorage.removeItem(key)
    }
  })
  
  console.log('Supabase localStorage cleared')
  
  // Reload the page
  window.location.reload()
}


