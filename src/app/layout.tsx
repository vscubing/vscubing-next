import '@/globals.css'
import { type Metadata } from 'next'
import { headers } from 'next/headers'
import type { ReactNode } from 'react'
import { Hind, Kanit } from 'next/font/google'
import { cn } from '../frontend/utils/cn'
import { env } from '@/env'
import { PostHogProvider } from '../frontend/post-hog-provider'
import { TRPCReactProvider } from '@/trpc/react'
import { TooltipProvider } from '@/frontend/ui/tooltip'

export const metadata: Metadata = {
  title: 'vscubing',
  description:
    "The platform for competing in virtual speedcubing: the art of solving twisty puzzles (like the Rubik's Cube) via a computer emulator controlled from the keyboard as fast as possible.",
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
  if (env.NEXT_PUBLIC_APP_ENV === 'development') {
    const headersList = await headers()
    if (headersList.get('host') === '127.0.0.1:3000')
      throw new Error("use localhost:3000, auth won't work otherwise")
  }

  return (
    <html lang='en' className={cn(hind.className, kanit.className)}>
      <body>
        <TRPCReactProvider>
          <TooltipProvider delayDuration={0}>
            <PostHogProvider>{children}</PostHogProvider>
          </TooltipProvider>
        </TRPCReactProvider>
      </body>
    </html>
  )
}
