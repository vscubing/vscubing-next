import dynamic from 'next/dynamic'
import type { ReactNode } from 'react'

export const NoSSR = dynamic(
  () => Promise.resolve(({ children }: { children: ReactNode }) => children),
  { ssr: false },
)
