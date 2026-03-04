'use client'

import { useState } from 'react'
import { Select } from '@/frontend/ui'
import { useTRPC } from '@/lib/trpc/react'
import { useQuery } from '@tanstack/react-query'
import { ContestParticipationHeatmap } from './contest-participation-heatmap'
import { LoadingSpinner } from '@/frontend/ui'

const currentYear = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => ({
  value: String(currentYear - i),
}))

export function ContestParticipationSection({ userId }: { userId: string }) {
  const [year, setYear] = useState(String(currentYear))

  const trpc = useTRPC()
  const { data, isLoading } = useQuery(
    trpc.profile.getContestParticipation.queryOptions({
      userId,
      year: Number(year),
    }),
  )

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
          <Select options={YEAR_OPTIONS} value={year} onValueChange={setYear} />
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
        <ContestParticipationHeatmap data={data} year={Number(year)} />
      )}
    </div>
  )
}
