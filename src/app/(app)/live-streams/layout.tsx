'use client'

import { NoSSR } from '@/frontend/utils/no-ssr'

export default function Layout({ children }: { children: React.ReactNode }) {
  return <NoSSR>{children}</NoSSR>
}
