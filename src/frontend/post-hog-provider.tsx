'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider, usePostHog } from 'posthog-js/react'
import { Suspense, useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useUser } from './shared/use-user'
import { env } from '@/env'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const enabled = env.NEXT_PUBLIC_POSTHOG_KEY !== 'DISABLED'

  useEffect(() => {
    if (enabled) {
      posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
        // api_host: '/ingest',
        api_host: 'https://eu.i.posthog.com',
        ui_host: 'https://eu.posthog.com',
        capture_pageview: false, // We capture pageviews manually
        capture_pageleave: true, // Enable pageleave capture
        persistence: 'memory',
      })
    }
  }, [enabled])

  if (!enabled) return children

  return (
    <PHProvider client={posthog}>
      <SuspendedPostHogPageView />
      {children}
    </PHProvider>
  )
}

function PostHogPageView() {
  const posthog = usePostHog()

  const { user } = useUser()
  useEffect(() => {
    if (user) posthog.identify(user.id, { username: user.name })
    else posthog.reset()
  }, [posthog, user])

  const pathname = usePathname()
  const searchParams = useSearchParams()
  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname
      const search = searchParams.toString()
      if (search) {
        url += '?' + search
      }
      posthog.capture('$pageview', { $current_url: url })
    }
  }, [pathname, searchParams, posthog])

  return null
}

function SuspendedPostHogPageView() {
  return (
    <Suspense fallback={null}>
      <PostHogPageView />
    </Suspense>
  )
}
