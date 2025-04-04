import { auth } from '@/server/auth'
import { OngoingContestBanner } from './_components'
import { DashboardLists } from './_components/dashboard-lists'

export default async function DashboardPage() {
  const session = await auth()

  const title = session
    ? `Greetings, ${session.user.name}`
    : 'Greetings, speedcubers'
  return (
    <>
      <h1 className='flex min-h-28 items-center px-4 font-kanit text-secondary-20 xl-short:min-h-0 xl-short:py-2 lg:min-h-0 sm:p-0'>
        <span className='text-[clamp(1.75rem,2.5vw,2.25rem)] lg:hidden'>
          Are you ready to take your love for cubing{' '}
          <span className='whitespace-nowrap'>to the next level?</span>
        </span>

        <span className='title-h1 sm:title-lg hidden lg:inline'>{title}</span>
      </h1>
      <OngoingContestBanner />
      <DashboardLists />
    </>
  )
}
