import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
 
export const alt = 'Billions Game Hub - Future of Gaming'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'
 
export default async function Image({ params, searchParams }: { params: any, searchParams: any }) {
  const refCode = searchParams.ref || ''
  
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {/* Background Pattern */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(6,182,212,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(168,85,247,0.15) 0%, transparent 50%)',
          }}
        />
        
        {/* Main Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            zIndex: 1,
          }}
        >
          {/* Logo */}
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: 24,
              background: 'linear-gradient(135deg, #06b6d4, #a855f7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 32,
              boxShadow: '0 20px 40px rgba(6,182,212,0.3)',
            }}
          >
            <div
              style={{
                fontSize: 48,
                fontWeight: 'bold',
                color: 'white',
              }}
            >
              ₿
            </div>
          </div>
          
          {/* Title */}
          <div
            style={{
              fontSize: refCode ? 56 : 72,
              fontWeight: 'bold',
              background: 'linear-gradient(90deg, #06b6d4, #a855f7, #ec4899)',
              backgroundClip: 'text',
              color: 'transparent',
              marginBottom: 16,
              textAlign: 'center',
            }}
          >
            {refCode ? `JOIN WITH ${refCode}` : 'BILLIONS'}
          </div>
          
          {/* Subtitle */}
          <div
            style={{
              fontSize: refCode ? 32 : 36,
              color: '#e2e8f0',
              marginBottom: 24,
              fontWeight: '600',
            }}
          >
            {refCode ? 'Get ₿100 Bonus Points!' : 'GAME HUB'}
          </div>
          
          {/* Description */}
          <div
            style={{
              fontSize: 24,
              color: '#94a3b8',
              maxWidth: 800,
              lineHeight: 1.4,
              marginBottom: 32,
            }}
          >
            {refCode 
              ? 'Enter the future of gaming with AI-powered games, cinematic visuals, and immersive experiences.'
              : 'Future of Gaming • AI-Powered Games • Earn Points • Climb Leaderboard'
            }
          </div>
          
          {/* Features */}
          <div
            style={{
              display: 'flex',
              gap: 32,
              fontSize: 20,
              color: '#06b6d4',
              fontWeight: '600',
            }}
          >
            <div>🎮 Find the Impostor</div>
            <div>🎰 Billions Spin</div>
            <div>🧠 Quiz Games</div>
          </div>
        </div>
        
        {/* Bottom Gradient */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 100,
            background: 'linear-gradient(to top, rgba(15,23,42,0.8), transparent)',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  )
}
