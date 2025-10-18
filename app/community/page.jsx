"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageSquare, Send, Users, Lock, AlertTriangle } from "lucide-react"
import { useNotification } from "@/components/NotificationSystem"
import LevelDisplay from "@/components/LevelDisplay"
import Image from "next/image"

export default function CommunityChat({ user, profile }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isModerated, setIsModerated] = useState(false)
  const messagesEndRef = useRef(null)
  const { showSuccess, showError, showWarning } = useNotification()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Check if user can chat (level 3+)
  const canChat = profile?.level >= 3

  // Load messages
  const loadMessages = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("is_moderated", false)
        .order("created_at", { ascending: true })
        .limit(50)

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error("Error loading messages:", error)
      showError("Failed to load messages")
    }
  }

  useEffect(() => {
    loadMessages()
    
    // Set up real-time subscription
    const supabase = createClient()
    const channel = supabase
      .channel("chat_messages")
      .on("postgres_changes", 
        { event: "*", schema: "public", table: "chat_messages" },
        () => loadMessages()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Validate Twitter link
  const isValidTwitterLink = (text) => {
    const twitterRegex = /https?:\/\/(www\.)?(twitter\.com|x\.com)\/\w+\/status\/\d+/i
    return twitterRegex.test(text)
  }

  // Check for bad words
  const containsBadWords = async (text) => {
    try {
      const supabase = createClient()
      const { data } = await supabase.rpc("contains_bad_words", { message_text: text })
      return data
    } catch (error) {
      console.error("Error checking bad words:", error)
      return false
    }
  }

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading || !canChat) return

    const messageText = newMessage.trim()
    
    // Check for bad words
    const hasBadWords = await containsBadWords(messageText)
    if (hasBadWords) {
      showWarning("Please keep the chat respectful. Remove inappropriate language.")
      setIsModerated(true)
      return
    }

    // Check for non-Twitter links
    const linkRegex = /https?:\/\/[^\s]+/g
    const links = messageText.match(linkRegex)
    if (links) {
      const invalidLinks = links.filter(link => !isValidTwitterLink(link))
      if (invalidLinks.length > 0) {
        showWarning("Only Twitter/X links are allowed in the community chat.")
        return
      }
    }

    setIsLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("chat_messages")
        .insert({
          user_id: user.id,
          username: profile?.username || "Anonymous",
          profile_picture: profile?.profile_picture,
          message: messageText,
          twitter_link: links ? links.find(isValidTwitterLink) : null
        })

      if (error) throw error

      setNewMessage("")
      showSuccess("Message sent!")
      setIsModerated(false)
    } catch (error) {
      console.error("Error sending message:", error)
      showError("Failed to send message")
    } finally {
      setIsLoading(false)
    }
  }

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date
    
    if (diff < 60000) return "Just now"
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return date.toLocaleDateString()
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
                <MessageSquare className="w-8 h-8 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-100 holographic animate-holographic">
                  Community Chat
                </h1>
                <p className="text-slate-400">Connect with fellow Billions players</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-400" />
              <span className="text-slate-300">{messages.length} online</span>
            </div>
          </div>

          {/* Level Display */}
          <div className="mb-6">
            <LevelDisplay user={user} profile={profile} />
          </div>

          {/* Chat Access Warning */}
          {!canChat && (
            <Card className="neumorphism-card border-yellow-500/20 mb-6">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Lock className="w-6 h-6 text-yellow-400" />
                  <div>
                    <h3 className="text-yellow-400 font-semibold">Chat Locked</h3>
                    <p className="text-slate-300">
                      You need to reach Level 3 to access community chat. 
                      Play games to earn experience and level up!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Chat Rules */}
          <Card className="neumorphism-card border-blue-500/20 mb-6">
            <CardHeader>
              <CardTitle className="text-blue-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Community Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-300">
              <p>• Be respectful and kind to other players</p>
              <p>• Only Twitter/X links are allowed</p>
              <p>• No spam, harassment, or inappropriate content</p>
              <p>• Keep discussions related to gaming and Billions Network</p>
              <p>• Messages are moderated automatically</p>
            </CardContent>
          </Card>

          {/* Chat Container */}
          <Card className="neumorphism-card h-[600px] flex flex-col">
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <MessageSquare className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                      <p className="text-slate-400">No messages yet. Be the first to chat!</p>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div key={message.id} className="flex gap-3">
                      <div className="neumorphism-3d p-1 rounded-lg flex-shrink-0">
                        {message.profile_picture ? (
                          <Image
                            src={message.profile_picture}
                            alt={message.username}
                            width={32}
                            height={32}
                            className="rounded"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-cyan-400 rounded flex items-center justify-center">
                            <span className="text-white text-sm font-bold">
                              {message.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-slate-100 font-semibold">{message.username}</span>
                          <span className="text-xs text-slate-500">{formatTime(message.created_at)}</span>
                        </div>
                        <div className="bg-slate-800/50 text-slate-100 border border-slate-700/50 p-3 rounded-lg">
                          <p className="whitespace-pre-wrap">{message.message}</p>
                          {message.twitter_link && (
                            <a 
                              href={message.twitter_link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-cyan-400 hover:text-cyan-300 text-sm mt-2 inline-block"
                            >
                              🔗 View Tweet
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              {canChat ? (
                <div className="p-6 border-t border-slate-700/50">
                  <div className="flex gap-3">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message... (Twitter links allowed)"
                      className="neumorphism-card border-cyan-500/30 text-slate-100"
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      disabled={isLoading}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || isLoading}
                      className="neumorphism-button px-6"
                    >
                      {isLoading ? (
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  {isModerated && (
                    <p className="text-yellow-400 text-sm mt-2">
                      ⚠️ Your message was flagged. Please review the community guidelines.
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-6 border-t border-slate-700/50 text-center">
                  <p className="text-slate-500">Reach Level 3 to start chatting!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
