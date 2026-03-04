'use client'

import { useState } from 'react'
import { Select } from '@/frontend/ui'
import { useTRPC } from '@/lib/trpc/react'
import { useQuery } from '@tanstack/react-query'
import { ContestParticipationHeatmap } from './contest-participation-heatmap'
import { LoadingSpinner } from '@/frontend/ui'

export function ContestParticipationSection({ userId }: { userId: string }) {
  const trpc = useTRPC()

  const { data: years, isLoading: yearsLoading } = useQuery(
    trpc.profile.getParticipationYears.queryOptions({ userId }),
  )

  const [year, setYear] = useState<string | null>(null)

  const selectedYear = year ?? (years?.[0] ? String(years[0]) : null)
  const yearOptions = (years ?? []).map((y) => ({ value: String(y) }))

  const { data, isLoading } = useQuery({
    ...trpc.profile.getContestParticipation.queryOptions({
      userId,
      year: Number(selectedYear),
    }),
    enabled: !!selectedYear,
  })

  if (yearsLoading) {
    return (
      <div className='bg-black-80 flex min-h-32 items-center justify-center rounded-2xl p-6 sm:p-4'>
        <LoadingSpinner />
      </div>
    )
  }

  if (!years || years.length === 0) {
    return (
      <div className='bg-black-80 flex flex-col rounded-2xl p-6 sm:p-4'>
        <h3 className='title-h3 mb-4'>Contest participation</h3>
        <div className='flex min-h-32 items-center justify-center'>
          <p className='text-grey-40 text-base'>No contest participation yet</p>
        </div>
      </div>
    )
  }

  return (
    <div className='bg-black-80 flex flex-col rounded-2xl p-6 sm:p-4'>
      <div className='mb-4 flex items-center justify-between'>
        <h3 className='title-h3'>Contest participation</h3>
        <div className='flex items-center gap-3'>
          <div className='flex items-center gap-2'>
            <span className='h-3 w-3 rounded-sm bg-[#8F8FFE]' />
            <span className='text-grey-40 text-sm'>Completed</span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='h-3 w-3 rounded-sm bg-[#565698]' />
            <span className='text-grey-40 text-sm'>Participated</span>
          </div>
          {selectedYear && (
            <Select
              options={yearOptions}
              value={selectedYear}
              onValueChange={setYear}
            />
          )}
        </div>
      </div>

      {isLoading ? (
        <div className='flex min-h-32 items-center justify-center'>
          <LoadingSpinner />
        </div>
      ) : !data || data.length === 0 ? (
        <div className='flex min-h-32 items-center justify-center'>
          <p className='text-grey-40 text-base'>
            No contest participation this year
          </p>
        </div>
      ) : (
        <ContestParticipationHeatmap data={data} year={Number(selectedYear)} />
      )}
    </div>
  )
}
