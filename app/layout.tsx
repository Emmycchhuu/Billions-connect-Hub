import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import ParticleBackground from '@/components/ParticleBackground'
import { NotificationProvider } from '@/components/NotificationSystem'

export const metadata: Metadata = {
  title: 'Billions Game Hub - Future of Gaming',
  description: 'Enter the future of gaming with AI-powered games, cinematic visuals, and immersive experiences.',
  openGraph: {
    title: 'Billions Game Hub - Future of Gaming',
    description: 'Enter the future of gaming with AI-powered games, cinematic visuals, and immersive experiences.',
    images: ['/images/billions-logo.png'],
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#06b6d4' },
    { media: '(prefers-color-scheme: dark)', color: '#06b6d4' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative`}>
        <NotificationProvider>
          <ParticleBackground />
          <div className="relative z-10">
            {children}
          </div>
        </NotificationProvider>
        <Analytics />
      </body>
    </html>
  )
}
