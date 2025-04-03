'use client'

import { LayoutSectionHeader } from '@/app/(main)/_layout'
import { LayoutHeaderTitlePortal } from '@/app/(main)/_layout/layout-header'
import { DisciplineBadge, LoadingSpinner } from '@/app/_components/ui'
import { NavigateBackButton } from '@/app/_shared/NavigateBackButton'
import { formatSolveTime } from '@/app/_utils/formatSolveTime'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { ShareSolveButton } from './_components/share-button'
import { TwistySection } from './_components/twisty-section'
import { castDiscipline } from '@/app/_types'
import { useParams } from 'next/navigation'
import { LoadingDots } from '@/app/_components/ui/loading-dots'

export default function Loading() {
  const searchParams = useSearchParams()
  const pathParams = useParams()
  const contestSlug = pathParams.contestSlug as string
  const discipline = castDiscipline(searchParams.get('discipline'))

  return (
    <section className='flex flex-1 flex-col gap-3'>
      <NavigateBackButton className='self-start' />
      <LayoutHeaderTitlePortal>Watch the solve replay</LayoutHeaderTitlePortal>
      <div className='grid flex-1 grid-cols-[1.22fr_1fr] grid-rows-[min-content,1fr] gap-3 lg:grid-cols-2 sm:grid-cols-1 sm:grid-rows-[min-content,min-content,1fr]'>
        <LayoutSectionHeader className='gap-4'>
          <DisciplineBadge discipline={discipline} />
          <div>
            <Link
              href={`/contests/${contestSlug}?discipline=${discipline}`}
              className='title-h2 mb-1 text-secondary-20'
            >
              Contest {contestSlug}
            </Link>
            <p className='text-large'>Scramble ...</p>
          </div>
        </LayoutSectionHeader>
        <div className='flex items-center justify-between rounded-2xl bg-black-80 px-4 py-2'>
          <div className='sm:min-h-14'>
            <p className='title-h3 mb-1 min-h-8'>...</p>
            <p className='text-large text-grey-20'>{formatSolveTime(0)}</p>
          </div>
          <ShareSolveButton />
        </div>

        <div className='col-span-full flex items-center justify-center rounded-2xl bg-black-80'>
          <LoadingSpinner />
        </div>
      </div>
    </section>
  )
}
