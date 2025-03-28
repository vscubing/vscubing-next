import { Layout } from '../_components/layout'
import type { ReactNode } from 'react'

// const geist = Geist({
//   subsets: ["latin"],
//   variable: "--font-geist-sans",
// });

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <Layout>{children}</Layout>
}
