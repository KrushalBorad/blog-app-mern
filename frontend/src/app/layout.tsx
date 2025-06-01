import AnimatedBackground from '@/components/AnimatedBackground'
import Navigation from '@/components/Navigation'
import { AuthProvider } from '@/context/AuthContext'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Blog App',
  description: 'A modern blog application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <AnimatedBackground />
          <Navigation />
          <main className="relative pt-16">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
} 