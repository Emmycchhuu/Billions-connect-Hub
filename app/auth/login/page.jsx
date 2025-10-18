"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("")
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false)
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState("")
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    console.log("[v0] Attempting login for:", email)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.log("[v0] Login error:", error)
        throw error
      }

      console.log("[v0] Login successful, user:", data.user?.email)

      window.location.href = "/dashboard"
    } catch (error) {
      console.log("[v0] Login failed:", error.message)
      setError(error.message)
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    const supabase = createClient()
    setForgotPasswordLoading(true)
    setForgotPasswordMessage("")

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error

      setForgotPasswordMessage("Password reset email sent! Check your inbox.")
      setForgotPasswordEmail("")
    } catch (error) {
      setForgotPasswordMessage("Error: " + error.message)
    } finally {
      setForgotPasswordLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 relative">
      <div className="absolute inset-0 cyber-grid" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1),transparent_50%)]" />
      <div className="w-full max-w-sm relative z-10">
        <Card className="glass-card border-cyan-500/20 animate-scale-in">
          <CardHeader>
            <CardTitle className="text-2xl font-bold holographic animate-holographic">
              Login to Billions
            </CardTitle>
            <CardDescription className="text-slate-400">
              Enter your credentials to access the gaming hub
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="flex flex-col gap-6">
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
                    className="neumorphism-card border-cyan-500/30 text-slate-100 placeholder:text-slate-500"
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
                    className="neumorphism-card border-cyan-500/30 text-slate-100"
                  />
                </div>
                {error && <p className="text-sm text-red-400">{error}</p>}
                <Button
                  type="submit"
                  className="w-full neumorphism-button text-white font-semibold neon-border animate-neon-border"
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm text-slate-400 space-y-2">
                <div>
                  {"Don't have an account? "}
                  <Link href="/auth/sign-up" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 neon-text">
                    Sign up
                  </Link>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(!showForgotPassword)}
                    className="text-purple-400 hover:text-purple-300 underline underline-offset-4 neon-text-purple"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>
            </form>

            {showForgotPassword && (
              <div className="mt-6 pt-6 border-t border-slate-700/50">
                <h3 className="text-lg font-semibold text-cyan-400 mb-4 neon-text animate-neon-pulse">
                  Reset Password
                </h3>
                <form onSubmit={handleForgotPassword}>
                  <div className="grid gap-2 mb-4">
                    <Label htmlFor="forgot-email" className="text-slate-200">
                      Email
                    </Label>
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder="agent@billions.com"
                      required
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      className="neumorphism-card border-purple-500/30 text-slate-100 placeholder:text-slate-500"
                    />
                  </div>
                  {forgotPasswordMessage && (
                    <p className={`text-sm mb-4 ${forgotPasswordMessage.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
                      {forgotPasswordMessage}
                    </p>
                  )}
                  <Button
                    type="submit"
                    className="w-full neumorphism-button text-white font-semibold neon-border animate-neon-border"
                    disabled={forgotPasswordLoading}
                  >
                    {forgotPasswordLoading ? "Sending..." : "Send Reset Email"}
                  </Button>
                </form>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
