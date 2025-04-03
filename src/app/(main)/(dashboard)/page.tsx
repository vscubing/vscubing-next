import { PrimaryButton } from '../../_components/ui'
import { generateScrambles } from '../../../server/internal/generate-scrambles'
import { closeOngoingAndCreateNewContest } from '@/server/internal/close-ongoing-and-create-new-contest'

export default async function DashboardPage() {
  return (
    <>
      <main className='text-white flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]'>
        <form
          action={async () => {
            'use server'

            await closeOngoingAndCreateNewContest(['3by3', '2by2'])
          }}
        >
          <PrimaryButton type='submit'>Create a new contest</PrimaryButton>
        </form>
        <form
          action={async () => {
            'use server'
            console.log(await generateScrambles('3by3', 7))
            console.log(await generateScrambles('2by2', 7))
          }}
        >
          <PrimaryButton>Test generate scrambles</PrimaryButton>
        </form>
      </main>
    </>
  )
}
