'use client'

import { LayoutSectionHeader } from '@/app/(main)/_layout'
import { LayoutHeaderTitlePortal } from '@/app/(main)/_layout/layout-header'
import { ExclamationCircleIcon, LoadingSpinner } from '@/app/_components/ui'
import { DisciplineSwitcher } from '@/app/_shared/discipline-switcher-client'
import { NavigateBackButton } from '@/app/_shared/NavigateBackButton'
import { castDiscipline, DISCIPLINES } from '@/app/_types'
import { useSearchParams } from 'next/navigation'

export default function Loading() {
  const searchParams = useSearchParams()
  const discipline = castDiscipline(searchParams.get('discipline'))

  const title = 'Solve the ongoing contest'
  return (
    <section className='flex flex-1 flex-col gap-3'>
      <h1 className='title-h2 hidden text-secondary-20 lg:block'>{title}</h1>
      <LayoutHeaderTitlePortal>{title}</LayoutHeaderTitlePortal>
      <NavigateBackButton className='self-start' />
      <LayoutSectionHeader>
        <div className='flex gap-3'>
          <DisciplineSwitcher
            disciplines={DISCIPLINES}
            initialDiscipline={discipline}
          />
        </div>
        <div className='ml-10 flex flex-1 items-center gap-4'>
          <ExclamationCircleIcon />
          <p>
            You can&apos;t see the results of an ongoing round until you solve
            all scrambles or the round ends
          </p>
        </div>
      </LayoutSectionHeader>

      <div className='flex flex-1 items-center justify-center rounded-2xl bg-black-80'>
        <LoadingSpinner size='lg' />
      </div>
    </section>
  )
}
