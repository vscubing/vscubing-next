'use client'
import type { Discipline } from '@/types'
import { useTRPC, type RouterOutputs } from '@/trpc/react'
import React, { useEffect } from 'react'
import { ContestRowDesktop, ContestRowMobile } from './contest'
import { useInView } from 'react-intersection-observer'
import { useInfiniteQuery } from '@tanstack/react-query'
import { OverlaySpinner } from '@/frontend/ui'
import { LayoutMainOverlayPortal } from '@/app/(app)/layout'

export default function ContestList({
  discipline,
  initialData,
}: {
  discipline: Discipline
  initialData: RouterOutputs['contest']['getAllContests']
}) {
  const trpc = useTRPC()
  const { data, fetchNextPage, isFetchingNextPage } = useInfiniteQuery(
    trpc.contest.getAllContests.infiniteQueryOptions(
      {
        type: 'weekly',
        discipline,
      },
      {
        getNextPageParam: (prevPage) => prevPage.nextCursor,
        initialData: { pages: [initialData], pageParams: [] },
      },
    ),
  )

  const [lastElementRef, inView] = useInView()
  useEffect(() => {
    if (inView) void fetchNextPage()
  }, [inView, fetchNextPage])

  const contests = data.pages.flatMap((page) => page.items)
  return (
    <>
      {isFetchingNextPage && (
        <LayoutMainOverlayPortal>
          <OverlaySpinner className='absolute bottom-0 left-0 w-full' />
        </LayoutMainOverlayPortal>
      )}
      {contests.map((contest, index) => (
        <li
          key={contest?.slug}
          ref={index === contests.length - 1 ? lastElementRef : undefined}
        >
          <ContestRowDesktop
            discipline={discipline}
            contest={contest}
            className='sm:hidden'
          />
          <ContestRowMobile
            discipline={discipline}
            contest={contest}
            className='hidden sm:flex'
          />
        </li>
      ))}
    </>
  )
}
