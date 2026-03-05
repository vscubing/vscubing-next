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
import { useRouter } from 'next/navigation'
import { useRef } from 'react'

type ProgressData = RouterOutputs['profile']['getProgress']

export function ProgressChart({
  data,
  discipline,
}: {
  data: ProgressData
  discipline: Discipline
}) {
  const router = useRouter()
  const activePointRef = useRef<ProgressData[number] | null>(null)

  const chartData = data
    .filter((d) => !d.isDnf && d.avgMs !== null)
    .map((d) => ({
      ...d,
      date: new Date(d.contestStartDate).toLocaleDateString('en-US', {
        month: 'short',
        year: '2-digit',
      }),
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
      className='h-72 cursor-pointer'
      onClick={navigateToActivePoint}
      role='button'
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') navigateToActivePoint()
      }}
    >
      <ResponsiveContainer width='100%' height='100%'>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 20, left: -15, bottom: 5 }}
          style={{ cursor: 'pointer' }}
        >
          <CartesianGrid horizontal={true} vertical={false} stroke='#3D3D45' />
          <XAxis
            dataKey='date'
            stroke='#2A2A2E'
            tick={{ fill: '#6B6B76', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            minTickGap={40}
          />
          <YAxis
            stroke='#2A2A2E'
            tick={{ fill: '#6B6B76', fontSize: 12 }}
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
                date: string
              }
              return (
                <div className='bg-black-80 border-grey-100 pointer-events-none rounded-lg border p-3 shadow-lg'>
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
                </div>
              )
            }}
            wrapperStyle={{ zIndex: 10, pointerEvents: 'none' }}
          />
          <Line
            type='monotone'
            dataKey='avgMs'
            stroke='#8F8FFE'
            strokeWidth={2}
            dot={{ fill: '#8F8FFE', r: 4 }}
            activeDot={{ fill: '#8F8FFE', r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
