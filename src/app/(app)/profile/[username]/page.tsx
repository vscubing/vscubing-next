import { Suspense } from 'react'
import { api } from '@/lib/trpc/server'
import { tryCatchTRPC } from '@/lib/utils/try-catch'
import { notFound } from 'next/navigation'
import { NavigateBackButton } from '@/frontend/shared/navigate-back-button'
import { LayoutHeaderTitlePortal } from '@/app/(app)/_layout/layout-header'
import { LoadingSpinner } from '@/frontend/ui'
import { UserInfoSection } from './_components/user-info-section'
import { CompletedSolvesSection } from './_components/completed-solves-section'
import { PersonalRecordsSection } from './_components/personal-records-section'
import { ProgressSection } from './_components/progress-section'
import { ContestParticipationSection } from './_components/contest-participation-section'

function SectionFallback() {
  return (
    <div className='bg-black-80 flex min-h-40 items-center justify-center rounded-2xl'>
      <LoadingSpinner />
    </div>
  )
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params

  const { data: profile, error } = await tryCatchTRPC(
    api.profile.getProfile({ username }),
  )
  if (error?.code === 'NOT_FOUND') notFound()
  if (error) throw error

  return (
    <section className='flex flex-1 flex-col gap-3'>
      <NavigateBackButton className='self-start' />
      <LayoutHeaderTitlePortal>Profile</LayoutHeaderTitlePortal>

      <div className='grid grid-cols-[1fr_auto] gap-3 sm:grid-cols-1'>
        <UserInfoSection profile={profile} />
        <Suspense fallback={<SectionFallback />}>
          <CompletedSolvesSection userId={profile.id} />
        </Suspense>
      </div>

      <Suspense fallback={<SectionFallback />}>
        <PersonalRecordsSection userId={profile.id} />
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <ProgressSection userId={profile.id} />
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <ContestParticipationSection userId={profile.id} />
      </Suspense>
    </section>
  )
}
