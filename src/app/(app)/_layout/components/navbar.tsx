'use client'

import { cn } from '@/frontend/utils/cn'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type ReactNode, useEffect, useState } from 'react'
import { useSetAtom } from 'jotai'
import { mobileMenuOpenAtom } from '../store/mobile-menu-open-atom'
import type { Route } from 'next'
import { useTRPC, type RouterOutputs } from '@/lib/trpc/react'
import { useQuery } from '@tanstack/react-query'
import {
  DashboardIcon,
  LeaderboardIcon,
  AllContestsIcon,
  OngoingContestIcon,
  CodeXmlIcon,
} from '@/frontend/ui'
import { DEFAULT_DISCIPLINE } from '@/types'
import {
  FlaskConicalIcon,
  HandshakeIcon,
  RadioTowerIcon,
  SwordsIcon,
} from 'lucide-react'
import { LIVE_STREAMS_ENABLED } from '@/lib/pusher/streams'
import { HoverPopover } from '@/frontend/ui/popovers'

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

  const experimentalLinks = getExperimentalLinks()
  const hasExperiments = experimentalLinks.length > 0
  const isExperimentalRouteActive = experimentalLinks.some(
    (link) => activeRoute === link.route,
  )

  const navLinkClassName = (route: NavbarRoute, disabled?: boolean) =>
    cn(
      'title-h3 after-border-bottom transition-base outline-ring flex items-center gap-4 px-4 py-2 text-grey-20 after:origin-[0%_50%] after:bg-primary-80 hover:text-primary-60 active:text-primary-80 lg:justify-center sm:justify-normal sm:gap-3 sm:p-3',
      {
        'text-primary-80 after:h-[1.5px] after:scale-x-100 hover:text-primary-80':
          activeRoute === route,
        'cursor-not-allowed text-grey-80 hover:text-grey-80 active:text-grey-80':
          disabled,
      },
    )

  if (variant === 'vertical') {
    return (
      <nav className='flex flex-col gap-4 sm:gap-0'>
        {getNavbarLinks(ongoingContest, devToolsEnabled).map(
          ({ icon, name, href, route, disabled }) => (
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
              className={navLinkClassName(route, disabled)}
              aria-disabled={disabled}
            >
              {icon}
              <span className='lg:sr-only sm:not-sr-only'>{name}</span>
            </Link>
          ),
        )}
        {hasExperiments && (
          <HoverPopover
            asChild
            side='right'
            hideArrow
            content={
              <div className='flex flex-col gap-1 p-2'>
                {experimentalLinks.map(({ icon, name, route }) => (
                  <Link
                    key={route}
                    href={route as Route}
                    onClick={() => handleRouteChange(route)}
                    className={cn(
                      'flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-grey-20 hover:bg-black-80 hover:text-primary-60',
                      {
                        'bg-black-80 text-primary-80 hover:text-primary-80':
                          activeRoute === route,
                      },
                    )}
                  >
                    {icon}
                    <span>{name}</span>
                  </Link>
                ))}
              </div>
            }
          >
            <button
              className={cn(
                'title-h3 transition-base outline-ring after-border-bottom flex items-center gap-4 px-4 py-2 text-grey-20 hover:text-primary-60 active:text-primary-80 lg:justify-center sm:hidden sm:gap-3 sm:p-3',
                {
                  'text-primary-80 after:h-[1.5px] after:scale-x-100 hover:text-primary-80':
                    isExperimentalRouteActive,
                },
              )}
            >
              <FlaskConicalIcon />
              <span className='lg:sr-only'>Experiments</span>
            </button>
          </HoverPopover>
        )}
      </nav>
    )
  }

  if (variant === 'horizontal') {
    return (
      <nav className='flex justify-between gap-2 overflow-y-auto px-1 py-2'>
        {getNavbarLinks(ongoingContest, devToolsEnabled).map(
          ({ icon, name, route, href, disabled }) => (
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
              {icon}
              <span>{name}</span>
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
  if (pathname.startsWith('/cube-together')) return '/cube-together'
  if (pathname.startsWith('/live-streams')) return '/live-streams'

  if (!ongoingContestSlug) return undefined
  if (pathname.startsWith('/contests')) {
    if (
      pathname === '/contests/ongoing' ||
      removePrefix(pathname, '/contests/').startsWith(ongoingContestSlug)
    )
      return '/contests/ongoing'

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
  | '/live-streams'
  | '/cube-together'
  | '/dojo'

function isStaticNavbarRoute(pathname: string): pathname is NavbarRoute {
  return (
    [
      '/',
      '/contests',
      '/dev',
      '/live-streams',
      '/cube-together',
      '/dojo',
    ] satisfies NavbarRoute[] as string[]
  ).includes(pathname)
}

type NavbarLink = {
  icon: ReactNode
  name: string
  route: NavbarRoute
  href?: string
  disabled?: boolean
}

function getNavbarLinks(
  ongoingContest: RouterOutputs['contest']['getOngoing'] | undefined,
  devToolsEnabled: boolean,
) {
  const links: NavbarLink[] = [
    {
      icon: <DashboardIcon />,
      name: 'Dashboard',
      route: '/',
    },
    {
      icon: <LeaderboardIcon />,
      name: 'Leaderboard',
      route: '/leaderboard',
      href: `/leaderboard?discipline=${DEFAULT_DISCIPLINE}&type=single`,
    },
    {
      icon: <AllContestsIcon />,
      name: 'All contests',
      route: '/contests',
      href: `/contests?discipline=${DEFAULT_DISCIPLINE}`,
    },
    {
      icon: <OngoingContestIcon />,
      name: 'Ongoing contest',
      route: '/contests/ongoing',
      href: ongoingContest
        ? `/contests/${ongoingContest.slug}/results?discipline=${DEFAULT_DISCIPLINE}`
        : undefined,
      disabled: ongoingContest === null,
    },
  ]

  if (devToolsEnabled) {
    links.push({
      icon: <CodeXmlIcon strokeWidth={3} />,
      name: 'Developer tools',
      route: '/dev',
    })
  }

  return links
}

function getExperimentalLinks(): NavbarLink[] {
  const links: NavbarLink[] = [
    {
      icon: <HandshakeIcon className='h-5 w-5' />,
      name: 'Cube together',
      route: '/cube-together',
    },
    {
      icon: <SwordsIcon className='h-5 w-5' />,
      name: 'Dojo',
      route: '/dojo',
    },
  ]

  if (LIVE_STREAMS_ENABLED) {
    links.push({
      icon: <RadioTowerIcon className='h-5 w-5' />,
      name: 'Live streams',
      route: '/live-streams',
    })
  }

  return links
}

function removePrefix(value: string, prefix: string) {
  return value.startsWith(prefix) ? value.slice(prefix.length) : value
}
