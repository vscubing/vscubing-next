import { api } from '@/lib/trpc/server'
import { PersonalRecordsContent } from './personal-records-content'

export async function PersonalRecordsSection({ userId }: { userId: string }) {
  const records = await api.profile.getPersonalRecords({ userId })

  const hasAnyRecord = records.some((r) => r.single ?? r.average)

  if (!hasAnyRecord) {
    return (
      <div className='bg-black-80 flex flex-col items-center justify-center rounded-2xl p-6'>
        <p className='text-grey-40 text-base'>No personal records yet</p>
      </div>
    )
  }

  return (
    <div className='bg-black-80 flex flex-col rounded-2xl p-6 sm:p-4'>
      <h3 className='title-h3 mb-4'>Current personal records</h3>
      <PersonalRecordsContent records={records} />
    </div>
  )
}
