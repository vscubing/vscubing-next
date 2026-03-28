import { api } from '@/lib/trpc/server'
import { CompletedSolvesChart } from './completed-solves-chart'

export async function CompletedSolvesSection({ userId }: { userId: string }) {
  const data = await api.profile.getCompletedSolves({ userId })

  const total = data.reduce((sum, d) => sum + d.solveCount, 0)

  if (total === 0) {
    return (
      <div className='bg-black-80 flex flex-col items-center justify-center rounded-2xl p-6'>
        <p className='text-grey-40 text-base'>No completed solves yet</p>
      </div>
    )
  }

  return (
    <div className='bg-black-80 flex items-center justify-center rounded-2xl p-6 sm:p-4'>
      <CompletedSolvesChart data={data} total={total} />
    </div>
  )
}
