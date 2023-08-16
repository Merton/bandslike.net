import './globals.css'
import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/react';
import { Jost } from 'next/font/google'
const jost = Jost({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Bands like...',
  description: 'You&apos;ve listened to the entire back catalogue of your favourite band of the week, now what? BandsLike helps you find similar bands, and not just the most popular ones.',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${jost.className} flex flex-col`}>
        {children}
        <footer className="fixed bottom-0 left-0 w-full bg-slate-300">
          <div className="w-full max-w-screen-lg mx-auto px-3 sm:px-0 py-6">
            <p className="text-gray-700">Made by <a href="https://github.com/merton" target="_blank" className="text-blue-700 hover:underline">Merton Lansley</a></p>
          </div>
        </footer>
        <Analytics />
      </body>

    </html>
  )
}
