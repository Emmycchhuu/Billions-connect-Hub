"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Microphone, Check, X } from "lucide-react"
import { useNotification } from "@/components/NotificationSystem"

export default function VoiceVerification({ user, profile }) {
  const [questions] = useState([
    "Please say: I am a human and I agree to the community rules.",
    "Please say: I verify that I am a real person.",
    "Please say: Billions values privacy and honest interactions.",
    "Please say: I accept the code of conduct.",
    "Please say: I will not use bots to impersonate others.",
    "Please say: I am ready to join the Billions community.",
    "Please say: I confirm I will follow the rules.",
    "Please say: I am human and I respect other members.",
    "Please say: I understand verification protects the community.",
    "Please say: I pledge to be honest in this network."
  ])

  const [index, setIndex] = useState(0)
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [result, setResult] = useState(null) // null | true | false
  const [points, setPoints] = useState(() => {
    try {
      return Number(localStorage.getItem("voice_verification_points") || "0")
    } catch (e) {
      return 0
    }
  })
  const [verifiedSet, setVerifiedSet] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem("voice_verified_questions") || "[]"))
    } catch (e) {
      return new Set()
    }
  })

  const { showSuccess, showError, showWarning } = useNotification()
  const recognitionRef = useRef(null)

  useEffect(() => {
    const SpeechRecognition = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition)
    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.lang = "en-US"
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => setListening(true)
    recognition.onend = () => setListening(false)
    recognition.onerror = (e) => {
      console.warn("Speech recognition error:", e)
      setListening(false)
      showError("Speech recognition error: " + (e?.error || "unknown"))
    }
    recognition.onresult = (event) => {
      const text = Array.from(event.results).map(r => r[0].transcript).join(" ")
      setTranscript(text)
      evaluateAnswer(text)
    }

    recognitionRef.current = recognition

    return () => {
      try {
        recognition.stop()
      } catch (e) {}
    }
  }, [])

  const normalize = (s) => s
    .toLowerCase()
    .replace(/[\p{P}$+<=>^`|~]/gu, "")
    .replace(/\s+/g, " ")
    .trim()

  const levenshtein = (a, b) => {
    if (!a.length) return b.length
    if (!b.length) return a.length
    const matrix = Array.from({ length: a.length + 1 }, () => [])
    for (let i = 0; i <= a.length; i++) matrix[i][0] = i
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        )
      }
    }
    return matrix[a.length][b.length]
  }

  const similarity = (a, b) => {
    const na = normalize(a)
    const nb = normalize(b)
    if (!na.length && !nb.length) return 1
    const dist = levenshtein(na, nb)
    const maxLen = Math.max(na.length, nb.length)
    return 1 - dist / Math.max(1, maxLen)
  }

  const evaluateAnswer = (spoken) => {
    const expectedFull = questions[index]
    const expected = expectedFull.includes(":") ? expectedFull.split(":")[1].trim() : expectedFull
    const sim = similarity(spoken, expected)

    if (sim >= 0.85) {
      if (!verifiedSet.has(index)) {
        const award = 100
        const newPoints = points + award
        setPoints(newPoints)
        localStorage.setItem("voice_verification_points", String(newPoints))
        const newSet = new Set(Array.from(verifiedSet))
        newSet.add(index)
        setVerifiedSet(newSet)
        localStorage.setItem("voice_verified_questions", JSON.stringify(Array.from(newSet)))
      }
      setResult(true)
      showSuccess("Verified! You earned points.")
    } else {
      setResult(false)
      showWarning("Verification failed. Please try again and speak the phrase exactly.")
    }
  }

  const startListening = () => {
    setTranscript("")
    setResult(null)
    const recognition = recognitionRef.current
    if (!recognition) {
      showError("Speech recognition is not available in this browser.")
      return
    }
    try {
      recognition.start()
    } catch (e) {
      console.warn("Recognition start failed:", e)
      showError("Unable to start microphone. Check permissions.")
    }
  }

  const stopListening = () => {
    try {
      recognitionRef.current?.stop()
    } catch (e) {}
  }

  const nextQuestion = () => {
    setIndex((i) => (i + 1) % questions.length)
    setTranscript("")
    setResult(null)
  }

  const resetAll = () => {
    setPoints(0)
    setVerifiedSet(new Set())
    localStorage.removeItem("voice_verification_points")
    localStorage.removeItem("voice_verified_questions")
    showSuccess("Reset verification progress")
  }

  const currentQuestion = questions[index]

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 cyber-grid opacity-30" />
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-100">Voice Verification</h1>
              <p className="text-slate-400">Prove you're human by speaking the prompted phrase.</p>
            </div>
            <div className="text-right">
              <p className="text-slate-300">Points: <span className="font-semibold text-cyan-400">₿{points}</span></p>
              <p className="text-xs text-slate-500">Verified: {verifiedSet.size}/{questions.length}</p>
            </div>
          </div>

          <Card className="neumorphism-card p-6">
            <CardHeader>
              <CardTitle className="text-lg text-slate-100">Prompt {index + 1} of {questions.length}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-800/50 p-4 rounded-lg text-slate-100">
                <p className="whitespace-pre-wrap">{currentQuestion}</p>
              </div>

              <div className="flex flex-col items-center gap-3">
                <button
                  onMouseDown={startListening}
                  onMouseUp={stopListening}
                  onTouchStart={startListening}
                  onTouchEnd={stopListening}
                  className={`w-28 h-28 rounded-full flex items-center justify-center ${listening ? 'bg-red-500' : 'bg-cyan-500'} text-white shadow-lg`}
                  aria-pressed={listening}
                >
                  <Microphone className="w-8 h-8" />
                </button>

                <div className="text-sm text-slate-300">
                  {listening ? 'Listening... hold the button and speak clearly' : 'Hold the mic button and speak the phrase exactly'}
                </div>

                <div className="w-full">
                  <div className="p-3 rounded bg-slate-900/60 text-slate-200 min-h-[44px]">
                    {transcript || <span className="text-slate-500">Your spoken words will appear here</span>}
                  </div>
                </div>

                {result === true && (
                  <div className="text-green-400 flex items-center gap-2"><Check /> Verified</div>
                )}
                {result === false && (
                  <div className="text-yellow-400 flex items-center gap-2"><X /> Not matched</div>
                )}

                <div className="flex gap-3 mt-2">
                  <Button onClick={nextQuestion} className="neumorphism-button">Next Prompt</Button>
                  <Button onClick={resetAll} variant="outline" className="neumorphism-button">Reset</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
