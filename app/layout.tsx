import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/lib/theme-context'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Home Storage System',
  description: 'Manage and track items in your storage boxes',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200`}>
        <ThemeProvider>
          <div className="flex flex-col min-h-screen">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
} 