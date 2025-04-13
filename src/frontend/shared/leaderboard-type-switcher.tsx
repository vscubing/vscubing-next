'use client'

import { LEADERBOARD_TYPES, type LeaderboardType } from '@/types'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useState, type ReactNode } from 'react'
import { cn } from '../utils/cn'
import { AverageIcon, SingleIcon } from '../ui'

export function LeaderboardTypeSwitcher({
  initialType,
}: {
  initialType?: LeaderboardType
}) {
  const [currentType, setCurrentType] = useState<LeaderboardType | undefined>(
    initialType,
  )

  const pathname = usePathname()
  const searchParams = useSearchParams()

  const upsertSearchParam = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(name, value)

      return params.toString()
    },
    [searchParams],
  )

  return (
    <div className='flex rounded-xl bg-grey-100'>
      {LEADERBOARD_TYPES.map((type) => (
        <Link
          href={{
            pathname,
            query: upsertSearchParam('type', type),
          }}
          onClick={() => setCurrentType(type)}
          key={type}
        >
          <LeaderboardTypeSwitcherItem
            type={type}
            isActive={type === currentType}
          />
        </Link>
      ))}
    </div>
  )
}

function LeaderboardTypeSwitcherItem({
  className,
  isActive,
  type,
}: {
  className?: string
  isActive?: boolean
  type: LeaderboardType
}) {
  // TODO: sliding background
  return (
    <span
      className={cn(
        'transition-base outline-ring btn-sm flex h-15 w-[8.5rem] cursor-pointer items-center justify-center gap-1 rounded-xl sm:h-11 sm:w-11',
        isActive
          ? 'bg-secondary-20 text-black-100'
          : 'border border-transparent text-grey-60 hover:border-secondary-20 active:bg-secondary-20 active:text-black-100',
        className,
      )}
    >
      <span className='sm:hidden'>{SWITCHER_ICON[type]}</span>
      <span className='sm:hidden'>{SWITCHER_TEXT_DESKTOP[type]}</span>
      <span className='hidden sm:inline'>{SWITCHER_TEXT_MOBILE[type]}</span>
    </span>
  )
}

const SWITCHER_ICON: Record<LeaderboardType, ReactNode> = {
  average: <AverageIcon />,
  single: <SingleIcon />,
}

const SWITCHER_TEXT_DESKTOP: Record<LeaderboardType, string> = {
  average: 'Average time',
  single: 'Single time',
}

const SWITCHER_TEXT_MOBILE: Record<LeaderboardType, string> = {
  average: 'AVG',
  single: 'SNG',
}
