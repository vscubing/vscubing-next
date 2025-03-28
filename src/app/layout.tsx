import '@/styles/globals.css'
import { type Metadata } from 'next'
import { headers } from 'next/headers'
import { env } from 'process'
import type { ReactNode } from 'react'
import { Hind, Kanit } from 'next/font/google'
import { cn } from './_utils/cn'
import { TRPCReactProvider } from '@/trpc/react'

export const metadata: Metadata = {
  title: 'vscubing',
  description:
    "A contest platform for competing in virtual speedcubing: the art of solving twisty puzzles (like the Rubik's Cube) via a computer emulator controlled from the keyboard as fast as possible.",
  icons: [{ rel: 'icon', url: '/favicon.svg' }],
}

const hind = Hind({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
})
const kanit = Kanit({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
})

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
    <html lang='en' className={cn(hind.className, kanit.className)}>
      <body>
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  )
}
