"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useNotification } from "@/components/NotificationSystem"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, Users, Gift, Share2 } from "lucide-react"

export default function ReferralSystem({ user, profile }) {
  const [referralCode, setReferralCode] = useState("")
  const [referralCount, setReferralCount] = useState(0)
  const [referralEarnings, setReferralEarnings] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [referralLink, setReferralLink] = useState("")
  const { showSuccess, showError } = useNotification()

  useEffect(() => {
    if (user) {
      // Generate or get referral code
      const code = `BILLIONS-${user.id.slice(-8).toUpperCase()}`
      setReferralCode(code)
      
      // Set referral link on client side to avoid hydration issues
      if (typeof window !== 'undefined') {
        setReferralLink(`${window.location.origin}/auth/sign-up?ref=${code}`)
      }
      
      // Get referral stats
      loadReferralStats()
    }
  }, [user])

  const loadReferralStats = async () => {
    try {
      const supabase = createClient()
      
      // Get referral count and earnings from database
      const { data: referrals } = await supabase
        .from("profiles")
        .select("referral_code, referral_count, referral_earnings")
        .eq("id", user.id)
        .single()

      if (referrals) {
        setReferralCount(referrals.referral_count || 0)
        setReferralEarnings(referrals.referral_earnings || 0)
      }
    } catch (error) {
      console.error("Error loading referral stats:", error)
    }
  }

  const copyReferralLink = async () => {
    if (typeof window === 'undefined' || !referralLink) return
    
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      showSuccess("Referral link copied to clipboard!")
      
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      showError("Failed to copy referral link")
    }
  }

  const shareReferral = async () => {
    if (typeof window === 'undefined' || !referralLink) return
    
    const shareText = `Join me on Billions Game Hub! Use my referral code: ${referralCode} and get bonus points when you sign up!`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join Billions Game Hub",
          text: shareText,
          url: referralLink,
        })
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to copying
      copyReferralLink()
    }
  }

  const handleReferralInput = (e) => {
    const value = e.target.value
    if (value && value.startsWith("BILLIONS-")) {
      // User entered a referral code
      localStorage.setItem("referral_code", value)
      showInfo("Referral code saved! You'll get bonus points when you sign up.")
    }
  }

  return (
    <Card className="glass-card border-cyan-500/20 animate-scale-in">
      <CardHeader>
        <CardTitle className="text-cyan-400 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Referral System
        </CardTitle>
        <CardDescription className="text-slate-400">
          Invite friends and earn ₿200 for each successful referral
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Referral Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 rounded-lg bg-slate-800/50 border border-cyan-500/20">
            <div className="text-2xl font-bold text-cyan-400">{referralCount}</div>
            <div className="text-sm text-slate-400">Friends Referred</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-slate-800/50 border border-cyan-500/20">
            <div className="text-2xl font-bold text-green-400">₿{referralEarnings}</div>
            <div className="text-sm text-slate-400">Earned from Referrals</div>
          </div>
        </div>

        {/* Your Referral Code */}
        <div className="space-y-3">
          <Label className="text-slate-300">Your Referral Code</Label>
          <div className="flex gap-2">
            <Input
              value={referralCode}
              readOnly
              className="neumorphism-card border-cyan-500/30 text-cyan-400 font-mono"
            />
            <Button
              onClick={copyReferralLink}
              className="neumorphism-button px-4"
              disabled={copied}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Referral Link */}
        <div className="space-y-3">
          <Label className="text-slate-300">Your Referral Link</Label>
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <p className="text-sm text-slate-400 break-all">
              {referralLink || "Loading..."}
            </p>
            <p className="text-xs text-slate-500 mt-2">
              💡 When shared, this link will show your referral code in the preview!
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={shareReferral}
            className="flex-1 neumorphism-button text-white font-semibold"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button
            onClick={copyReferralLink}
            className="flex-1 neumorphism-button text-white font-semibold"
            disabled={copied}
          >
            <Copy className="w-4 h-4 mr-2" />
            {copied ? "Copied!" : "Copy Link"}
          </Button>
        </div>

        {/* Referral Benefits */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20">
          <h4 className="text-cyan-400 font-semibold mb-2 flex items-center gap-2">
            <Gift className="w-4 h-4" />
            Referral Rewards
          </h4>
          <ul className="text-sm text-slate-300 space-y-1">
            <li>• You earn ₿200 for each friend who signs up</li>
            <li>• Your friend gets ₿100 bonus points on signup</li>
            <li>• Both get ₿50 bonus when they play their first game</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

// Component for entering referral code during signup
export function ReferralCodeInput({ onReferralCode }) {
  const [code, setCode] = useState("")
  const { showInfo } = useNotification()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (code.startsWith("BILLIONS-")) {
      onReferralCode(code)
      showInfo("Referral code applied! You'll get bonus points after signup.")
    } else {
      showError("Invalid referral code format")
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="referral-code" className="text-slate-300">
        Referral Code (Optional)
      </Label>
      <div className="flex gap-2">
        <Input
          id="referral-code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="BILLIONS-XXXXXXXX"
          className="neumorphism-card border-purple-500/30 text-slate-100"
          maxLength={17}
        />
        <Button
          onClick={handleSubmit}
          className="neumorphism-button px-4"
          disabled={!code.startsWith("BILLIONS-")}
        >
          Apply
        </Button>
      </div>
      <p className="text-xs text-slate-500">
        Get ₿100 bonus points when you sign up with a valid referral code
      </p>
    </div>
  )
}
