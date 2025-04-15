'use client'

import { cn } from '@/frontend/utils/cn'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type ReactNode, useEffect, useState } from 'react'
import { useSetAtom } from 'jotai'
import { mobileMenuOpenAtom } from '../store/mobile-menu-open-atom'
import type { Route } from 'next'
import { useTRPC, type RouterOutputs } from '@/trpc/react'
import { useQuery } from '@tanstack/react-query'
import {
  DashboardIcon,
  LeaderboardIcon,
  AllContestsIcon,
  OngoingContestIcon,
  CodeIcon,
} from '@/frontend/ui'
import { DEFAULT_DISCIPLINE } from '@/types'

type NavbarProps = {
  variant: 'vertical' | 'horizontal'
}
export function Navbar({ variant }: NavbarProps) {
  const setOpenOnMobile = useSetAtom(mobileMenuOpenAtom)
  const trpc = useTRPC()
  const { data: ongoingContest } = useQuery(
    trpc.contest.getOngoing.queryOptions(),
  )

  const pathname = usePathname()
  const realRoute = parsePathname(pathname, ongoingContest?.slug)
  const [activeRoute, setActiveRoute] = useState<NavbarRoute | undefined>(
    realRoute,
  )
  useEffect(() => setActiveRoute(realRoute), [realRoute])

  function handleRouteChange(href: NavbarRoute) {
    setActiveRoute(href)
    setOpenOnMobile(false)
  }

  const devToolsEnabledQuery = useQuery(
    trpc.admin.authorized.queryOptions(undefined),
  )
  const devToolsEnabled = devToolsEnabledQuery.data ?? false

  if (variant === 'vertical') {
    return (
      <nav className='flex flex-col gap-4 sm:gap-0'>
        {getNavbarLinks(ongoingContest, devToolsEnabled).map(
          ({ children, href, route, disabled }) => (
            <Link
              key={href ?? route}
              href={(href ?? route) as Route}
              onClick={(e) => {
                if (!disabled) {
                  handleRouteChange(route)
                } else {
                  e.preventDefault()
                }
              }}
              className={cn(
                'title-h3 after-border-bottom transition-base outline-ring flex items-center gap-4 px-4 py-2 text-grey-20 after:origin-[0%_50%] after:bg-primary-80 hover:text-primary-60 active:text-primary-80 sm:gap-3 sm:p-3',
                {
                  'text-primary-80 after:h-[1.5px] after:scale-x-100 hover:text-primary-80':
                    activeRoute === route,
                  'cursor-not-allowed text-grey-80 hover:text-grey-80 active:text-grey-80':
                    disabled,
                },
              )}
              aria-disabled={disabled}
            >
              {children}
            </Link>
          ),
        )}
      </nav>
    )
  }

  if (variant === 'horizontal') {
    return (
      <nav className='flex justify-between gap-2 overflow-y-auto px-1 py-2'>
        {getNavbarLinks(ongoingContest, devToolsEnabled).map(
          ({ children, route, href, disabled }) => (
            <Link
              key={href ?? route}
              href={(href ?? route) as Route}
              onClick={(e) => {
                if (!disabled) {
                  handleRouteChange(route)
                } else {
                  e.preventDefault()
                }
              }}
              className={cn(
                'caption-sm transition-base flex min-w-[4.625rem] flex-col items-center gap-1 whitespace-nowrap px-1 text-grey-20 active:text-primary-80',
                {
                  'text-primary-80 hover:text-primary-80':
                    activeRoute === route,
                  'cursor-not-allowed text-grey-80 hover:text-grey-80 active:text-grey-80':
                    disabled,
                },
              )}
              aria-disabled={disabled}
            >
              {children}
            </Link>
          ),
        )}
      </nav>
    )
  }
}

function parsePathname(
  pathname: string,
  ongoingContestSlug?: string,
): NavbarRoute | undefined {
  if (isStaticNavbarRoute(pathname)) return pathname
  if (pathname.startsWith('/leaderboard')) return '/leaderboard'

  if (!ongoingContestSlug) return undefined
  if (pathname.startsWith('/contests')) {
    if (
      pathname === '/contests/ongoing' ||
      removePrefix(pathname, '/contests/').startsWith(ongoingContestSlug)
    ) {
      return '/contests/ongoing'
    }
    return '/contests'
  }
}

type NavbarRoute =
  | '/'
  | '/leaderboard'
  | '/contests'
  | '/contests/ongoing'
  | '/settings'
  | '/dev'

function isStaticNavbarRoute(pathname: string): pathname is NavbarRoute {
  return ['/', '/contests', '/dev'].includes(pathname)
}
function getNavbarLinks(
  ongoingContest: RouterOutputs['contest']['getOngoing'] | undefined,
  devToolsEnabled: boolean,
) {
  const links: {
    children: ReactNode
    route: NavbarRoute
    href?: string
    disabled?: boolean
  }[] = [
    {
      children: (
        <>
          <DashboardIcon />
          <span>Dashboard</span>
        </>
      ),
      route: '/',
    },
    {
      children: (
        <>
          <LeaderboardIcon />
          <span>Leaderboard</span>
        </>
      ),
      route: '/leaderboard',
      href: `/leaderboard?discipline=${DEFAULT_DISCIPLINE}&type=single`,
    },
    {
      children: (
        <>
          <AllContestsIcon />
          <span>All contests</span>
        </>
      ),
      route: '/contests',
      href: `/contests?discipline=${DEFAULT_DISCIPLINE}`,
    },
    {
      children: (
        <>
          <OngoingContestIcon />
          <span>Ongoing contest</span>
        </>
      ),
      route: '/contests/ongoing',
      href: getOngoingLink(ongoingContest),
      disabled: ongoingContest === null,
    },
  ]

  if (devToolsEnabled) {
    links.push({
      children: (
        <>
          <CodeIcon />
          <span>Developer tools</span>
        </>
      ),
      route: '/dev',
    })
  }

  return links
}

function removePrefix(value: string, prefix: string) {
  return value.startsWith(prefix) ? value.slice(prefix.length) : value
}

function getOngoingLink(
  ongoingContest: RouterOutputs['contest']['getOngoing'] | undefined,
) {
  if (!ongoingContest) return undefined
  const page = ongoingContest?.disciplines.find(
    (d) => d.slug === DEFAULT_DISCIPLINE,
  )?.capabilities

  return `/contests/${ongoingContest.slug}/${page}?discipline=${DEFAULT_DISCIPLINE}`
}
