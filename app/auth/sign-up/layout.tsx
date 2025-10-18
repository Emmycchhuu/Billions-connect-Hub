import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Join Billions Game Hub - Sign Up',
  description: 'Create your account and enter the future of gaming.',
  openGraph: {
    title: 'Join Billions Game Hub - Sign Up',
    description: 'Create your account and enter the future of gaming.',
    images: ['/images/billions-logo.png'],
  },
}

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

