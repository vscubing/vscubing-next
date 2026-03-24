import { Suspense } from 'react'
import { api } from '@/lib/trpc/server'
import { tryCatchTRPC } from '@/lib/utils/try-catch'
import { notFound } from 'next/navigation'
import { NavigateBackButton } from '@/frontend/shared/navigate-back-button'
import { LayoutHeaderTitlePortal } from '@/app/(app)/_layout/layout-header'
import { DisciplineIcon, LoadingSpinner } from '@/frontend/ui'
import { DISCIPLINES, type Discipline } from '@/types'
import { themeColors } from '@/frontend/utils/theme'

const DISCIPLINE_LABELS: Record<Discipline, string> = {
  '2by2': '2x2',
  '3by3': '3x3',
  '4by4': '4x4',
}
import { UserInfoSection } from './_components/user-info-section'
import {
  ProfileStatsSection,
  ProfileStatsFallback,
} from './_components/profile-stats-section'
import { CompletedSolvesSection } from './_components/completed-solves-section'
import { PersonalRecordsSection } from './_components/personal-records-section'
import { ProgressSection } from './_components/progress-section'
import { ContestParticipationSection } from './_components/contest-participation-section'

const DISCIPLINE_COLORS: Record<Discipline, string> = {
  '2by2': themeColors.primary[100],
  '3by3': themeColors.yellow[100],
  '4by4': themeColors.secondary[20],
}

function CompletedSolvesFallback() {
  return (
    <div className='bg-black-80 flex items-center justify-center rounded-2xl p-6 sm:p-4'>
      <div className='flex flex-col items-center gap-4'>
        <div className='flex h-40 w-40 items-center justify-center'>
          <LoadingSpinner />
        </div>
        <div className='flex items-center gap-4'>
          {DISCIPLINES.map((d) => (
            <div key={d} className='flex items-center gap-1.5'>
              <span
                className='h-2 w-2 rounded-[2px]'
                style={{ backgroundColor: DISCIPLINE_COLORS[d] }}
              />
              <span className='text-grey-40 text-sm'>
                {DISCIPLINE_LABELS[d]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const FALLBACK_COL_CLASSES = 'grid grid-cols-5 items-center gap-x-2 px-4 py-2.5'

function PersonalRecordsFallback() {
  return (
    <div className='bg-black-80 flex flex-col rounded-2xl p-6 sm:p-4'>
      <h3 className='title-h3 mb-4'>Current personal records</h3>
      <div className='sm:hidden'>
        <div className='border-grey-100 divide-grey-100 divide-y rounded-xl border'>
          <div className={`text-grey-40 ${FALLBACK_COL_CLASSES} text-sm`}>
            <span>Discipline</span>
            <span>Rank Single</span>
            <span>Single Time</span>
            <span>Average Time</span>
            <span>Rank Average</span>
          </div>
          {DISCIPLINES.map((d) => (
            <div key={d} className={FALLBACK_COL_CLASSES}>
              <span className='flex items-center gap-2'>
                <DisciplineIcon discipline={d} />
                <span className='text-base'>{DISCIPLINE_LABELS[d]}</span>
              </span>
              <span className='bg-grey-100 inline-block h-8 w-8 animate-pulse rounded-full' />
              <span className='bg-grey-100 inline-block h-6 w-16 animate-pulse rounded' />
              <span className='bg-grey-100 inline-block h-6 w-16 animate-pulse rounded' />
              <span className='bg-grey-100 inline-block h-8 w-8 animate-pulse rounded-full' />
            </div>
          ))}
        </div>
      </div>
      <div className='hidden flex-col gap-3 sm:flex'>
        {DISCIPLINES.map((d) => (
          <div
            key={d}
            className='border-grey-100 divide-grey-100 divide-y rounded-xl border'
          >
            <div className='flex items-center gap-2 px-4 py-3'>
              <DisciplineIcon discipline={d} />
              <span className='title-h3 flex-1'>{DISCIPLINE_LABELS[d]}</span>
            </div>
            {(
              [
                { label: 'Rank Single', isRank: true },
                { label: 'Single Time', isRank: false },
                { label: 'Average Time', isRank: false },
                { label: 'Rank Average', isRank: true },
              ] as const
            ).map(({ label, isRank }) => (
              <div
                key={label}
                className='flex items-center justify-between px-4 py-2.5'
              >
                <span className='text-grey-40 text-sm'>{label}</span>
                {isRank ? (
                  <span className='bg-grey-100 h-8 w-8 animate-pulse rounded-full' />
                ) : (
                  <span className='bg-grey-100 h-5 w-12 animate-pulse rounded' />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
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

      <div className='grid grid-cols-[1fr_auto] gap-3 md:grid-cols-1'>
        <UserInfoSection
          profile={profile}
          statsSlot={
            <Suspense fallback={<ProfileStatsFallback />}>
              <ProfileStatsSection
                userId={profile.id}
                createdAt={profile.createdAt}
              />
            </Suspense>
          }
        />
        <Suspense fallback={<CompletedSolvesFallback />}>
          <CompletedSolvesSection userId={profile.id} />
        </Suspense>
      </div>

      <Suspense fallback={<PersonalRecordsFallback />}>
        <PersonalRecordsSection userId={profile.id} />
      </Suspense>

      <ProgressSection userId={profile.id} />

      <ContestParticipationSection userId={profile.id} />
    </section>
  )
}
