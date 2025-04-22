'use client'

import { BestSolves } from './best-solves'
import Image from 'next/image'
import dashboardEmptyImg from '@/../public/images/dashboard-empty.svg'
import { useTRPC } from '@/trpc/react'
import { useQueries, useQuery } from '@tanstack/react-query'
import { LatestContests } from './latest-contests'
import { DISCIPLINES } from '@/types'

export function DashboardLists() {
  const trpc = useTRPC()
  const { data: latestContests } = useQuery(
    trpc.contest.getAllContests.queryOptions({
      discipline: '3by3',
      limit: 10,
    }),
  )
  const { data: bestSolves } = useBestSolvesQuery()

  if (latestContests?.items.length === 0 || bestSolves?.length === 0) {
    return (
      <div className='flex flex-1 flex-col gap-6 rounded-2xl bg-black-80 px-6 pb-4 pt-10'>
        <h2 className='title-h3 text-center'>
          Invite friends to participate in a contest, compare your results and
          share solves
        </h2>
        <div className='relative flex-1'>
          <Image
            alt=''
            src={dashboardEmptyImg}
            className='absolute left-0 top-0 h-full w-full object-contain'
          />
        </div>
      </div>
    )
  }

  return (
    <div className='flex flex-grow gap-3 md:flex-col sm:flex-grow-0 sm:gap-2'>
      <LatestContests
        className='h-full basis-[calc(40%-0.75rem/2)]'
        contests={latestContests?.items?.filter(({ isOngoing }) => !isOngoing)}
      />
      <BestSolves
        className='h-full flex-grow basis-[calc(60%-0.75rem/2)]'
        solves={bestSolves ?? undefined}
      />
    </div>
  )
}

function useBestSolvesQuery() {
  const trpc = useTRPC()
  return useQueries({
    queries: DISCIPLINES.map((discipline) =>
      trpc.leaderboard.bySingle.queryOptions({ discipline }),
    ),

    combine: (results) => {
      const isLoading = results.some(({ isLoading }) => isLoading)
      if (isLoading) return { isLoading, data: null }

      const data = results
        .map(({ data }, idx) => {
          if (!data || !data[0]) return null
          return {
            ...data?.[0],
            discipline: DISCIPLINES[idx]!,
          }
        })
        .filter((x): x is NonNullable<typeof x> => Boolean(x))
      return { isLoading, data }
    },
  })
}
