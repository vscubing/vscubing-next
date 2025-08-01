import {
  Dialog,
  DialogOverlay,
  DialogPortal,
  ExclamationCircleIcon,
  LoadingSpinner,
  SecondaryButton,
  SettingIcon,
} from '@/frontend/ui'
import { HintSignInSection } from '@/frontend/shared/hint-section'
import {
  KeyMapDialogTrigger,
  KeyMapDialogContent,
} from '@/frontend/shared/key-map-dialog'
import { isDiscipline, type Discipline } from '@/types'
import { CONTEST_UNAUTHORIZED_MESSAGE, DISCIPLINES } from '@/types'
import { notFound } from 'next/navigation'
import { redirect } from 'next/navigation'
import { Suspense, type ReactNode } from 'react'
import { SimulatorProvider } from './_components'
import { SolveContestForm } from './_components'
import Link from 'next/link'
import { api } from '@/trpc/server'
import { tryCatchTRPC } from '@/utils/try-catch'
import { LayoutSectionHeader } from '@/app/(app)/_layout'
import {
  LayoutHeaderTitlePortal,
  LayoutHeaderTitlePortalFallback,
} from '@/app/(app)/_layout/layout-header'
import { DisciplineSwitcher } from '@/frontend/shared/discipline-switcher'
import { withSuspense } from '@/frontend/utils/with-suspense'
import {
  LayoutPageTitleMobile,
  LayoutPageTitleMobileFallback,
} from '@/app/(app)/_layout/layout-page-title-mobile'
import { formatContestDuration } from '@/utils/format-date'
import { NavigateBackButton } from '@/frontend/shared/navigate-back-button'

export default async function SolveContestPage({
  searchParams,
  params,
}: {
  params: Promise<{ contestSlug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
  children: ReactNode
}) {
  const { discipline } = await searchParams
  const { contestSlug } = await params
  if (!isDiscipline(discipline)) redirect(`/contests/${contestSlug}`)

  const metadata = await api.contest.getContestMetaData({ contestSlug })

  return (
    <>
      <PageTitle />
      <NavigateBackButton className='self-start' />
      <LayoutSectionHeader>
        <div className='flex gap-3'>
          <DisciplineSwitcher
            disciplines={metadata.disciplines}
            initialDiscipline={discipline}
          />
        </div>
        <div className='ml-10 flex flex-1 items-center gap-4 sm:sr-only'>
          <ExclamationCircleIcon className='shrink-0' />
          <p>
            You can't see the results of an ongoing round until you solve all
            scrambles or the round ends
          </p>
        </div>
      </LayoutSectionHeader>

      <Suspense
        key={discipline}
        fallback={
          <div className='flex-1 rounded-2xl bg-black-80'>
            <div className='flex h-full items-center justify-center'>
              <LoadingSpinner size='lg' />
            </div>
          </div>
        }
      >
        <PageContent contestSlug={contestSlug} discipline={discipline} />
      </Suspense>
    </>
  )
}

const PageTitle = withSuspense(
  async () => {
    const ongoing = await api.contest.getOngoing()
    if (!ongoing) return
    const title = (
      <>
        Ongoing contest {ongoing?.slug}{' '}
        <span className='text-nowrap'>({formatContestDuration(ongoing)})</span>
      </>
    )
    return (
      <>
        <LayoutPageTitleMobile>{title}</LayoutPageTitleMobile>
        <LayoutHeaderTitlePortal>{title}</LayoutHeaderTitlePortal>
      </>
    )
  },
  <>
    <LayoutPageTitleMobileFallback />
    <LayoutHeaderTitlePortalFallback />
  </>,
)

async function PageContent({
  contestSlug,
  discipline,
}: {
  contestSlug: string
  discipline: Discipline
}) {
  const { data: roundSessionState, error } = await tryCatchTRPC(
    api.roundSession.state({ contestSlug, discipline }),
  )
  if (error?.code === 'NOT_FOUND') notFound()
  if (error?.code === 'UNAUTHORIZED')
    return <HintSignInSection description={CONTEST_UNAUTHORIZED_MESSAGE} />
  if (error?.code === 'FORBIDDEN')
    redirect(`/contests/${contestSlug}/results?discipline=${discipline}`)
  if (error) throw error

  return (
    <div className='flex-1 rounded-2xl bg-black-80'>
      <div className='relative flex h-full flex-col pb-8 pt-7 xl-short:pb-6 xl-short:pt-4 sm:py-3'>
        <div className='absolute right-4 top-4 flex items-center gap-4 sm:right-2 sm:top-2'>
          <Dialog>
            <KeyMapDialogTrigger className='touch:hidden' />
            <DialogPortal>
              <DialogOverlay className='bg-black-1000/40' withCubes={false} />
              <KeyMapDialogContent />
            </DialogPortal>
          </Dialog>
          <SecondaryButton asChild className='h-11 w-11 p-0 sm:h-11'>
            <Link href='/settings'>
              <SettingIcon />
            </Link>
          </SecondaryButton>
        </div>

        <p className='title-h2 mb-6 px-16 text-center text-secondary-20'>
          {getSplashText({ contestSlug, discipline })}
        </p>

        <SimulatorProvider>
          <SolveContestForm
            initialData={roundSessionState}
            contestSlug={contestSlug}
            discipline={discipline}
          />
        </SimulatorProvider>
      </div>
    </div>
  )
}

const SPLASH_TEXTS = [
  'You have five attempts to solve the contest',
  'GLHF!',
  'No DNFs today, huh?',
  "It's not a +2 if no one is watching, right?",
  'The cube just popped!',
  'Shaky hands?',
  'These are TNoodle scrambles btw',
  '8 seconds! 12 seconds! Go! Just kidding',
  "Feliks Zemdegs would've been proud of you",
  'Crazy finger tricks!',
  <>
    Check out{' '}
    <Link
      className='text-secondary-60 underline'
      href='https://js.cubing.net/cubing/'
    >
      cubing.js
    </Link>
  </>,
]
function getSplashText({
  contestSlug,
  discipline,
}: {
  contestSlug: string
  discipline: Discipline
}) {
  const random = seededRandom(contestSlug + discipline)
  const idx = Math.floor(random * SPLASH_TEXTS.length)
  return SPLASH_TEXTS[idx]
}

function seededRandom(seed: string) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0 // Convert to 32-bit integer
  }

  const x = Math.sin(hash) * 10000
  return x - Math.floor(x)
}
