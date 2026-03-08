'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { formatSolveTime } from '@/lib/utils/format-solve-time'
import { formatDate } from '@/lib/utils/format-date'
import type { Discipline } from '@/types'
import type { RouterOutputs } from '@/lib/trpc/react'
import { themeColors } from '@/frontend/utils/theme'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useRef } from 'react'
import { useIsTouchDevice } from '@/frontend/utils/use-media-query'

type ProgressData = RouterOutputs['profile']['getProgress']

export function ProgressChart({
  data,
  discipline,
}: {
  data: ProgressData
  discipline: Discipline
}) {
  const router = useRouter()
  const isTouch = useIsTouchDevice()
  const activePointRef = useRef<ProgressData[number] | null>(null)

  const chartData = data
    .filter((d) => !d.isDnf && d.avgMs !== null)
    .map((d) => ({
      ...d,
      dateTs: new Date(d.contestStartDate).getTime(),
    }))

  if (chartData.length === 0) {
    return (
      <div className='flex h-72 items-center justify-center'>
        <p className='text-grey-40 text-base'>No non-DNF results yet</p>
      </div>
    )
  }

  const allTimes = chartData.map((d) => d.avgMs!).filter(Boolean)
  const maxTime = Math.max(...allTimes)
  const showMinutes = maxTime > 60000

  const navigateToActivePoint = () => {
    const point = activePointRef.current
    if (point) {
      router.push(
        `/contests/${point.contestSlug}/results?discipline=${discipline}&scrollToId=${point.sessionId}`,
      )
    }
  }

  return (
    <div
      className={isTouch ? 'h-72' : 'h-72 cursor-pointer'}
      onClick={isTouch ? undefined : navigateToActivePoint}
      role={isTouch ? undefined : 'button'}
      tabIndex={isTouch ? undefined : 0}
      onKeyDown={
        isTouch
          ? undefined
          : (e) => {
              if (e.key === 'Enter' || e.key === ' ') navigateToActivePoint()
            }
      }
    >
      <ResponsiveContainer width='100%' height='100%'>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 20, left: -15, bottom: 5 }}
          style={isTouch ? undefined : { cursor: 'pointer' }}
        >
          <CartesianGrid
            horizontal={true}
            vertical={false}
            stroke={themeColors.grey[100]}
          />
          <XAxis
            dataKey='dateTs'
            type='number'
            scale='time'
            domain={['dataMin', 'dataMax']}
            stroke={themeColors.black[80]}
            tick={{ fill: themeColors.grey[60], fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            minTickGap={40}
            tickFormatter={(ts: number) =>
              new Date(ts).toLocaleDateString('en-US', {
                month: 'short',
                year: '2-digit',
              })
            }
          />
          <YAxis
            stroke={themeColors.black[80]}
            tick={{ fill: themeColors.grey[60], fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value: number) => {
              if (showMinutes) return `${Math.floor(value / 60000)}m`
              const seconds = Math.round(value / 1000)
              return `${seconds}s`
            }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload?.[0]) {
                activePointRef.current = payload[0]
                  .payload as ProgressData[number]
              } else {
                activePointRef.current = null
              }

              if (!active || !payload?.[0]) return null
              const d = payload[0].payload as ProgressData[number] & {
                dateTs: number
              }
              return (
                <div
                  className={
                    isTouch
                      ? 'bg-black-100 border-grey-100 rounded-lg border p-3 shadow-lg'
                      : 'bg-black-100 border-grey-100 pointer-events-none rounded-lg border p-3 shadow-lg'
                  }
                >
                  <p className='title-h3 mb-1'>Contest {d.contestSlug}</p>
                  <p className='text-grey-40 text-sm'>
                    {formatDate(d.contestStartDate, 'long')} · {d.contestType}
                  </p>
                  {d.avgMs && !d.isDnf && (
                    <p className='mt-2 text-base text-yellow-100'>
                      Average: {formatSolveTime(d.avgMs, true)}
                    </p>
                  )}
                  {d.bestSingleMs && (
                    <p className='text-secondary-20 text-base'>
                      Best single: {formatSolveTime(d.bestSingleMs, true)}
                    </p>
                  )}
                  {isTouch && (
                    <Link
                      href={`/contests/${d.contestSlug}/results?discipline=${discipline}&scrollToId=${d.sessionId}`}
                      className='text-primary-60 mt-2 block text-sm font-medium'
                    >
                      View contest →
                    </Link>
                  )}
                </div>
              )
            }}
            wrapperStyle={{
              zIndex: 10,
              pointerEvents: isTouch ? 'auto' : 'none',
            }}
          />
          <Line
            type='monotone'
            dataKey='avgMs'
            stroke={themeColors.secondary[20]}
            strokeWidth={2}
            dot={{ fill: themeColors.secondary[20], r: 4 }}
            activeDot={{ fill: themeColors.secondary[20], r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
