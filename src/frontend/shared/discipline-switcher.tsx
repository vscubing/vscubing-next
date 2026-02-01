'use client'

import { type Discipline } from '@/types'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'
import { DisciplineBadge } from '../ui'
import { cn } from '../utils/cn'

export function DisciplineSwitcher({
  initialDiscipline,
  disciplines,
}: {
  initialDiscipline?: Discipline
  disciplines: Readonly<Discipline[]>
}) {
  const [currentDiscipline, setCurrentDiscipline] = useState<
    Discipline | undefined
  >(initialDiscipline)

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
    <div className='flex gap-3 sm:gap-2'>
      {disciplines.map((discipline) => (
        <Link
          href={{
            pathname,
            query: upsertSearchParam('discipline', discipline),
          }}
          onClick={() => setCurrentDiscipline(discipline)}
          key={discipline}
        >
          <DisciplineSwitcherItem
            discipline={discipline}
            isActive={discipline === currentDiscipline}
          />
        </Link>
      ))}
    </div>
  )
}

function DisciplineSwitcherItem({
  className,
  isActive,
  discipline,
}: {
  className?: string
  isActive?: boolean
  discipline: Discipline
}) {
  return (
    <DisciplineBadge
      className={cn(
        'transition-base outline-ring cursor-pointer border border-transparent bg-grey-100 text-grey-60 hover:border-secondary-20 active:bg-secondary-20 active:text-black-100',
        { 'bg-secondary-20 text-black-100': isActive },
        className,
      )}
      discipline={discipline}
    />
  )
}
