import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'react-hot-toast'
import { SessionProvider } from 'next-auth/react'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: { default: 'Devora', template: '%s | Devora' },
  description: 'La red social para developers. Comparte proyectos, aprende y conecta.',
  keywords: ['developers', 'programming', 'community', 'code', 'open source'],
  authors: [{ name: 'Devora' }],
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://devora.dev',
    siteName: 'Devora',
    title: 'Devora — Red social para developers',
    description: 'Comparte proyectos, aprende y conecta con otros developers.',
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans bg-surface text-text-primary antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true}>
          <SessionProvider>
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                className: 'glass !text-text-primary !border-surface-border',
                style: {
                  background: 'var(--glass-background)',
                  backdropFilter: 'blur(12px)',
                },
              }}
            />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
