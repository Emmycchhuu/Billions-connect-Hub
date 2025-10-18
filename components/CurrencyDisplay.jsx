"use client"

import { useEffect, useState } from "react"

export default function CurrencyDisplay({ 
  amount, 
  size = "lg", 
  showIcon = true, 
  animate = false,
  className = "" 
}) {
  const [displayAmount, setDisplayAmount] = useState(amount)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (animate && displayAmount !== amount) {
      setIsAnimating(true)
      // Animate the number change
      const startAmount = displayAmount
      const endAmount = amount
      const duration = 1000
      const startTime = Date.now()

      const animateValue = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4)
        const currentAmount = Math.round(startAmount + (endAmount - startAmount) * easeOutQuart)
        
        setDisplayAmount(currentAmount)
        
        if (progress < 1) {
          requestAnimationFrame(animateValue)
        } else {
          setIsAnimating(false)
        }
      }
      
      animateValue()
    } else {
      setDisplayAmount(amount)
    }
  }, [amount, animate])

  const formatAmount = (num) => {
    if (!num || isNaN(num)) return "0"
    const number = Number(num)
    if (number >= 1000000) {
      return (number / 1000000).toFixed(1) + "M"
    } else if (number >= 1000) {
      return (number / 1000).toFixed(1) + "K"
    }
    return number.toLocaleString()
  }

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "text-sm"
      case "md":
        return "text-base"
      case "lg":
        return "text-lg"
      case "xl":
        return "text-xl"
      case "2xl":
        return "text-2xl"
      case "3xl":
        return "text-3xl"
      default:
        return "text-lg"
    }
  }

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      {showIcon && (
        <span className="text-cyan-400 font-bold animate-pulse-glow">
          ₿
        </span>
      )}
      <span 
        className={`
          font-mono font-bold text-cyan-400
          ${getSizeClasses()}
          ${isAnimating ? "animate-pulse" : ""}
          ${animate ? "transition-all duration-300" : ""}
        `}
        style={{
          textShadow: "0 0 10px rgba(6, 182, 212, 0.5)",
          filter: "brightness(1.1)"
        }}
      >
        {formatAmount(displayAmount)}
      </span>
    </div>
  )
}

// Special component for displaying points with currency feel
export function PointsDisplay({ 
  points, 
  showChange = false, 
  changeAmount = 0,
  className = "" 
}) {
  const [showChangeAnimation, setShowChangeAnimation] = useState(false)

  useEffect(() => {
    if (showChange && changeAmount !== 0) {
      setShowChangeAnimation(true)
      setTimeout(() => setShowChangeAnimation(false), 2000)
    }
  }, [changeAmount, showChange])

  return (
    <div className={`relative ${className}`}>
      <CurrencyDisplay 
        amount={points} 
        size="2xl" 
        animate={true}
        className="font-bold"
      />
      
      {showChange && changeAmount !== 0 && (
        <div
          className={`
            absolute -top-8 left-1/2 transform -translate-x-1/2
            px-2 py-1 rounded-full text-sm font-bold
            transition-all duration-500 ease-out
            ${showChangeAnimation 
              ? "opacity-100 translate-y-0" 
              : "opacity-0 -translate-y-2"
            }
            ${changeAmount > 0 
              ? "bg-green-500/20 text-green-400 border border-green-500/30" 
              : "bg-red-500/20 text-red-400 border border-red-500/30"
            }
          `}
        >
          {changeAmount > 0 ? "+" : ""}{changeAmount}
        </div>
      )}
    </div>
  )
}

// Component for displaying currency in game cards
export function GameCurrencyDisplay({ amount, size = "md" }) {
  return (
    <div className="inline-flex items-center gap-1 bg-slate-800/50 px-2 py-1 rounded-full border border-cyan-500/20">
      <span className="text-cyan-400 font-bold text-xs">₿</span>
      <span className={`font-mono font-semibold text-cyan-400 ${size === "sm" ? "text-xs" : "text-sm"}`}>
        {amount.toLocaleString()}
      </span>
    </div>
  )
}
