'use client'

import { HoverPopover } from '@/frontend/ui'
import { formatDate } from '@/lib/utils/format-date'
import type { RouterOutputs } from '@/lib/trpc/react'
import { useRouter } from 'next/navigation'
import type { Discipline } from '@/types'
import { themeColors } from '@/frontend/utils/theme'

type ContestData = RouterOutputs['profile']['getContestParticipation'][number]

const DISCIPLINE_LABELS: Record<Discipline, string> = {
  '2by2': '2x2',
  '3by3': '3x3',
  '4by4': '4x4',
}

const QUARTER_LABELS = ['Q1', 'Q2', 'Q3', 'Q4']
const WEEKS_PER_QUARTER = 13

export function ContestParticipationHeatmap({
  data,
  year,
}: {
  data: ContestData[]
  year: number
}) {
  const router = useRouter()

  const contestsByWeek = new Map<number, ContestData>()
  for (const contest of data) {
    const contestDate = new Date(contest.contestStartDate)
    const yearStart = new Date(year, 0, 1)
    const dayOfYear = Math.floor(
      (contestDate.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24),
    )
    const week = Math.floor(dayOfYear / 7)
    contestsByWeek.set(week, contest)
  }

  const now = new Date()
  const currentYearStart = new Date(year, 0, 1)
  const currentWeek =
    now.getFullYear() === year
      ? Math.floor(
          (now.getTime() - currentYearStart.getTime()) /
            (1000 * 60 * 60 * 24 * 7),
        )
      : now.getFullYear() > year
        ? 52
        : -1

  return (
    <div className='flex flex-col gap-1'>
      {QUARTER_LABELS.map((quarter, qi) => (
        <div key={quarter} className='flex items-center gap-2'>
          <span className='text-grey-40 w-6 shrink-0 text-sm'>{quarter}</span>
          <div className='flex flex-1 gap-1'>
            {Array.from({ length: WEEKS_PER_QUARTER }, (_, wi) => {
              const weekIndex = qi * WEEKS_PER_QUARTER + wi
              const contest = contestsByWeek.get(weekIndex)
              const isFuture = weekIndex > currentWeek

              if (!contest && isFuture) {
                return (
                  <div
                    key={wi}
                    className='border-grey-100 h-6 flex-1 rounded border'
                  />
                )
              }

              if (!contest) {
                return (
                  <div
                    key={wi}
                    className='bg-black-100 h-6 flex-1 rounded border border-transparent'
                  />
                )
              }

              const isParticipated = contest.disciplines.length > 0

              if (!isParticipated) {
                const contestUrl = `/contests/${contest.contestSlug}/results?discipline=${contest.availableDisciplines[0]}`
                return (
                  <HoverPopover
                    key={wi}
                    content={<ContestPopoverContent contest={contest} />}
                    contentClassName='pointer-events-none'
                    asChild
                  >
                    <div
                      role='button'
                      tabIndex={0}
                      className='bg-black-100 h-6 flex-1 cursor-pointer rounded border border-transparent transition-opacity hover:opacity-80'
                      onClick={() => router.push(contestUrl)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ')
                          router.push(contestUrl)
                      }}
                    />
                  </HoverPopover>
                )
              }

              return (
                <HoverPopover
                  key={wi}
                  content={<ContestPopoverContent contest={contest} />}
                  contentClassName='pointer-events-none'
                  asChild
                >
                  <div
                    role='button'
                    tabIndex={0}
                    className='h-6 flex-1 cursor-pointer rounded border border-transparent transition-opacity hover:opacity-80'
                    style={{
                      backgroundColor: contest.isCompleted
                        ? themeColors.secondary[20]
                        : themeColors.secondary[60],
                    }}
                    onClick={() =>
                      router.push(
                        `/contests/${contest.contestSlug}/results?discipline=${contest.disciplines[0]}&scrollToId=${contest.sessionId}`,
                      )
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ')
                        router.push(
                          `/contests/${contest.contestSlug}/results?discipline=${contest.disciplines[0]}&scrollToId=${contest.sessionId}`,
                        )
                    }}
                  />
                </HoverPopover>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

function ContestPopoverContent({ contest }: { contest: ContestData }) {
  return (
    <div className='p-3'>
      <p className='title-h3 mb-1'>Contest {contest.contestSlug}</p>
      <p className='text-grey-40 mb-2 text-sm'>
        {formatDate(contest.contestStartDate, 'long')}
        {contest.contestEndDate &&
          ` - ${formatDate(contest.contestEndDate, 'long')}`}
      </p>
      <div className='text-sm'>
        <p className='text-grey-20 mb-1 font-medium'>Disciplines:</p>
        {contest.availableDisciplines.map((d) => {
          const completed = contest.disciplines.includes(d)
          return (
            <p key={d} className='flex items-center gap-1.5'>
              {completed ? (
                <span className='text-secondary-20 text-xs'>✓</span>
              ) : (
                <span className='text-grey-60 text-xs'>✗</span>
              )}
              <span
                className={
                  completed ? 'text-white-100' : 'text-grey-60 line-through'
                }
              >
                {DISCIPLINE_LABELS[d] ?? d}
              </span>
            </p>
          )
        })}
      </div>
      <p
        className='mt-2 text-sm font-medium'
        style={{
          color:
            contest.disciplines.length === 0
              ? themeColors.grey[60]
              : contest.isCompleted
                ? themeColors.secondary[20]
                : themeColors.secondary[60],
        }}
      >
        {contest.disciplines.length === 0
          ? 'Not participated'
          : contest.isCompleted
            ? 'Completed'
            : 'Participated'}
      </p>
    </div>
  )
}
