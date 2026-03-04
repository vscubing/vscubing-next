'use client'

import { useState } from 'react'
import { DisciplineIcon, Select } from '@/frontend/ui'
import { DISCIPLINES, type Discipline } from '@/types'
import { useTRPC } from '@/lib/trpc/react'
import { useQuery } from '@tanstack/react-query'
import { ProgressChart } from './progress-chart'
import { cn } from '@/frontend/utils/cn'
import { LoadingSpinner } from '@/frontend/ui'

const TIME_FRAME_OPTIONS = [
  { value: 'all' as const, view: 'All time' },
  { value: '1year' as const, view: '1 year' },
  { value: '6months' as const, view: '6 months' },
  { value: '3months' as const, view: '3 months' },
] as const

type TimeFrame = (typeof TIME_FRAME_OPTIONS)[number]['value']

export function ProgressSection({ userId }: { userId: string }) {
  const [discipline, setDiscipline] = useState<Discipline>('3by3')
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('all')

  const trpc = useTRPC()
  const { data, isLoading } = useQuery(
    trpc.profile.getProgress.queryOptions({
      userId,
      discipline,
      timeFrame,
    }),
  )

  return (
    <div className='bg-black-80 flex flex-col rounded-2xl p-6 sm:p-4'>
      <div className='relative z-10 mb-4 flex items-center justify-between gap-4 sm:flex-col sm:items-start'>
        <div className='flex flex-col gap-2'>
          <h3 className='title-h3'>Progress</h3>
          <div className='flex gap-1'>
            {DISCIPLINES.map((d) => (
              <button
                key={d}
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
                  discipline === d
                    ? 'bg-secondary-20 text-black-100'
                    : 'bg-grey-100 text-grey-60 hover:text-white-100',
                )}
                onClick={() => setDiscipline(d)}
              >
                <DisciplineIcon discipline={d} />
              </button>
            ))}
          </div>
        </div>
        <div className='flex items-center gap-3'>
          <span className='text-grey-40 text-sm'>AVG</span>
          <Select
            options={[...TIME_FRAME_OPTIONS]}
            value={timeFrame}
            onValueChange={setTimeFrame}
          />
        </div>
      </div>

      {isLoading ? (
        <div className='flex min-h-64 items-center justify-center'>
          <LoadingSpinner />
        </div>
      ) : !data || data.length === 0 ? (
        <div className='flex min-h-64 items-center justify-center'>
          <p className='text-grey-40 text-base'>No progress data yet</p>
        </div>
      ) : (
        <ProgressChart data={data} discipline={discipline} />
      )}
    </div>
  )
}
