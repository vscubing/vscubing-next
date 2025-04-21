'use client'

import { BestSolves } from './best-solves'
import Image from 'next/image'
import dashboardEmptyImg from '@/../public/images/dashboard-empty.svg'
import { useTRPC } from '@/trpc/react'
import { useQuery } from '@tanstack/react-query'
import { LatestContests } from './latest-contests'
import type { Discipline } from '@/types'

export function DashboardLists() {
  const trpc = useTRPC()

  // NOTE: we don't fetch these two queries in separate RSCs because we need a combined fallback in case there is no data
  const { data: latestContests } = useQuery(
    trpc.contest.getAllContests.queryOptions({
      discipline: '3by3',
      limit: 10,
    }),
  )
  const bestSolves = useBestSolvesQuery()

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
        solves={bestSolves}
      />
    </div>
  )
}

function useBestSolvesQuery() {
  // TODO: make a dedicated trpc query for this once record badges are done
  const trpc = useTRPC()
  const { data: best3by3, isLoading: isLoading3by3 } = useQuery(
    trpc.leaderboard.bySingle.queryOptions({ discipline: '3by3' }),
  )
  const { data: best2by2, isLoading: isLoading2by2 } = useQuery(
    trpc.leaderboard.bySingle.queryOptions({ discipline: '2by2' }),
  )
  if (isLoading2by2 || isLoading3by3) return undefined

  const res: (NonNullable<typeof best3by3>[number] & {
    discipline: Discipline
  })[] = []

  if (best3by3?.[0]) res.push({ ...best3by3[0], discipline: '3by3' as const })
  if (best2by2?.[0]) res.push({ ...best2by2[0], discipline: '2by2' as const })

  return res
}
