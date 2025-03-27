'use client'

import { DisciplineSwitcherItem } from '@/app/_components/ui'
import { type Discipline } from '@/app/_types'
import { DISCIPLINES } from '@/shared'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function DisciplineSwitcher({
  initialDiscipline,
}: {
  initialDiscipline: Discipline
}) {
  const [currentDiscipline, setCurrentDiscipline] =
    useState<Discipline>(initialDiscipline)

  return (
    <div className='flex gap-3'>
      {DISCIPLINES.map((discipline) => (
        <Link
          href={`/contests?discipline=${discipline}`}
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
