import { env } from '@/env'
import { Layout } from './_layout'
import type { ReactNode } from 'react'
import { DevTools } from './dev'

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <Layout>
      {children}
      {env.NEXT_PUBLIC_NODE_ENV === 'development' && <DevTools />}
    </Layout>
  )
}
