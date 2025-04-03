import { castDiscipline } from '@/app/_types'
import { api } from '@/trpc/server'
import { DisciplineSwitcher } from '@/app/_shared/discipline-switcher-client'
import { NavigateBackButton } from '@/app/_shared/NavigateBackButton'
import { PageTitleMobile } from '@/app/_shared/PageTitleMobile'
import { LayoutHeaderTitlePortal } from '@/app/(main)/_layout/layout-header'
import { tryCatchTRPC } from '@/app/_utils/try-catch'
import { redirect } from 'next/navigation'
import { HintSignInSection } from '@/app/_shared/HintSection'
import { CONTEST_UNAUTHORIZED_MESSAGE } from '@/shared'
import { SessionList } from './_components/session-list'
import { LayoutSectionHeader } from '@/app/(main)/_layout'

export default async function ContestResultsPage({
  params,
  searchParams,
}: {
  params: Promise<{ contestSlug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { contestSlug } = await params
  const { data: contest, error } = await tryCatchTRPC(
    api.contest.getContestMetaData({ contestSlug }),
  )
  const discipline = castDiscipline((await searchParams).discipline)

  if (error?.code === 'UNAUTHORIZED')
    return <HintSignInSection description={CONTEST_UNAUTHORIZED_MESSAGE} />

  if (error?.code === 'FORBIDDEN')
    redirect(`/contests/${contestSlug}/solve?discipline=${discipline}`)

  if (error) throw error

  let title = ''
  if (contest.isOngoing) {
    title = 'Check out the preliminary results'
  } else {
    title = 'Look through the contest results'
  }
  return (
    <>
      <PageTitleMobile>{title}</PageTitleMobile>
      <LayoutHeaderTitlePortal>{title}</LayoutHeaderTitlePortal>
      <NavigateBackButton className='self-start' />
      <LayoutSectionHeader>
        <DisciplineSwitcher
          disciplines={contest.disciplines}
          initialDiscipline={discipline}
        />
      </LayoutSectionHeader>

      <SessionList contestSlug={contestSlug} discipline={discipline} />
    </>
  )
}
