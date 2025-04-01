'use client'

import { DisciplineSwitcherItem } from '@/app/_components/ui'
import { type Discipline } from '@/app/_types'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'

export function DisciplineSwitcher({
  initialDiscipline,
  disciplines,
}: {
  initialDiscipline: Discipline
  disciplines: Readonly<Discipline[]>
}) {
  const [currentDiscipline, setCurrentDiscipline] =
    useState<Discipline>(initialDiscipline)

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
    <div className='flex gap-3'>
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
            asButton={false}
            discipline={discipline}
            isActive={discipline === currentDiscipline}
          />
        </Link>
      ))}
    </div>
  )
}
