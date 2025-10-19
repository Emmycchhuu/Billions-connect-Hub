"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, User, Trash2, AlertTriangle } from "lucide-react"
import { playSound } from "@/lib/sounds"
import Link from "next/link"
import Image from "next/image"

const avatarOptions = [
  "/images/avatar-1.jpeg",
  "/images/avatar-2.jpeg",
  "/images/avatar-3.jpeg",
  "/images/avatar-4.jpeg",
  "/images/avatar-5.jpeg",
  "/images/toy-blue.png",
  "/images/toy-green.jpeg",
]

export default function ProfileEditClient({ user, profile }) {
  const router = useRouter()
  const [username, setUsername] = useState(profile?.username || "")
  const [selectedAvatar, setSelectedAvatar] = useState(profile?.profile_picture || avatarOptions[0])
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [isUploading, setIsUploading] = useState(false)

  const handleImageUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage("Please select a valid image file")
      playSound("lose")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage("Image size must be less than 5MB")
      playSound("lose")
      return
    }

    setIsUploading(true)
    setMessage("")

    try {
      // Convert to base64 for storage
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64 = e.target.result
        
        const supabase = createClient()
        const { error } = await supabase
          .from("profiles")
          .update({ profile_picture: base64 })
          .eq("id", user.id)

        if (error) {
          setMessage("Failed to upload image: " + error.message)
          playSound("lose")
        } else {
          setSelectedAvatar(base64)
          setMessage("Profile picture updated successfully!")
          playSound("win")
          // Refresh the page to show updated profile picture
          window.location.reload()
        }
        setIsUploading(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      setMessage("Failed to upload image")
      playSound("lose")
      setIsUploading(false)
    }
  }

  const handleSave = async () => {
    if (!username.trim()) {
      setMessage("Username cannot be empty")
      playSound("lose")
      return
    }

    setIsSaving(true)
    setMessage("")

    const supabase = createClient()
    const { error } = await supabase
      .from("profiles")
      .update({
        username: username.trim(),
        profile_picture: selectedAvatar,
      })
      .eq("id", user.id)

    if (error) {
      setMessage("Error updating profile: " + error.message)
      playSound("lose")
    } else {
      setMessage("Profile updated successfully!")
      playSound("win")
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    }

    setIsSaving(false)
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      setMessage("Please type 'DELETE' to confirm account deletion")
      playSound("lose")
      return
    }

    setIsDeleting(true)
    setMessage("")

    try {
      const supabase = createClient()

      // Delete all user data from database
      await supabase.from("game_sessions").delete().eq("user_id", user.id)
      await supabase.from("profiles").delete().eq("id", user.id)

      // Delete the user account
      const { error } = await supabase.auth.admin.deleteUser(user.id)
      
      if (error) throw error

      setMessage("Account deleted successfully. Redirecting...")
      playSound("win")
      
      setTimeout(() => {
        router.push("/")
      }, 2000)
    } catch (error) {
      setMessage("Error deleting account: " + error.message)
      playSound("lose")
      setIsDeleting(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 cyber-grid" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.1),transparent_50%)]" />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <Link href="/dashboard">
            <Button
              variant="outline"
              className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 bg-transparent"
              onMouseEnter={() => playSound("hover")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold holographic animate-holographic mb-4">
              Edit Profile
            </h1>
            <p className="text-slate-400 text-lg neon-text-purple animate-neon-pulse">Customize your gaming identity</p>
          </div>


          <Card className="glass-card border-purple-500/20 animate-scale-in">
            <CardHeader>
              <CardTitle className="text-purple-400 flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Settings
              </CardTitle>
              <CardDescription className="text-slate-400">Update your username and choose your avatar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-300">
                  Username
                </Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="neumorphism-card border-purple-500/30 text-slate-100"
                />
              </div>


              <div className="space-y-4">
                <Label className="text-slate-300">Choose Your Avatar</Label>
                
                {/* Upload Option */}
                <div className="mb-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="profile-upload"
                  />
                  <label
                    htmlFor="profile-upload"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg cursor-pointer transition-colors text-slate-200 neumorphism-button"
                  >
                    <User className="w-4 h-4" />
                    {isUploading ? "Uploading..." : "Upload from Device"}
                  </label>
                </div>

                {/* Current Profile Picture */}
                <div className="flex justify-center mb-4">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden neumorphism-3d">
                    <Image
                      src={selectedAvatar || "/placeholder.svg"}
                      alt="Current Profile Picture"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 md:grid-cols-7 gap-4">
                  {avatarOptions.map((avatar, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedAvatar(avatar)
                        playSound("click")
                      }}
                      onMouseEnter={() => playSound("hover")}
                      className={`relative aspect-square rounded-xl overflow-hidden transition-all duration-300 neumorphism-card ${
                        selectedAvatar === avatar
                          ? "ring-4 ring-purple-500 ring-offset-4 ring-offset-slate-950 scale-110 neon-border animate-neon-border"
                          : "hover:scale-105 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={avatar || "/placeholder.svg"}
                        alt={`Avatar ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-center pt-4">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-purple-500/50">
                  <Image
                    src={selectedAvatar || "/placeholder.svg"}
                    alt="Selected avatar"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {message && (
                <div
                  className={`p-4 rounded-lg text-center ${
                    message.includes("Error")
                      ? "bg-red-500/20 border border-red-500/50 text-red-400"
                      : "bg-green-500/20 border border-green-500/50 text-green-400"
                  }`}
                >
                  {message}
                </div>
              )}

              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full neumorphism-button text-white font-semibold py-6 text-lg neon-border animate-neon-border"
              >
                <Save className="w-5 h-5 mr-2" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>

          {/* Delete Account Section */}
          <Card className="bg-slate-900/80 backdrop-blur-xl border-red-500/20 mt-8">
            <CardHeader>
              <CardTitle className="text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Danger Zone
              </CardTitle>
              <CardDescription className="text-slate-400">
                Permanently delete your account and all associated data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!showDeleteConfirm ? (
                <Button
                  onClick={() => setShowDeleteConfirm(true)}
                  variant="destructive"
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-6 text-lg"
                >
                  <Trash2 className="w-5 h-5 mr-2" />
                  Delete Account
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <p className="text-red-400 text-sm mb-2">
                      <strong>Warning:</strong> This action cannot be undone. This will permanently delete:
                    </p>
                    <ul className="text-slate-400 text-sm space-y-1 ml-4">
                      <li>• Your account and profile</li>
                      <li>• All game session history</li>
                      <li>• All points and achievements</li>
                      <li>• All associated data</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="delete-confirm" className="text-slate-300">
                      Type "DELETE" to confirm:
                    </Label>
                    <Input
                      id="delete-confirm"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder="Type DELETE here"
                      className="bg-slate-800/50 border-red-500/30 text-slate-100"
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      onClick={handleDeleteAccount}
                      disabled={isDeleting || deleteConfirmText !== "DELETE"}
                      variant="destructive"
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-6 text-lg"
                    >
                      <Trash2 className="w-5 h-5 mr-2" />
                      {isDeleting ? "Deleting..." : "Delete Forever"}
                    </Button>
                    <Button
                      onClick={() => {
                        setShowDeleteConfirm(false)
                        setDeleteConfirmText("")
                      }}
                      variant="outline"
                      className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
