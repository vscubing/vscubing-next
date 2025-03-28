'use client'

import { LoadingSpinner } from '@/app/_components/ui'
import type { Discipline } from '@/app/_types'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const TwistySectionContent = dynamic(() => import('./twisty-section.lazy'), {
  ssr: true,
})

export function TwistySection({
  scramble,
  solution,
  discipline,
}: {
  solution: string
  scramble: string
  discipline: Discipline
}) {
  return (
    <Suspense
      fallback={
        <div className='col-span-full flex items-center justify-center rounded-2xl bg-black-80'>
          <LoadingSpinner />
        </div>
      }
    >
      <TwistySectionContent
        solution={solution}
        scramble={scramble}
        discipline={discipline}
      />
    </Suspense>
  )
}
