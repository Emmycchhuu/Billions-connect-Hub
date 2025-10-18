"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Trophy, Timer, Brain, CheckCircle2, XCircle } from "lucide-react"
import { playSound } from "@/lib/sounds"
import Link from "next/link"

const quizQuestions = [
  {
    id: 1,
    question: "What is Billions Network all about?",
    options: ["A TV show", "A decentralized Human & AI Network", "A crypto exchange", "A social media app"],
    correct: 1,
    points: 30,
  },
  {
    id: 2,
    question: "What makes Billions Network unique?",
    options: [
      "It uses face scans",
      "It focuses on privacy-preserving identity and reputation",
      "It sells user data",
      "It's only for AI agents",
    ],
    correct: 1,
    points: 30,
  },
  {
    id: 3,
    question: "Who launched Billions Network?",
    options: ["OpenAI", "Privado ID (formerly Polygon ID)", "Meta", "Google"],
    correct: 1,
    points: 30,
  },
  {
    id: 4,
    question: "What does Billions Network mainly focus on?",
    options: ["Entertainment", "Privacy and identity verification", "Advertising", "Social chatting"],
    correct: 1,
    points: 30,
  },
  {
    id: 5,
    question: "What is the main goal of Billions Network?",
    options: [
      "Build a metaverse",
      "Create meme tokens",
      "Build trust between humans and AI",
      "Replace all social media",
    ],
    correct: 2,
    points: 30,
  },
  {
    id: 6,
    question: "How does Billions Network protect your privacy?",
    options: [
      "Using Zero-Knowledge Proofs (ZKPs)",
      "Saving your data on cloud",
      "Face recognition",
      "Sharing info with partners",
    ],
    correct: 0,
    points: 30,
  },
  {
    id: 7,
    question: "Does Billions store your biometric data?",
    options: ["Yes", "No", "Only for VIP users", "Sometimes"],
    correct: 1,
    points: 30,
  },
  {
    id: 8,
    question: "What does ZKP stand for?",
    options: ["Zero Knowledge Points", "Zero-Knowledge Proofs", "Zone Key Process", "Zero Key Privacy"],
    correct: 1,
    points: 30,
  },
  {
    id: 9,
    question: "What problem does Billions solve?",
    options: ["Slow internet", "Fake accounts, bots, and deepfakes", "Expensive NFTs", "Gaming rewards"],
    correct: 1,
    points: 30,
  },
  {
    id: 10,
    question: "Why is trust important in a Human-AI world?",
    options: ["To sell NFTs", "To verify who's real online", "To mine Bitcoin", "To boost ads"],
    correct: 1,
    points: 30,
  },
  {
    id: 11,
    question: "What are 'sybil attacks'?",
    options: ["Attacks on blockchains", "Fake or duplicate accounts", "Wallet hacks", "Code bugs"],
    correct: 1,
    points: 30,
  },
  {
    id: 12,
    question: "How does Billions stop fake accounts?",
    options: [
      "By banning users",
      "By verifying humans with ZKPs",
      "By checking social media",
      "By using facial recognition",
    ],
    correct: 1,
    points: 30,
  },
  {
    id: 13,
    question: "What does 'proof of humanity' mean?",
    options: [
      "Showing your DNA",
      "A private way to prove you're human",
      "Sharing your passport photo",
      "Video call with an agent",
    ],
    correct: 1,
    points: 30,
  },
  {
    id: 14,
    question: "What does Billions verify with?",
    options: ["Only biometrics", "Phone + government ID", "Credit card", "Home address"],
    correct: 1,
    points: 30,
  },
  {
    id: 15,
    question: "What is the 'reputation layer'?",
    options: [
      "A layer for storing passwords",
      "A system that tracks verified actions",
      "A social ranking system",
      "An NFT marketplace",
    ],
    correct: 1,
    points: 30,
  },
  {
    id: 16,
    question: "What rewards can users earn?",
    options: ["Airdrops and loyalty perks", "Gift cards", "Physical prizes", "Points only"],
    correct: 0,
    points: 30,
  },
  {
    id: 17,
    question: "How many users is Billions targeting?",
    options: ["1 million", "10 million", "100 million", "1 billion+"],
    correct: 3,
    points: 30,
  },
  {
    id: 18,
    question: "Which companies use Billions technology?",
    options: ["TikTok, HSBC, Deutsche Bank", "Instagram, Uber, Amazon", "X, Meta, Reddit", "Only startups"],
    correct: 0,
    points: 30,
  },
  {
    id: 19,
    question: "How much funding did Billions raise?",
    options: ["$10M", "$20M", "$30M", "$50M"],
    correct: 2,
    points: 30,
  },
  {
    id: 20,
    question: "Who invested in Billions?",
    options: [
      "Founders Fund, Pantera Capital, Framework Ventures",
      "Apple and Meta",
      "Binance and Coinbase",
      "Amazon and Google",
    ],
    correct: 0,
    points: 30,
  },
]

export default function QuizGame({ user, profile }) {
  const router = useRouter()
  const [gameState, setGameState] = useState("ready") // ready, playing, finished
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [score, setScore] = useState(0)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [timeLeft, setTimeLeft] = useState(15)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  useEffect(() => {
    if (gameState === "playing" && !showResult && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (gameState === "playing" && !showResult && timeLeft === 0) {
      handleTimeout()
    }
  }, [gameState, timeLeft, showResult])

  const startGame = () => {
    playSound("click")
    setGameState("playing")
    setCurrentQuestion(0)
    setScore(0)
    setCorrectAnswers(0)
    setTimeLeft(15)
    setSelectedAnswer(null)
    setShowResult(false)
  }

  const handleTimeout = () => {
    playSound("lose")
    setShowResult(true)
    setIsCorrect(false)

    setTimeout(() => {
      moveToNextQuestion()
    }, 2000)
  }

  const handleAnswerSelect = (answerIndex) => {
    if (showResult || selectedAnswer !== null) return

    playSound("click")
    setSelectedAnswer(answerIndex)

    const question = quizQuestions[currentQuestion]
    const correct = answerIndex === question.correct

    setIsCorrect(correct)
    setShowResult(true)

    if (correct) {
      playSound("win")
      const pointsEarned = question.points + timeLeft * 2
      setScore(score + pointsEarned)
      setCorrectAnswers(correctAnswers + 1)
    } else {
      playSound("lose")
    }

    setTimeout(() => {
      moveToNextQuestion()
    }, 2000)
  }

  const moveToNextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setShowResult(false)
      setTimeLeft(15)
    } else {
      finishGame()
    }
  }

  const finishGame = async () => {
    setGameState("finished")

    // Save to database
    const supabase = createClient()
    await supabase.from("game_sessions").insert({
      user_id: user.id,
      game_type: "quiz",
      points_earned: score,
      game_data: { correctAnswers, totalQuestions: quizQuestions.length },
    })

    // Update user points
    await supabase
      .from("profiles")
      .update({ total_points: (profile?.total_points || 0) + score })
      .eq("id", user.id)

    // Refresh profile data
    const { data: updatedProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
    
    if (updatedProfile) {
      window.dispatchEvent(new CustomEvent('profileUpdated', { detail: updatedProfile }))
    }

    // Add experience points
    try {
      await fetch("/api/add-experience", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          gameType: "quiz",
          pointsEarned: score
        })
      })
    } catch (error) {
      console.warn("Error adding experience:", error)
    }
  }

  const goToDashboard = () => {
    playSound("click")
    router.push("/dashboard")
  }

  const question = quizQuestions[currentQuestion]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(236,72,153,0.1),transparent_50%)]" />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <Link href="/dashboard">
            <Button
              variant="outline"
              className="border-pink-500/50 text-pink-400 hover:bg-pink-500/10 bg-transparent"
              onMouseEnter={() => playSound("hover")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Hub
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-pink-500/20 rounded-lg px-4 py-2">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-pink-400" />
                <span className="text-sm text-slate-400">Q:</span>
                <span className="text-lg font-bold text-pink-400">
                  {currentQuestion + 1}/{quizQuestions.length}
                </span>
              </div>
            </div>
            <div className="bg-slate-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-lg px-4 py-2">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span className="text-lg font-bold text-cyan-400">{score}</span>
              </div>
            </div>
          </div>
        </div>

        {gameState === "ready" && (
          <div className="max-w-2xl mx-auto">
            <Card className="bg-slate-900/80 backdrop-blur-xl border-pink-500/20">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent mb-4">
                  Billions Quiz
                </CardTitle>
                <CardDescription className="text-slate-300 text-lg leading-relaxed">
                  Test your knowledge about Billions Network. Answer quickly to earn bonus points!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-slate-800/50 rounded-lg p-6 space-y-4">
                  <h3 className="text-pink-400 font-semibold text-lg">How to Play:</h3>
                  <ul className="space-y-2 text-slate-300">
                    <li className="flex items-start gap-2">
                      <span className="text-pink-400 mt-1">•</span>
                      <span>Answer {quizQuestions.length} questions about Billions Network</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-pink-400 mt-1">•</span>
                      <span>You have 15 seconds per question</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-pink-400 mt-1">•</span>
                      <span>Faster answers earn more bonus points</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-pink-400 mt-1">•</span>
                      <span>Earn 30-60 points per correct answer</span>
                    </li>
                  </ul>
                </div>
                <Button
                  onClick={startGame}
                  className="w-full bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-white font-semibold py-6 text-lg"
                >
                  Start Quiz
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {gameState === "playing" && (
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex justify-center">
              <div className="bg-slate-900/80 backdrop-blur-xl border border-pink-500/20 rounded-lg px-8 py-4">
                <div className="flex items-center gap-3">
                  <Timer className={`w-6 h-6 ${timeLeft <= 5 ? "text-red-400 animate-pulse" : "text-pink-400"}`} />
                  <span className="text-3xl font-bold text-pink-400">{timeLeft}s</span>
                </div>
              </div>
            </div>

            <Card className="bg-slate-900/80 backdrop-blur-xl border-pink-500/20">
              <CardHeader>
                <CardTitle className="text-lg md:text-2xl text-slate-100 leading-relaxed break-words">{question.question}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {question.options.map((option, index) => {
                  let buttonClass = "bg-slate-800/50 hover:bg-slate-700/50 text-slate-100 border-slate-700/50"

                  if (showResult) {
                    if (index === question.correct) {
                      buttonClass = "bg-green-500/20 border-green-500 text-green-400"
                    } else if (index === selectedAnswer) {
                      buttonClass = "bg-red-500/20 border-red-500 text-red-400"
                    }
                  } else if (selectedAnswer === index) {
                    buttonClass = "bg-pink-500/20 border-pink-500 text-pink-400"
                  }

                  return (
        <Button
          key={index}
          onClick={() => handleAnswerSelect(index)}
          disabled={showResult || selectedAnswer !== null}
          className={`w-full py-4 md:py-6 text-sm md:text-lg justify-start text-left ${buttonClass} transition-all duration-300 min-h-[60px] md:min-h-[80px] overflow-hidden`}
          variant="outline"
          onMouseEnter={() => playSound("hover")}
        >
          <div className="flex items-start gap-3 w-full min-w-0">
            <span className="font-bold flex-shrink-0 mt-1">{String.fromCharCode(65 + index)}.</span>
            <span className="flex-1 text-left break-words leading-relaxed overflow-wrap-anywhere hyphens-auto">{option}</span>
            <div className="flex-shrink-0 ml-2">
              {showResult && index === question.correct && (
                <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-green-400" />
              )}
              {showResult && index === selectedAnswer && index !== question.correct && (
                <XCircle className="w-4 h-4 md:w-5 md:h-5 text-red-400" />
              )}
            </div>
          </div>
        </Button>
                  )
                })}
              </CardContent>
            </Card>

            {showResult && (
              <div className="text-center animate-in fade-in duration-500">
                <Card
                  className={`inline-block ${
                    isCorrect ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"
                  }`}
                >
                  <CardContent className="p-6">
                    <p className={`text-2xl font-bold ${isCorrect ? "text-green-400" : "text-red-400"}`}>
                      {isCorrect ? `+${question.points + timeLeft * 2} Points!` : "Incorrect"}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {gameState === "finished" && (
          <div className="max-w-2xl mx-auto">
            <Card className="bg-slate-900/80 backdrop-blur-xl border-cyan-500/20">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-cyan-500/20 flex items-center justify-center">
                  <Trophy className="w-12 h-12 text-cyan-400" />
                </div>
                <CardTitle className="text-3xl font-bold text-cyan-400 mb-2">Quiz Complete!</CardTitle>
                <CardDescription className="text-slate-300 text-lg">
                  You answered {correctAnswers} out of {quizQuestions.length} questions correctly
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-slate-800/50 rounded-lg p-8 text-center space-y-4">
                  <div>
                    <p className="text-slate-400 mb-2">Total Score</p>
                    <p className="text-5xl font-bold text-cyan-400">{score}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
                    <div>
                      <p className="text-slate-400 text-sm mb-1">Accuracy</p>
                      <p className="text-2xl font-bold text-pink-400">
                        {Math.round((correctAnswers / quizQuestions.length) * 100)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm mb-1">Correct</p>
                      <p className="text-2xl font-bold text-green-400">
                        {correctAnswers}/{quizQuestions.length}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button
                    onClick={startGame}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-white font-semibold py-6"
                  >
                    Play Again
                  </Button>
                  <Button
                    onClick={goToDashboard}
                    variant="outline"
                    className="flex-1 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 bg-transparent py-6"
                  >
                    Back to Hub
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
