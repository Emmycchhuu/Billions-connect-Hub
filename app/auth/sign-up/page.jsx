"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect, Suspense } from "react"
import { ReferralCodeInput } from "@/components/ReferralSystem"
import { useNotification } from "@/components/NotificationSystem"
import Image from "next/image"


function SignUpForm() {
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [referralCode, setReferralCode] = useState("")
  const [referrerName, setReferrerName] = useState("")
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showSuccess, showError } = useNotification()

  useEffect(() => {
    // Check for referral code in URL
    const refCode = searchParams.get('ref')
    if (refCode) {
      setReferralCode(refCode)
      // Fetch referrer's username
      fetchReferrerName(refCode)
    }
  }, [searchParams])

  const fetchReferrerName = async (refCode) => {
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from("profiles")
        .select("username")
        .eq("referral_code", refCode)
        .single()
      
      if (data) {
        setReferrerName(data.username)
      }
    } catch (error) {
      console.error("Error fetching referrer name:", error)
    }
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
          data: {
            username: username,
            referral_code: referralCode,
          },
        },
      })
      
      if (error) throw error

      // Show success message with referral info if applicable
      if (referralCode && referrerName) {
        showSuccess(`Account created successfully! You've been referred by ${referrerName}. Both of you will receive bonus points!`)
      } else {
        showSuccess("Account created successfully! Check your email for verification.")
      }
      router.push("/auth/sign-up-success")
    } catch (error) {
      setError(error.message)
      showError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 relative">
      <div className="absolute inset-0 cyber-grid" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.1),transparent_50%)]" />
      <div className="w-full max-w-sm relative z-10">
        <Card className="glass-card border-purple-500/20 animate-scale-in">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 relative">
              <Image
                src="/images/billions-logo.png"
                alt="Billions Logo"
                fill
                className="object-contain"
              />
            </div>
            <CardTitle className="text-2xl font-bold holographic animate-holographic">
              Join Billions
            </CardTitle>
            <CardDescription className="text-slate-400">Create your agent account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="username" className="text-slate-200">
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Agent Nova"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="neumorphism-card border-purple-500/30 text-slate-100 placeholder:text-slate-500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-slate-200">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="agent@billions.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="neumorphism-card border-purple-500/30 text-slate-100 placeholder:text-slate-500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password" className="text-slate-200">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="neumorphism-card border-purple-500/30 text-slate-100"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="repeat-password" className="text-slate-200">
                    Repeat Password
                  </Label>
                  <Input
                    id="repeat-password"
                    type="password"
                    required
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                    className="neumorphism-card border-purple-500/30 text-slate-100"
                  />
                </div>
                
                {/* Referrer Information */}
                {referrerName && (
                  <div className="p-4 bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-500/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <p className="text-green-400 font-semibold">
                        🎉 You've been referred by <span className="text-white">{referrerName}</span>!
                      </p>
                    </div>
                    <p className="text-slate-300 text-sm mt-1">
                      Both you and {referrerName} will receive bonus points when you complete signup!
                    </p>
                  </div>
                )}
                
                <ReferralCodeInput 
                  onReferralCode={setReferralCode}
                />
                
                {error && <p className="text-sm text-red-400">{error}</p>}
                <Button
                  type="submit"
                  className="w-full neumorphism-button text-white font-semibold neon-border animate-neon-border"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Sign up"}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm text-slate-400">
                {"Already have an account? "}
                <Link href="/auth/login" className="text-purple-400 hover:text-purple-300 underline underline-offset-4 neon-text-purple">
                  Login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen w-full items-center justify-center p-6 relative">
        <div className="absolute inset-0 cyber-grid" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.1),transparent_50%)]" />
        <div className="w-full max-w-sm relative z-10">
          <Card className="glass-card border-purple-500/20 animate-scale-in">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"></div>
                <p className="text-slate-400 mt-4">Loading...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <SignUpForm />
    </Suspense>
  )
}
