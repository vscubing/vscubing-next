'use client'

import { cn } from '@/app/_utils/cn'
import Link from 'next/link'
import {
  DashboardIcon,
  LeaderboardIcon,
  AllContestsIcon,
  OngoingContestIcon,
} from '../../ui'
import { usePathname } from 'next/navigation'
import { type ReactNode, useEffect, useState } from 'react'
import { useSetAtom } from 'jotai'
import { mobileMenuOpenAtom } from '../store/mobileMenuOpenAtom'
import type { Route } from 'next'
import { api } from '@/trpc/react'

type NavbarProps = {
  variant: 'vertical' | 'horizontal'
}
export function Navbar({ variant }: NavbarProps) {
  const setOpenOnMobile = useSetAtom(mobileMenuOpenAtom)
  const { data: ongoingContest } = api.contest.ongoing.useQuery()

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

  if (variant === 'vertical') {
    return (
      <nav className='flex flex-col gap-4 sm:gap-0'>
        {navbarLinks.map(({ children, href }) => (
          <Link
            key={href}
            href={href as Route}
            onClick={() => handleRouteChange(href)}
            className={cn(
              'title-h3 after-border-bottom transition-base outline-ring flex items-center gap-4 px-4 py-2 text-grey-20 after:origin-[0%_50%] after:bg-primary-80 hover:text-primary-60 active:text-primary-80 sm:gap-3 sm:p-3',
              {
                'text-primary-80 after:h-[1.5px] after:scale-x-100 hover:text-primary-80':
                  activeRoute === href,
              },
            )}
          >
            {children}
          </Link>
        ))}
      </nav>
    )
  }

  if (variant === 'horizontal') {
    return (
      <nav className='flex justify-between gap-2 overflow-y-auto px-1 py-2'>
        {navbarLinks.map(({ children, href }) => (
          <Link
            key={href}
            href={href as Route}
            onClick={() => handleRouteChange(href)}
            className={cn(
              'caption-sm transition-base flex min-w-[4.625rem] flex-col items-center gap-1 whitespace-nowrap px-1 text-grey-20 active:text-primary-80',
              { 'text-primary-80 hover:text-primary-80': activeRoute === href },
            )}
          >
            {children}
          </Link>
        ))}
      </nav>
    )
  }
}

function parsePathname(
  pathname: string,
  ongoingContestSlug?: string,
): NavbarRoute | undefined {
  if (pathname === '/') return '/'
  if (pathname.startsWith('/leaderboard')) return '/leaderboard'
  if (pathname.startsWith('/contests')) {
    if (
      ongoingContestSlug &&
      removePrefix(pathname, '/contests/').startsWith(ongoingContestSlug)
    ) {
      return '/contests/ongoing'
    }
    return '/contests'
  }
}

type NavbarRoute = '/' | '/leaderboard' | '/contests' | '/contests/ongoing'
const navbarLinks = [
  {
    children: (
      <>
        <DashboardIcon />
        <span>Dashboard</span>
      </>
    ),
    href: '/',
  },
  {
    children: (
      <>
        <LeaderboardIcon />
        <span>Leaderboard</span>
      </>
    ),
    href: '/leaderboard',
  },
  {
    children: (
      <>
        <AllContestsIcon />
        <span>Past contests</span>
      </>
    ),
    href: '/contests',
  },
  {
    children: (
      <>
        <OngoingContestIcon />
        <span>Ongoing contest</span>
      </>
    ),
    href: `/contests/ongoing`,
  },
] satisfies { children: ReactNode; href: NavbarRoute }[]

// function useNavbar() {
//   const { data: ongoing } = useOngoingContest();
//   const matchRoute = useMatchRoute();
//
//   const isOnContests = !!matchRoute({
//     to: "/contests",
//     fuzzy: true,
//   });
//   const isOnOngoingContest =
//     !!matchRoute({
//       to: "/contests/$contestSlug",
//       fuzzy: true,
//       params: { contestSlug: ongoing?.data?.slug },
//     }) || !!matchRoute({ to: "/contests/ongoing" });
//
//   let customActive: "all-contests" | "ongoing-contest" | undefined = undefined;
//   if (isOnOngoingContest) {
//     customActive = "ongoing-contest";
//   } else if (isOnContests) {
//     customActive = "all-contests";
//   }
//
//   return getLinks(customActive);
// }
//
// function getLinks(
//   patchedActive?: "all-contests" | "ongoing-contest",
// ): (LinkProps & { children: ReactNode } & {
//   customActiveCondition?: boolean;
// })[] {
//   return [
//     {
//       children: (
//         <>
//           <DashboardIcon />
//           <span>Dashboard</span>
//         </>
//       ),
//       to: "/",
//     },
//     {
//       children: (
//         <>
//           <LeaderboardIcon />
//           <span>Leaderboard</span>
//         </>
//       ),
//       to: "/leaderboard",
//     },
//     {
//       children: (
//         <>
//           <AllContestsIcon />
//           <span>Past contests</span>
//         </>
//       ),
//       to: "/contests",
//       search: { discipline: DEFAULT_DISCIPLINE, page: 1 },
//       activeOptions: {
//         includeSearch: false,
//       },
//       customActiveCondition: patchedActive === "all-contests",
//     },
//     {
//       children: (
//         <>
//           <OngoingContestIcon />
//           <span>Ongoing contest</span>
//         </>
//       ),
//       to: `/contests/ongoing`,
//       customActiveCondition: patchedActive === "ongoing-contest",
//     },
//   ];
// }

function removePrefix(value: string, prefix: string) {
  return value.startsWith(prefix) ? value.slice(prefix.length) : value
}
