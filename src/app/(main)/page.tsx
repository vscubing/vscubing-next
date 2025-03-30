import { Header } from '../_components/layout'
import { closeOngoingAndCreateNewContest } from '@/server/api/routers/contest'
import { PrimaryButton } from '../_components/ui'

export default async function DashboardPage() {
  return (
    <>
      <Header />
      <main className='text-white flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]'>
        <form
          action={async () => {
            'use server'

            await closeOngoingAndCreateNewContest(['3by3', '2by2'])
          }}
        >
          <PrimaryButton type='submit'>Create a new contest</PrimaryButton>
        </form>
      </main>
    </>
  )
}
