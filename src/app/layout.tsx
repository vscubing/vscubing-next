import '@/styles/globals.css'
import { type Metadata } from 'next'
import { headers } from 'next/headers'
import { env } from 'process'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'vscubing',
  description:
    "A contest platform for competing in virtual speedcubing: the art of solving twisty puzzles (like the Rubik's Cube) via a computer emulator controlled from the keyboard as fast as possible.",
  icons: [{ rel: 'icon', url: '/favicon.svg' }],
}

export default async function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  if (env.NODE_ENV === 'development') {
    const headersList = await headers()
    if (headersList.get('host') === '127.0.0.1:3000')
      throw new Error("use localhost, auth won't work otherwise")
  }

  return (
    <html lang='en'>
      <body>{children}</body>
    </html>
  )
}
