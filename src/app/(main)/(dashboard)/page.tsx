import { auth } from '@/server/auth'
import { OngoingContestBanner } from './_components'
import { DashboardLists } from './_components/dashboard-lists'
import {
  LayoutHeaderTitlePortal,
  LayoutHeaderTitlePortalFallback,
} from '../_layout/layout-header'
import { withSuspense } from '@/app/_utils/with-suspense'
import { LoadingDots } from '@/app/_components/ui/loading-dots'

export default async function DashboardPage() {
  return (
    <>
      <h1 className='flex min-h-28 flex-shrink-0 items-center px-4 font-kanit text-secondary-20 xl-short:min-h-0 xl-short:py-2 lg:min-h-12 sm:min-h-10 sm:p-0'>
        <span className='text-[clamp(1.75rem,2.5vw,2.25rem)] lg:hidden'>
          Are you ready to take your love for cubing{' '}
          <span className='whitespace-nowrap'>to the next level?</span>
        </span>
        <PageTitle />
      </h1>
      <OngoingContestBanner />
      <DashboardLists />
    </>
  )
}

const PageTitle = withSuspense(
  async () => {
    const session = await auth()

    const title = session
      ? `Greetings, ${session.user.name}`
      : 'Greetings, speedcubers'

    return (
      <>
        <LayoutHeaderTitlePortal>{title}</LayoutHeaderTitlePortal>
        <span className='title-h1 sm:title-lg hidden lg:inline'>{title}</span>
      </>
    )
  },
  <>
    <LayoutHeaderTitlePortalFallback />
    <span className='sm:title-lg hidden items-center lg:inline-flex'>
      <LoadingDots />
    </span>
  </>,
)
