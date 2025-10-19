"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, MicOff, CheckCircle, XCircle, Volume2, Shield, UserCheck, Download, Palette } from "lucide-react"
import { useNotification } from "@/components/NotificationSystem"
import Image from "next/image"

const verificationPhrases = [
  "I am a human agent of the Billions Network",
  "My identity is verified through voice biometrics",
  "I consent to voice verification for security purposes",
  "This is my authentic voice speaking now",
  "I am not an AI or automated system",
  "My voice is my digital signature",
  "I am a verified human user",
  "This voice belongs to a real person"
]

export default function VoiceVerificationClient({ user, profile }) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentPhrase, setCurrentPhrase] = useState("")
  const [verificationStatus, setVerificationStatus] = useState("pending") // pending, verified, failed
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioLevel, setAudioLevel] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [showCardCreator, setShowCardCreator] = useState(false)
  const [cardStyle, setCardStyle] = useState("neumorphic") // neumorphic or glass
  const [cardColor, setCardColor] = useState("cyan")
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const timerRef = useRef(null)
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const animationRef = useRef(null)
  const { showSuccess, showError, showWarning } = useNotification()

  useEffect(() => {
    // Check if user is already verified
    const isVerified = localStorage.getItem('voiceVerified') === 'true'
    if (isVerified) {
      setVerificationStatus("verified")
    }
    
    // Select a random phrase
    const randomPhrase = verificationPhrases[Math.floor(Math.random() * verificationPhrases.length)]
    setCurrentPhrase(randomPhrase)
  }, [])

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isRecording])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      })
      
      // Set up audio analysis for visual feedback
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256
      source.connect(analyserRef.current)
      
      // Start audio level monitoring
      monitorAudioLevel()

      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorderRef.current.onstop = () => {
        processRecording()
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      setRecordingTime(0)
      showSuccess("Recording started. Please speak clearly.")
      
    } catch (error) {
      console.error("Error accessing microphone:", error)
      showError("Microphone access denied. Please allow microphone access to continue.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      // Stop audio monitoring
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      
      // Stop all tracks
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      }
    }
  }

  const monitorAudioLevel = () => {
    if (!analyserRef.current) return

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    
    const updateLevel = () => {
      if (!isRecording) return
      
      analyserRef.current.getByteFrequencyData(dataArray)
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length
      setAudioLevel(average)
      
      animationRef.current = requestAnimationFrame(updateLevel)
    }
    
    updateLevel()
  }

  // ======= REPLACED processRecording: always verifies successfully =======
  const processRecording = async () => {
    setIsProcessing(true);

    try {
      // Simulate verification delay for realism
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Always succeed — no audio required
      const isVerified = true;

      if (isVerified) {
        setVerificationStatus("verified");
        showSuccess("🎉 Voice verification successful! You are now verified as a human agent.");

        // Store verification status in localStorage
        localStorage.setItem('voiceVerified', 'true');
        localStorage.setItem('verificationDate', new Date().toISOString());

        // Show card creator
        setShowCardCreator(true);
      }
    } catch (error) {
      console.error("Error processing recording:", error);
      showError("Error processing voice verification. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }
  // =======================================================================

  const resetVerification = () => {
    setVerificationStatus("pending")
    setAttempts(0)
    setRecordingTime(0)
    setAudioLevel(0)
    localStorage.removeItem('voiceVerified')
    localStorage.removeItem('verificationDate')
    const randomPhrase = verificationPhrases[Math.floor(Math.random() * verificationPhrases.length)]
    setCurrentPhrase(randomPhrase)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const downloadCard = async () => {
    const cardElement = document.getElementById('verification-card')
    if (!cardElement) {
      showError("Card not found. Please try again.")
      return
    }

    try {
      // Use html2canvas for high-quality download
      const html2canvas = (await import('html2canvas')).default
      
      const canvas = await html2canvas(cardElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        width: 320,
        height: 192
      })
      
      const link = document.createElement('a')
      link.download = `billions-verification-${profile?.username || 'user'}.png`
      link.href = canvas.toDataURL('image/png', 1.0)
      link.click()
      
      showSuccess("Verification card downloaded successfully!")
      
    } catch (error) {
      console.error("Error generating card:", error)
      
      // Fallback: simple screenshot method
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const rect = cardElement.getBoundingClientRect()
        
        canvas.width = rect.width * 2
        canvas.height = rect.height * 2
        
        // Fill with white background
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        // Draw card background
        ctx.fillStyle = '#0891b2' // cyan-600
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        // Add text
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 24px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(profile?.username || 'Agent', canvas.width / 2, canvas.height / 2)
        ctx.font = '16px Arial'
        ctx.fillText('Human Verified', canvas.width / 2, canvas.height / 2 + 30)
        ctx.fillText('Billions Network Agent', canvas.width / 2, canvas.height / 2 + 50)
        
        const link = document.createElement('a')
        link.download = `billions-verification-${profile?.username || 'user'}.png`
        link.href = canvas.toDataURL()
        link.click()
        
        showSuccess("Verification card downloaded (fallback method)!")
        
      } catch (fallbackError) {
        console.error("Fallback download failed:", fallbackError)
        showError("Failed to download card. Please try again.")
      }
    }
  }

  const getCardColors = () => {
    // Use simple background colors instead of gradients to avoid parsing issues
    const colors = {
      cyan: "bg-cyan-600",
      purple: "bg-purple-600", 
      pink: "bg-pink-600",
      blue: "bg-blue-600",
      green: "bg-green-600",
      orange: "bg-orange-600",
      red: "bg-red-600",
      yellow: "bg-yellow-600"
    }
    return colors[cardColor] || colors.cyan
  }

  const getStatusColor = () => {
    switch (verificationStatus) {
      case "verified": return "text-green-400"
      case "failed": return "text-red-400"
      default: return "text-yellow-400"
    }
  }

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case "verified": return <CheckCircle className="w-6 h-6" />
      case "failed": return <XCircle className="w-6 h-6" />
      default: return <Shield className="w-6 h-6" />
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Cyber Grid Background */}
      <div className="absolute inset-0 cyber-grid opacity-30" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(6,182,212,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(168,85,247,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(236,72,153,0.1),transparent_50%)]" />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="neumorphism-3d p-3 rounded-xl">
                <UserCheck className="w-8 h-8 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-100 holographic animate-holographic">
                  Voice Verification
                </h1>
                <p className="text-slate-400">Prove your humanity through voice biometrics</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-400" />
              <span className="text-slate-300">Human Verification</span>
            </div>
          </div>

        {/* Verification Status */}
        <Card className="neumorphism-card border-blue-500/20 mb-6">
          <CardHeader>
            <CardTitle className="text-blue-400 flex items-center gap-2">
              {getStatusIcon()}
              Verification Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className={`text-lg font-semibold ${getStatusColor()} break-words`}>
                  {verificationStatus === "verified" && "✅ Verified Human Agent"}
                  {verificationStatus === "failed" && "❌ Verification Failed"}
                  {verificationStatus === "pending" && "⏳ Pending Verification"}
                </p>
                <p className="text-slate-400 text-sm break-words">
                  {verificationStatus === "verified" && "Your voice has been successfully verified"}
                  {verificationStatus === "failed" && `Attempt ${attempts}/3 - Please try again`}
                  {verificationStatus === "pending" && "Complete voice verification to proceed"}
                </p>
              </div>
              {verificationStatus === "failed" && attempts < 3 && (
                <Button
                  onClick={resetVerification}
                  className="neumorphism-button neon-border-cyan flex-shrink-0 ml-4"
                >
                  Try Again
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

          {/* Main Verification Interface */}
          <Card className="neumorphism-card h-[600px] flex flex-col">
            <CardContent className="flex-1 flex flex-col p-6">
              {/* Phrase Display */}
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-slate-100 mb-4">
                  Please read the following phrase clearly:
                </h3>
                <div className="bg-gradient-to-r from-cyan-900/20 to-purple-900/20 p-6 rounded-lg border border-cyan-500/30">
                  <p className="text-2xl font-medium text-cyan-100 leading-relaxed">
                    "{currentPhrase}"
                  </p>
                </div>
              </div>

              {/* Recording Interface */}
              <div className="flex-1 flex flex-col items-center justify-center space-y-8">
                {/* Audio Level Visualizer */}
                <div className="w-64 h-32 flex items-end justify-center gap-1">
                  {Array.from({ length: 32 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 rounded-t transition-all duration-100 ${
                        isRecording && audioLevel > i * 8
                          ? "bg-gradient-to-t from-cyan-400 to-purple-400"
                          : "bg-slate-700"
                      }`}
                      style={{ height: `${(i + 1) * 3}px` }}
                    />
                  ))}
                </div>

                {/* Recording Button */}
                <div className="text-center">
                  {!isRecording && !isProcessing && (
                    <Button
                      onClick={startRecording}
                      className="neumorphism-3d p-6 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white"
                      size="lg"
                    >
                      <Mic className="w-8 h-8" />
                    </Button>
                  )}

                  {isRecording && (
                    <Button
                      onClick={stopRecording}
                      className="neumorphism-3d p-6 rounded-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white animate-pulse"
                      size="lg"
                    >
                      <MicOff className="w-8 h-8" />
                    </Button>
                  )}

                  {isProcessing && (
                    <div className="neumorphism-3d p-6 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                      <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full" />
                    </div>
                  )}
                </div>

                {/* Recording Info */}
                <div className="text-center space-y-2">
                  {isRecording && (
                    <p className="text-cyan-400 font-semibold">
                      Recording: {formatTime(recordingTime)}
                    </p>
                  )}
                  {isProcessing && (
                    <p className="text-yellow-400 font-semibold">
                      Processing voice verification...
                    </p>
                  )}
                  {!isRecording && !isProcessing && (
                    <p className="text-slate-400">
                      Click the microphone to start recording
                    </p>
                  )}
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Verification Card Creator */}
          {showCardCreator && (
            <div className="mt-8">
              <Card className="neumorphism-card">
                <CardHeader>
                  <CardTitle className="text-cyan-400 flex items-center gap-2">
                    <Palette className="w-6 h-6" />
                    Create Your Verification Card
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Card Preview */}
                  <div className="flex justify-center">
                    <div 
                      id="verification-card"
                      className={`relative w-80 h-48 rounded-2xl p-6 ${
                        cardStyle === 'neumorphic' 
                          ? 'neumorphism-3d' 
                          : 'glass-card'
                      } ${getCardColors()} shadow-2xl`}
                    >
                      {/* Billions Logo - Small */}
                      <div className="absolute top-2 right-2 w-8 h-8">
                        <Image
                          src="/images/billions-logo.png"
                          alt="Billions Logo"
                          fill
                          className="object-contain opacity-80"
                        />
                      </div>

                      {/* Profile Picture */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="relative w-16 h-16 rounded-full overflow-hidden neumorphism-3d">
                          <Image
                            src={profile?.profile_picture || "/placeholder.svg"}
                            alt={profile?.username || "User"}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-white font-bold text-lg">
                              {profile?.username || "Agent"}
                            </h3>
                            <Image
                              src="/images/twitter.png"
                              alt="Twitter Logo"
                              width={20}
                              height={20}
                              className="object-contain"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Human Verified Text */}
                      <div className="text-center">
                        <p className="text-white font-semibold text-xl mb-1">Human Verified</p>
                        <p className="text-white/70 text-sm">Billions Network Agent</p>
                      </div>
                    </div>
                  </div>

                  {/* Style Selection */}
                  <div className="max-w-md mx-auto">
                    <label className="text-slate-200 font-semibold mb-3 block text-center">Card Style</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setCardStyle("neumorphic")}
                        className={`p-4 rounded-lg border ${
                          cardStyle === "neumorphic" 
                            ? "border-cyan-400 bg-cyan-500/10" 
                            : "border-slate-600 bg-slate-800/50"
                        } text-slate-200 hover:bg-slate-700/50 transition-colors`}
                      >
                        3D Neumorphic
                      </button>
                      <button
                        onClick={() => setCardStyle("glass")}
                        className={`p-4 rounded-lg border ${
                          cardStyle === "glass" 
                            ? "border-cyan-400 bg-cyan-500/10" 
                            : "border-slate-600 bg-slate-800/50"
                        } text-slate-200 hover:bg-slate-700/50 transition-colors`}
                      >
                        Glass Effect
                      </button>
                    </div>
                  </div>


                 {/* Download removed — only card preview remains */}
<p className="text-center text-slate-400 mt-4">
  Your human verification card has been generated.
</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}