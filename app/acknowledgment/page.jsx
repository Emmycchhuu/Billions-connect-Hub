"use client"

import Image from "next/image"

const members = [
  {
    name: "Hizzy 💙",
    role: "Project Advisor & Contributor",
    img: "/images/hizzy.png", // replace with your actual image
  },
  {
    name: "Dvm 💙",
    role: "Project Core Contributor",
    img: "/images/dvm.png",
  },
  {
    name: "Big_D 💙",
    role: "Project Core Contributor",
    img: "/images/big_d.png",
  },
]

export default function AcknowledgmentPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-foreground">
      <h1 className="text-3xl font-bold mb-10 text-center animate-fade-in">
        💠 Acknowledgment
      </h1>

      <div className="grid gap-6 w-full max-w-md sm:max-w-3xl sm:grid-cols-3">
        {members.map((person, index) => (
          <div
            key={index}
            className="bg-card rounded-xl border border-border p-6 flex flex-col items-center text-center hover:shadow-lg hover:shadow-primary/40 transition-all duration-300 animate-fade-in"
          >
            <div className="w-28 h-28 relative mb-4">
              <Image
                src={person.img}
                alt={person.name}
                fill
                className="rounded-full object-cover border border-ring shadow-md"
              />
            </div>
            <h2 className="text-lg font-semibold">{person.name}</h2>
            <p className="text-sm text-muted-foreground">{person.role}</p>
          </div>
        ))}
      </div>
    </main>
  )
}
