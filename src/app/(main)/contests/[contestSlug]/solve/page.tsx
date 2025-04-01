import { LayoutHeader, SectionHeader } from '@/app/_components/layout'
import {
  Dialog,
  DialogOverlay,
  DialogPortal,
  ExclamationCircleIcon,
} from '@/app/_components/ui'
import { DisciplineSwitcher } from '@/app/_shared/discipline-switcher-client'
import { HintSignInSection } from '@/app/_shared/HintSection'
import {
  KeyMapDialogTrigger,
  KeyMapDialogContent,
} from '@/app/_shared/KeyMapDialog'
import { NavigateBackButton } from '@/app/_shared/NavigateBackButton'
import { DEFAULT_DISCIPLINE, isDiscipline } from '@/app/_types'
import { formatContestDuration } from '@/app/_utils/formatDate'
import { getContestUserCapabilities } from '@/server/api/routers/contest'
import { CONTEST_UNAUTHORIZED_MESSAGE } from '@/shared'
import { api } from '@/trpc/server'
import { notFound } from 'next/navigation'
import { redirect } from 'next/navigation'
import React from 'react'
import { SolveContestForm } from './_components'

export default async function SolveContestPage(props: {
  params: Promise<{ contestSlug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { contestSlug } = await props.params
  const searchParams = await props.searchParams
  const discipline = searchParams.discipline ?? DEFAULT_DISCIPLINE
  if (!isDiscipline(discipline)) redirect(`/contests/${contestSlug}`)

  const userCapabilities = await getContestUserCapabilities({
    contestSlug,
    discipline,
  })
  if (userCapabilities === 'CONTEST_NOT_FOUND') notFound()
  if (userCapabilities === 'UNAUTHORIZED')
    return <HintSignInSection description={CONTEST_UNAUTHORIZED_MESSAGE} />
  if (userCapabilities === 'VIEW_RESULTS')
    redirect(`/contests/${contestSlug}/results?discipline=${discipline}`)

  const contest = await api.contest.getContestMetaData({
    contestSlug,
  })

  const title = (
    <>
      Ongoing contest{' '}
      <span className='whitespace-nowrap'>
        ({formatContestDuration(contest)})
      </span>
    </>
  )

  // TODO: ongoing contest hint
  // TODO: touch devices not supported hint

  return (
    <section className='flex flex-1 flex-col gap-3'>
      <LayoutHeader title={title} />
      <h1 className='title-h2 hidden text-secondary-20 lg:block'>{title}</h1>
      <NavigateBackButton className='self-start' />
      <SectionHeader>
        <div className='flex gap-3'>
          <DisciplineSwitcher
            initialDiscipline={discipline}
            disciplines={contest.disciplines}
          />
        </div>
        <div className='ml-10 flex flex-1 items-center gap-4'>
          <ExclamationCircleIcon />
          <p>
            You can&apos;t see the results of an ongoing round until you solve
            all scrambles or the round ends
          </p>
        </div>
      </SectionHeader>

      <div className='relative flex flex-1 flex-col rounded-2xl bg-black-80 pb-8 pt-7 xl-short:pb-6 xl-short:pt-4'>
        <Dialog>
          <KeyMapDialogTrigger className='absolute right-4 top-4' />
          <DialogPortal>
            <DialogOverlay className='bg-black-1000/40' withCubes={false} />
            <KeyMapDialogContent />
          </DialogPortal>
        </Dialog>

        <p className='title-h2 mb-6 text-center text-secondary-20'>
          You have five attempts to solve the contest
        </p>
        {/*TODO: suspense*/}
        <SolveContestForm contestSlug={contestSlug} discipline={discipline} />
      </div>
    </section>
  )
}
