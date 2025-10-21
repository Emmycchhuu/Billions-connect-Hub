"use client"

import Image from "next/image"

const members = [
  {
    name: "Big_D 💙",
    role: "Project Core Contributor",
    img: "https://i.ibb.co/GfQNLQYg/hizzy.png",
  },
  {
    name: "Dvm 💙",
    role: "Project Core Contributor",
    img: "https://i.ibb.co/PZ7VNn4q/36469ee8-e098-417f-9e15-4c7f6c09e4b2.jpg",
  },
  {
    name: "Hizzy 💙",
    role: "Project Advisor and Contributor",
    img: "https://i.ibb.co/8LfsBgkK/big-d.png",
  },
]

export default function AcknowledgmentPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 
      bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 relative overflow-hidden">

      {/* Subtle glowing background accents */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(6,182,212,0.15),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(168,85,247,0.15),transparent_60%)]" />

      <h1 className="relative z-10 text-4xl font-extrabold mb-12 text-center bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
        💠 Acknowledgment
      </h1>

      <div className="relative z-10 grid gap-8 w-full max-w-4xl sm:grid-cols-3">
        {members.map((person, index) => (
          <div
            key={index}
            className="bg-slate-900/60 border border-cyan-500/20 rounded-2xl p-6 
            flex flex-col items-center text-center backdrop-blur-xl 
            hover:border-cyan-400/40 hover:shadow-lg hover:shadow-cyan-500/20 
            transition-all duration-500 ease-out hover:scale-105"
          >
            <div className="relative w-28 h-28 mb-4">
              <Image
                src={person.img}
                alt={person.name}
                fill
                className="rounded-full object-cover border-2 border-cyan-400/50 shadow-md"
              />
            </div>
            <h2 className="text-xl font-semibold text-cyan-300 mb-1">{person.name}</h2>
            <p className="text-sm text-slate-400">{person.role}</p>
          </div>
        ))}
      </div>
    </main>
  )
}
