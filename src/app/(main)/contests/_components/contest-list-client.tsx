'use client'
import type { Discipline } from '@/app/_types'
import { api } from '@/trpc/react'
import React, { useEffect } from 'react'
import { ContestRowDesktop, ContestRowMobile } from './contest'
import { useInView } from 'react-intersection-observer'

export default function ContestList({
  discipline,
}: {
  discipline: Discipline
}) {
  const [data, { fetchNextPage }] =
    api.contest.pastContests.useSuspenseInfiniteQuery(
      {
        discipline,
      },
      { getNextPageParam: (prevPage) => prevPage.nextCursor },
    )

  const [lastElementRef, inView] = useInView()
  useEffect(() => {
    if (inView) void fetchNextPage()
  }, [inView, fetchNextPage])

  const contests = data.pages.flatMap((page) => page.items)
  return contests.map((contest, index) => (
    <li
      key={contest.contest?.slug}
      ref={index === contests.length - 1 ? lastElementRef : undefined}
    >
      <ContestRowDesktop
        discipline={discipline}
        contest={contest.contest}
        className='sm:hidden'
      />
      <ContestRowMobile
        discipline={discipline}
        contest={contest.contest}
        className='hidden sm:flex'
      />
    </li>
  ))
}
