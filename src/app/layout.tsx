import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: {
    default: 'Summit - Find Your Guide. Reach Your Peak.',
    template: '%s | Summit',
  },
  description:
    'Book guided outdoor adventures with certified mountain guides. Mountaineering, rock climbing, ski touring, and more.',
  keywords: [
    'mountain guide',
    'outdoor adventure',
    'mountaineering',
    'rock climbing',
    'ski touring',
    'guided trips',
    'Colorado',
  ],
  authors: [{ name: 'Summit' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'Summit',
    title: 'Summit - Find Your Guide. Reach Your Peak.',
    description:
      'Book guided outdoor adventures with certified mountain guides.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Summit - Find Your Guide. Reach Your Peak.',
    description:
      'Book guided outdoor adventures with certified mountain guides.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-white font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
