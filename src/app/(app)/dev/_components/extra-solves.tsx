'use client'

import { DisciplineIcon, SecondaryButton } from '@/frontend/ui'
import { LoadingDots } from '@/frontend/ui/loading-dots'
import { formatSolveTime } from '@/lib/utils/format-solve-time'
import { useTRPC } from '@/lib/trpc/react'
import { useInfiniteQuery } from '@tanstack/react-query'
import Link from 'next/link'

export function ExtraSolves() {
  const trpc = useTRPC()
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery(
      trpc.admin.getExtraSolves.infiniteQueryOptions(
        {},
        {
          getNextPageParam: (lastPage) => lastPage.nextCursor,
          initialCursor: undefined,
        },
      ),
    )

  const solves = data?.pages.flatMap((page) => page.items)

  return (
    <section className='space-y-4'>
      <h2 className='title-h2'>Extra attempt solves</h2>
      {isLoading ? (
        <LoadingDots />
      ) : !solves?.length ? (
        <p className='text-grey-40'>No extra attempt solves found</p>
      ) : (
        <div className='space-y-4'>
          <div className='overflow-x-auto'>
            <table className='w-full text-left text-sm'>
              <thead>
                <tr className='text-grey-40 border-white-10 border-b'>
                  <th className='px-3 py-2'>Date</th>
                  <th className='px-3 py-2'>User</th>
                  <th className='px-3 py-2'>Discipline</th>
                  <th className='px-3 py-2'>Time</th>
                  <th className='px-3 py-2'>Contest</th>
                  <th className='px-3 py-2'>Reason</th>
                </tr>
              </thead>
              <tbody>
                {solves.map((solve) => (
                  <tr
                    key={solve.solveId}
                    className='border-white-10 border-b last:border-0'
                  >
                    <td className='text-grey-40 px-3 py-2 whitespace-nowrap'>
                      {new Date(solve.createdAt).toLocaleDateString()}
                    </td>
                    <td className='px-3 py-2'>{solve.username ?? 'Unknown'}</td>
                    <td className='px-3 py-2'>
                      <DisciplineIcon
                        discipline={solve.discipline}
                        className='h-5 w-5'
                      />
                    </td>
                    <td className='px-3 py-2'>
                      {solve.isDnf ? (
                        <span className='text-red-80'>DNF</span>
                      ) : solve.timeMs != null ? (
                        <Link
                          href={`/contests/${solve.contestSlug}/watch/${solve.solveId}?discipline=${solve.discipline}`}
                          className='transition-base after-border-bottom hover:after:scale-x-100'
                        >
                          {formatSolveTime(solve.timeMs)}
                        </Link>
                      ) : (
                        <span className='text-grey-40'>-</span>
                      )}
                    </td>
                    <td className='px-3 py-2'>
                      <Link
                        href={`/contests/${solve.contestSlug}/results?discipline=${solve.discipline}`}
                        className='transition-base after-border-bottom hover:after:scale-x-100'
                      >
                        #{solve.contestSlug}
                      </Link>
                    </td>
                    <td className='max-w-[20rem] truncate px-3 py-2'>
                      {solve.extraReason ?? '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {hasNextPage && (
            <SecondaryButton
              size='sm'
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? 'Loading...' : 'Load more'}
            </SecondaryButton>
          )}
        </div>
      )}
    </section>
  )
}
