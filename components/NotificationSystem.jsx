"use client"

import { useState, useEffect, createContext, useContext } from "react"
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react"

const NotificationContext = createContext()

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    // Fail-safe: don't throw so components won't crash in dev if the provider
    // isn't mounted. Log a warning and return no-op functions.
    console.warn("useNotification called without a NotificationProvider. Falling back to no-op notifications.")
    return {
      addNotification: () => {},
      removeNotification: () => {},
      showSuccess: () => {},
      showError: () => {},
      showInfo: () => {},
      showWarning: () => {},
    }
  }
  return context
}

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])

  const addNotification = (notification) => {
    const id = Date.now() + Math.random()
    const newNotification = {
      id,
      ...notification,
      timestamp: Date.now(),
    }
    
    setNotifications(prev => [...prev, newNotification])
    
    // Auto remove after duration
    setTimeout(() => {
      removeNotification(id)
    }, notification.duration || 5000)
  }

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
  }

  const showSuccess = (message, duration = 5000) => {
    addNotification({
      type: "success",
      message,
      duration,
    })
  }

  const showError = (message, duration = 7000) => {
    addNotification({
      type: "error", 
      message,
      duration,
    })
  }

  const showInfo = (message, duration = 5000) => {
    addNotification({
      type: "info",
      message,
      duration,
    })
  }

  const showWarning = (message, duration = 6000) => {
    addNotification({
      type: "warning",
      message,
      duration,
    })
  }

  return (
    <NotificationContext.Provider value={{
      addNotification,
      removeNotification,
      showSuccess,
      showError,
      showInfo,
      showWarning,
    }}>
      {children}
      <NotificationContainer 
        notifications={notifications} 
        removeNotification={removeNotification}
      />
    </NotificationContext.Provider>
  )
}

const NotificationContainer = ({ notifications, removeNotification }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
        />
      ))}
    </div>
  )
}

const NotificationItem = ({ notification, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 10)
  }, [])

  const handleRemove = () => {
    setIsVisible(false)
    setTimeout(() => onRemove(notification.id), 300)
  }

  const getIcon = () => {
    switch (notification.type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case "error":
        return <XCircle className="w-5 h-5 text-red-400" />
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />
      case "info":
      default:
        return <Info className="w-5 h-5 text-cyan-400" />
    }
  }

  const getStyles = () => {
    switch (notification.type) {
      case "success":
        return "bg-green-500/10 border-green-500/30 text-green-400"
      case "error":
        return "bg-red-500/10 border-red-500/30 text-red-400"
      case "warning":
        return "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
      case "info":
      default:
        return "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
    }
  }

  return (
    <div
      className={`
        glass-card border p-4 rounded-lg backdrop-blur-xl
        ${getStyles()}
        transform transition-all duration-300 ease-in-out
        ${isVisible 
          ? "translate-x-0 opacity-100 scale-100" 
          : "translate-x-full opacity-0 scale-95"
        }
        animate-slide-in-right
      `}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-5">
            {notification.message}
          </p>
          {notification.details && (
            <p className="text-xs opacity-75 mt-1">
              {notification.details}
            </p>
          )}
        </div>
        <button
          onClick={handleRemove}
          className="flex-shrink-0 p-1 rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {/* Progress bar */}
      <div className="mt-3 h-1 bg-black/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-current opacity-30 transition-all ease-linear"
          style={{
            width: "100%",
            animation: `shrink ${notification.duration || 5000}ms linear forwards`
          }}
        />
      </div>
    </div>
  )
}

