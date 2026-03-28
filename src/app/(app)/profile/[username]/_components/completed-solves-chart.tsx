'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import type { Discipline } from '@/types'
import type { RouterOutputs } from '@/lib/trpc/react'
import { themeColors } from '@/frontend/utils/theme'

const DISCIPLINE_COLORS: Record<Discipline, string> = {
  '2by2': themeColors.primary[100],
  '3by3': themeColors.yellow[100],
  '4by4': themeColors.secondary[20],
}

const DISCIPLINE_LABELS: Record<Discipline, string> = {
  '2by2': '2x2',
  '3by3': '3x3',
  '4by4': '4x4',
}

type CompletedSolvesData = RouterOutputs['profile']['getCompletedSolves']

export function CompletedSolvesChart({
  data,
  total,
}: {
  data: CompletedSolvesData
  total: number
}) {
  return (
    <div className='flex flex-col items-center gap-4'>
      <div className='relative h-40 w-40'>
        <ResponsiveContainer width='100%' height='100%'>
          <PieChart>
            <Pie
              data={data}
              cx='50%'
              cy='50%'
              innerRadius={48}
              outerRadius={68}
              dataKey='solveCount'
              stroke='none'
            >
              {data.map((entry) => (
                <Cell
                  key={entry.discipline}
                  fill={DISCIPLINE_COLORS[entry.discipline]}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null
                const d = (
                  payload[0] as { payload: CompletedSolvesData[number] }
                ).payload
                return (
                  <div className='bg-black-100 border-grey-100 z-50 rounded-lg border p-3 shadow-lg'>
                    <div className='mb-2 flex items-center gap-2'>
                      <span
                        className='h-2 w-2 rounded-[2px]'
                        style={{
                          backgroundColor: DISCIPLINE_COLORS[d.discipline],
                        }}
                      />
                      <span className='text-white-100 text-sm'>
                        Type: {DISCIPLINE_LABELS[d.discipline]}
                      </span>
                    </div>
                    <p className='text-grey-20 text-sm'>
                      Completed solves: {d.solveCount}
                    </p>
                    <p className='text-grey-20 text-sm'>
                      Competitions: {d.contestCount}
                    </p>
                  </div>
                )
              }}
              wrapperStyle={{ zIndex: 50 }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className='pointer-events-none absolute inset-0 flex flex-col items-center justify-center'>
          <span className='text-2xl font-bold'>{total}</span>
          <span className='text-grey-40 text-xs leading-tight'>Completed</span>
          <span className='text-grey-40 text-xs leading-tight'>solves</span>
        </div>
      </div>
      <div className='flex items-center gap-4'>
        {data.map((entry) => (
          <div key={entry.discipline} className='flex items-center gap-1.5'>
            <span
              className='h-2 w-2 rounded-[2px]'
              style={{
                backgroundColor: DISCIPLINE_COLORS[entry.discipline],
              }}
            />
            <span className='text-grey-40 text-sm'>
              {DISCIPLINE_LABELS[entry.discipline]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
