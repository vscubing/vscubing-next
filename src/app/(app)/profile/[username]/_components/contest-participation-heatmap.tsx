'use client'

import { HoverPopover } from '@/frontend/ui'
import { formatDate } from '@/lib/utils/format-date'
import type { RouterOutputs } from '@/lib/trpc/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Discipline } from '@/types'
import { themeColors } from '@/frontend/utils/theme'
import { useIsTouchDevice } from '@/frontend/utils/use-media-query'

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
  const isTouch = useIsTouchDevice()

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

  return (
    <div className='flex flex-col gap-1'>
      {QUARTER_LABELS.map((quarter, qi) => (
        <div key={quarter} className='flex items-center gap-2'>
          <span className='text-grey-40 w-6 shrink-0 text-sm'>{quarter}</span>
          <div className='flex flex-1 gap-1'>
            {Array.from({ length: WEEKS_PER_QUARTER }, (_, wi) => {
              const weekIndex = qi * WEEKS_PER_QUARTER + wi
              const contest = contestsByWeek.get(weekIndex)

              if (!contest) {
                return (
                  <div
                    key={wi}
                    className='border-grey-100 h-6 flex-1 rounded border'
                  />
                )
              }

              const isParticipated = contest.disciplines.length > 0

              const contestUrl = isParticipated
                ? `/contests/${contest.contestSlug}/results?discipline=${contest.disciplines[0]}&scrollToId=${contest.sessionId}`
                : `/contests/${contest.contestSlug}/results?discipline=${contest.availableDisciplines[0]}`

              const bgColor = contest.isOngoing
                ? themeColors.primary[60]
                : isParticipated
                  ? contest.isCompleted
                    ? themeColors.secondary[20]
                    : themeColors.secondary[60]
                  : undefined

              return (
                <HoverPopover
                  key={wi}
                  content={
                    <ContestPopoverContent
                      contest={contest}
                      contestUrl={isTouch ? contestUrl : undefined}
                    />
                  }
                  contentClassName={isTouch ? '' : 'pointer-events-none'}
                  asChild
                >
                  <div
                    role='button'
                    tabIndex={0}
                    className={`h-6 flex-1 cursor-pointer rounded border border-transparent transition-opacity hover:opacity-80 ${!bgColor ? 'bg-black-100' : ''}`}
                    style={bgColor ? { backgroundColor: bgColor } : undefined}
                    onClick={
                      isTouch ? undefined : () => router.push(contestUrl)
                    }
                    onKeyDown={
                      isTouch
                        ? undefined
                        : (e) => {
                            if (e.key === 'Enter' || e.key === ' ')
                              router.push(contestUrl)
                          }
                    }
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

function ContestPopoverContent({
  contest,
  contestUrl,
}: {
  contest: ContestData
  contestUrl?: string
}) {
  return (
    <div className='p-3'>
      <p className='title-h3 mb-1'>Contest {contest.contestSlug}</p>
      <p className='text-grey-40 mb-2 text-sm'>
        {formatDate(contest.contestStartDate, 'long')}
        {` - ${formatDate(contest.contestEndDate ?? contest.contestExpectedEndDate, 'long')}`}
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
          color: contest.isOngoing
            ? themeColors.primary[60]
            : contest.disciplines.length === 0
              ? themeColors.grey[60]
              : contest.isCompleted
                ? themeColors.secondary[20]
                : themeColors.secondary[60],
        }}
      >
        {contest.isOngoing
          ? 'Ongoing'
          : contest.disciplines.length === 0
            ? 'Not participated'
            : contest.isCompleted
              ? 'Completed'
              : 'Participated'}
      </p>
      {contestUrl && (
        <Link
          href={contestUrl}
          className='text-primary-60 mt-2 block text-sm font-medium'
        >
          View contest →
        </Link>
      )}
    </div>
  )
}
