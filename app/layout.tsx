import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'
import { AuthProvider } from '@/contexts/auth-context'
import { SettingsProvider } from '@/contexts/settings-context'
import { Toaster } from 'react-hot-toast'
import { HeaderWrapper } from '@/components/shared/header-wrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Zyra | AI-Driven Automation & Business Intelligence',
    template: '%s | Zyra'
  },
  description: 'Zyra - AI-driven automation and analytics platform for modern businesses. Automate workflows, analyze data, and scale your business with intelligent AI tools.',
  keywords: ['AI automation', 'business intelligence', 'workflow automation', 'data analytics', 'AI tools', 'business automation'],
  authors: [{ name: 'Zyra Team' }],
  creator: 'Zyra',
  publisher: 'Zyra',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://zyra.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://zyra.vercel.app',
    title: 'Zyra | Business Intelligence & AI Automation',
    description: 'AI-driven automation and analytics platform for modern businesses',
    siteName: 'Zyra',
    images: [
      {
        url: '/zyra-og-image.png',
        width: 1200,
        height: 630,
        alt: 'Zyra - AI Automation Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zyra | Business Intelligence & AI Automation',
    description: 'AI-driven automation and analytics platform for modern businesses',
    images: ['/zyra-og-image.png'],
    creator: '@zyra',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
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
          <SettingsProvider>
            <HeaderWrapper />
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: 'rgba(0, 0, 0, 0.8)',
                  color: '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                },
              }}
            />
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
